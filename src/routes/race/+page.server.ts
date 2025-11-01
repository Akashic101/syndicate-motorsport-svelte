import type { PageServerLoad } from './$types';
import {
	getAllRaceSessions,
	getRaceCarsBySessionId,
	getRaceLapsBySessionId,
	type RaceSession,
	type RaceCar,
	type RaceLap
} from '$lib/races';
import { getChampionshipByChampionshipId } from '$lib/championships';
import { getDriversByGUIDs } from '$lib/drivers';
import { getAllTrackAliases, createTrackAliasObject } from '$lib/trackAliases';

interface RaceWithDetails {
	race: RaceSession;
	championship: { id: string; name: string } | null;
	podium: Array<{ position: number; driverName: string; driverGUID: string | null }>;
	fastestLap: number | null; // in milliseconds
}

export const load: PageServerLoad = async () => {
	try {
		const races: RaceSession[] = await getAllRaceSessions();

		// Calculate podium and fastest lap for each race
		const racesWithDetails = await Promise.all(
			races.map(async (race): Promise<RaceWithDetails> => {
				try {
					// Fetch championship if exists
					let championship = null;
					if (race.championship_id) {
						const champ = await getChampionshipByChampionshipId(race.championship_id);
						if (champ) {
							championship = { id: race.championship_id, name: champ.name };
						}
					}

					// Fetch cars and laps
					const [cars, laps] = await Promise.all([
						getRaceCarsBySessionId(race.id),
						getRaceLapsBySessionId(race.id)
					]);

					if (laps.length === 0) {
						return {
							race,
							championship,
							podium: [],
							fastestLap: null
						};
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

					// Calculate positions and fastest lap
					const positions = Array.from(groups.values())
						.filter((group) => group.laps.length > 0)
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

							const validLapTimes = sortedLaps
								.map((lap) => lap.lap_time)
								.filter((time): time is number => time !== null && time !== undefined);

							return {
								driverGUID: group.driverGUID === 'unknown' ? null : group.driverGUID,
								driverName,
								car: group.car,
								totalLaps: sortedLaps.length,
								lastLapTimestamp: lastLap?.timestamp || null,
								fastestLap: validLapTimes.length > 0 ? Math.min(...validLapTimes) : null
							};
						});

					// Calculate fastest lap across all drivers
					const allFastestLaps = positions
						.map((p) => p.fastestLap)
						.filter((time): time is number => time !== null && time !== undefined);
					const overallFastestLap = allFastestLaps.length > 0 ? Math.min(...allFastestLaps) : null;

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
					const podium = positions.slice(0, 3).map((pos, index) => ({
						position: index + 1,
						driverName: pos.driverName,
						driverGUID: pos.driverGUID
					}));

					return {
						race,
						championship,
						podium,
						fastestLap: overallFastestLap
					};
				} catch (error) {
					console.error(`Error calculating details for race ${race.id}:`, error);
					return {
						race,
						championship: null,
						podium: [],
						fastestLap: null
					};
				}
			})
		);

		// Fetch track aliases once and create object (for SvelteKit serialization)
		const trackAliases = await getAllTrackAliases();
		const trackAliasMap = createTrackAliasObject(trackAliases);

		return { races: racesWithDetails, trackAliasMap };
	} catch (err) {
		console.error('Error loading races from Supabase:', err);
		return { races: [], trackAliasMap: {} };
	}
};
