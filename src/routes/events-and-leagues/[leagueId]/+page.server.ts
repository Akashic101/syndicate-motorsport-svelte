import type { PageServerLoad } from './$types';
import { getChampionshipByChampionshipId } from '$lib/championships';
import { getServerById } from '$lib/servers';
import {
	getRaceSessionsByChampionshipId,
	getRaceCarsBySessionId,
	getRaceLapsBySessionId
} from '$lib/races';
import type { RaceSession, RaceCar, RaceLap } from '$lib/types';
import { getDriversByGUIDs } from '$lib/drivers';
import { getAllTrackAliases, createTrackAliasObject } from '$lib/trackAliases';
import { getAllCarAliases, createCarAliasObject } from '$lib/carAliases';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const leagueId = params.leagueId;

		// Get championship info from database using championship_id (UUID)
		const championshipData = await getChampionshipByChampionshipId(leagueId);

		if (!championshipData) {
			throw new Error(`Championship not found for ID: ${leagueId}`);
		}

		if (!championshipData.server) {
			throw new Error(
				`Server ID not configured for championship: ${championshipData.name || leagueId}`
			);
		}

		// Get server configuration from database using server ID
		const serverId = championshipData.server;

		if (!serverId) {
			throw new Error(`Server ID not found for championship: ${championshipData.name || leagueId}`);
		}

		const serverData = await getServerById(serverId);

		if (!serverData || !serverData.cookie || !serverData.url) {
			throw new Error(
				`Server configuration not found or cookies/URL not configured for server ID: ${serverId}`
			);
		}

		// API endpoint for championship standings using championship_id from URL
		// Remove trailing slash from server URL to avoid double slashes
		const baseUrl = serverData.url.endsWith('/') ? serverData.url.slice(0, -1) : serverData.url;
		const apiUrl = `${baseUrl}/championship/${leagueId}/standings.json`;

		// Use cookies from database
		const cookies = serverData.cookie;

		const response = await fetch(apiUrl, {
			headers: {
				Cookie: cookies,
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
			}
		});

		if (!response.ok) {
			throw new Error(
				`Failed to fetch championship data: ${response.status} ${response.statusText}`
			);
		}

		const apiData = await response.json();

		// Process driver standings data - handle multiple data structures
		let driverStandings = [];
		if (apiData.DriverStandings) {
			// Try different possible keys for driver standings
			const possibleKeys = [
				'',
				'All',
				'Super GT Vs DTM',
				'Rookies',
				'GT500',
				'60s WSC 2L',
				'TCL 70s',
				'1923 GP',
				'WSC 1967 5L+'
			];
			for (const key of possibleKeys) {
				if (apiData.DriverStandings[key]) {
					driverStandings = apiData.DriverStandings[key];
					break;
				}
			}
		}

		const drivers = driverStandings.map((driver: any, index: number) => ({
			position: index + 1,
			name: driver.Car.Driver.Name,
			team: driver.Car.Driver.Team || '',
			nation: driver.Car.Driver.Nation || '',
			car: driver.Car.Model,
			points: driver.Points,
			ballast: driver.Car.BallastKG,
			restrictor: driver.Car.Restrictor
		}));

		// Process team standings data - handle multiple data structures
		let teamStandings = [];
		if (apiData.TeamStandings) {
			// Try different possible keys for team standings
			const possibleKeys = [
				'',
				'All',
				'Super GT Vs DTM',
				'Rookies',
				'GT500',
				'60s WSC 2L',
				'TCL 70s',
				'1923 GP',
				'WSC 1967 5L+'
			];
			for (const key of possibleKeys) {
				if (apiData.TeamStandings[key]) {
					teamStandings = apiData.TeamStandings[key];
					break;
				}
			}
		}

		const teams = teamStandings.map((team: any, index: number) => ({
			position: index + 1,
			name: team.Team,
			points: team.Points
		}));

		// Use championship data from database
		const championship = championshipData;

		// Fetch races for this championship
		const races = await getRaceSessionsByChampionshipId(leagueId);

		// Calculate podium (top 3) for each race
		interface PodiumDriver {
			position: number;
			driverName: string;
			driverGUID: string | null;
		}

		const racesWithPodiums = await Promise.all(
			races.map(async (race) => {
				try {
					// Fetch cars and laps for this race
					const [cars, laps] = await Promise.all([
						getRaceCarsBySessionId(race.id),
						getRaceLapsBySessionId(race.id)
					]);

					if (laps.length === 0) {
						return { race, podium: [] as PodiumDriver[] };
					}

					// Get unique driver GUIDs
					const driverGUIDs = [
						...new Set([
							...cars.map((car) => car.driver_guid).filter((guid): guid is string => guid !== null),
							...laps.map((lap) => lap.driver_guid).filter((guid): guid is string => guid !== null)
						])
					];

					// Fetch driver information
					const driversMap = await getDriversByGUIDs(driverGUIDs);
					const driversByName = Object.fromEntries(driversMap);

					// Group laps by driver/car
					const groups = new Map<
						string,
						{ driverGUID: string; car: RaceCar | null; laps: RaceLap[] }
					>();

					for (const lap of laps) {
						const driverGUID = lap.driver_guid || 'unknown';
						const key = `${driverGUID}_${lap.car_id}`;

						if (!groups.has(key)) {
							const car = cars.find((c: RaceCar) => c.id === lap.car_id) || null;
							groups.set(key, {
								driverGUID,
								car,
								laps: []
							});
						}

						groups.get(key)!.laps.push(lap);
					}

					// Calculate positions
					const positions = Array.from(groups.values())
						.filter((group) => group.laps.length > 0) // Only include drivers with laps
						.map((group) => {
							const sortedLaps = [...group.laps].sort(
								(a, b) => (a.timestamp || 0) - (b.timestamp || 0)
							);
							const lastLap = sortedLaps[sortedLaps.length - 1];
							const driver = driversByName[group.driverGUID];
							const driverName =
								driver?.driver ||
								(group.driverGUID !== 'unknown'
									? `Driver ${group.driverGUID.substring(0, 8)}...`
									: 'Unknown Driver');

							return {
								driverGUID: group.driverGUID === 'unknown' ? null : group.driverGUID,
								driverName,
								car: group.car,
								totalLaps: sortedLaps.length,
								lastLapTimestamp: lastLap?.timestamp || null
							};
						});

					// Sort by finishing position
					positions.sort((a, b) => {
						if (b.totalLaps !== a.totalLaps) {
							return b.totalLaps - a.totalLaps;
						}
						const aTime = a.lastLapTimestamp || Infinity;
						const bTime = b.lastLapTimestamp || Infinity;
						return aTime - bTime;
					});

					// Get top 3 (podium)
					const podium: PodiumDriver[] = positions.slice(0, 3).map((pos, index) => ({
						position: index + 1,
						driverName: pos.driverName,
						driverGUID: pos.driverGUID
					}));

					return {
						race,
						podium
					};
				} catch (error) {
					console.error(`Error calculating podium for race ${race.id}:`, error);
					return { race, podium: [] as PodiumDriver[] };
				}
			})
		);

		// Calculate stats
		const stats = {
			driverCount: drivers.length,
			teamCount: teams.length
		};

		// Fetch track aliases and car aliases once and create objects (for SvelteKit serialization)
		const [trackAliases, carAliases] = await Promise.all([
			getAllTrackAliases(),
			getAllCarAliases()
		]);
		const trackAliasMap = createTrackAliasObject(trackAliases);
		const carAliasMap = createCarAliasObject(carAliases);

		return {
			championship,
			drivers,
			teams,
			races: racesWithPodiums,
			stats,
			trackAliasMap,
			carAliasMap
		};
	} catch (error) {
		console.error('Error loading league data:', error);
		throw error;
	}
};
