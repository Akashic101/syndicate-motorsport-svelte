<script lang="ts">
	import type { RaceSession, RaceCar, RaceLap } from '$lib/races';
	import type { Driver } from '$lib/drivers';
	import type { Championship } from '$lib/types';
	import { Table } from '@flowbite-svelte-plugins/datatable';
	import type { DataTableOptions } from '@flowbite-svelte-plugins/datatable';
	import { onMount } from 'svelte';
	import { getFixedTrackName } from '$lib/trackAliases';
	import { getFixedCarName } from '$lib/carAliases';

	let { data } = $props<{
		data: {
			race: RaceSession;
			cars: RaceCar[];
			laps: RaceLap[];
			driversMap: Record<string, Driver>;
			championship: Championship | null;
			trackAliasMap: Record<string, string>;
			carAliasMap: Record<string, string>;
		};
	}>();
	let race = $derived(data.race);
	let cars = $derived(data.cars);
	let laps = $derived(data.laps);
	let driversMap = $derived(data.driversMap);
	let championship = $derived(data.championship);

	// Format date for display (user's local style)
	function formatDate(dateString: string | null): string {
		if (!dateString) return 'N/A';
		try {
			const date = new Date(dateString);
			return date.toLocaleString(undefined, {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return 'Invalid Date';
		}
	}

	// Format lap time (milliseconds to mm:ss.SSS)
	function formatLapTime(ms: number | null): string {
		if (ms === null || ms === undefined) return 'N/A';
		const totalSeconds = Math.floor(ms / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		const milliseconds = ms % 1000;
		return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
	}

	// Format sector time (milliseconds to mm:ss.SSS)
	function formatSectorTime(ms: number | null): string {
		if (ms === null || ms === undefined) return 'N/A';
		const totalSeconds = Math.floor(ms / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		const milliseconds = ms % 1000;
		return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
	}

	// Get driver name helper
	function getDriverName(driverGUID: string | null): string {
		if (!driverGUID) return 'Unknown Driver';
		const driver = driversMap[driverGUID];
		return driver?.driver || `Driver ${driverGUID.substring(0, 8)}...`;
	}

	// Group laps by driver GUID and car ID
	interface DriverLapGroup {
		driverGUID: string;
		driverName: string;
		car: RaceCar | null;
		laps: RaceLap[];
		tableData: Array<Record<string, any>>;
		fastestLap: number | null;
		fastestSector1: number | null;
		fastestSector2: number | null;
		fastestSector3: number | null;
	}

	// Get unique ID for driver lap section
	function getDriverLapSectionId(driverGUID: string | null, carId: number | null): string {
		if (!driverGUID || driverGUID === 'unknown') return 'unknown';
		const safeGUID = driverGUID.replace(/[^a-zA-Z0-9]/g, '_');
		const carPart = carId !== null ? `_${carId}` : '';
		return `driver-laps-${safeGUID}${carPart}`;
	}

	// Transform laps to table data (store raw values, not HTML)
	let lapsByDriver = $derived.by(() => {
		const groups = new Map<string, DriverLapGroup>();

		// Process each lap
		for (const lap of laps) {
			const driverGUID = lap.driver_guid || 'unknown';
			const key = `${driverGUID}_${lap.car_id}`;

			if (!groups.has(key)) {
				const car = cars.find((c: RaceCar) => c.id === lap.car_id) || null;
				groups.set(key, {
					driverGUID,
					driverName: getDriverName(driverGUID),
					car,
					laps: [],
					tableData: [],
					fastestLap: null,
					fastestSector1: null,
					fastestSector2: null,
					fastestSector3: null
				});
			}

			groups.get(key)!.laps.push(lap);
		}

		// Sort laps by timestamp for each driver and create table data
		for (const group of groups.values()) {
			group.laps.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

			// Calculate fastest lap time for this driver
			const validLapTimes = group.laps
				.map((lap) => lap.lap_time)
				.filter((time): time is number => time !== null && time !== undefined);
			group.fastestLap = validLapTimes.length > 0 ? Math.min(...validLapTimes) : null;

			// Calculate fastest sector times for this driver
			const validSector1 = group.laps
				.map((lap) => lap.sector1)
				.filter((time): time is number => time !== null && time !== undefined);
			const validSector2 = group.laps
				.map((lap) => lap.sector2)
				.filter((time): time is number => time !== null && time !== undefined);
			const validSector3 = group.laps
				.map((lap) => lap.sector3)
				.filter((time): time is number => time !== null && time !== undefined);

			group.fastestSector1 = validSector1.length > 0 ? Math.min(...validSector1) : null;
			group.fastestSector2 = validSector2.length > 0 ? Math.min(...validSector2) : null;
			group.fastestSector3 = validSector3.length > 0 ? Math.min(...validSector3) : null;

			// Helper function to format time with highlighting if fastest
			const formatTimeWithHighlight = (
				time: number | null,
				fastestTime: number | null,
				formatter: (ms: number | null) => string
			): string => {
				const formatted = formatter(time);
				if (formatted === 'N/A') return formatted;
				// Check if this time matches the fastest for this driver
				if (fastestTime !== null && time !== null && time === fastestTime) {
					return `<span class="text-green-600 dark:text-green-400 font-semibold">${formatted}</span>`;
				}
				return formatted;
			};

			// Transform laps to table data (highlight fastest lap and sectors)
			group.tableData = group.laps.map((lap, index) => ({
				'Lap #': index + 1,
				'Lap Time': formatTimeWithHighlight(lap.lap_time, group.fastestLap, formatLapTime),
				'Sector 1': formatTimeWithHighlight(lap.sector1, group.fastestSector1, formatSectorTime),
				'Sector 2': formatTimeWithHighlight(lap.sector2, group.fastestSector2, formatSectorTime),
				'Sector 3': formatTimeWithHighlight(lap.sector3, group.fastestSector3, formatSectorTime),
				Tyre: lap.tyre ?? 'N/A',
				Cuts: lap.cuts ?? 0
			}));
		}

		// Convert to array - will be sorted by finishing position later
		return Array.from(groups.values());
	});

	// Render function that passes through HTML (for time columns)
	const renderHtml = (data: any) => {
		return data || 'N/A';
	};

	// DataTable options for laps
	const lapsTableOptions: DataTableOptions = {
		paging: false,
		searchable: false,
		columns: [
			{ select: 1, render: renderHtml, type: 'string' }, // Lap Time with HTML highlighting
			{ select: 2, render: renderHtml, type: 'string' }, // Sector 1 with HTML highlighting
			{ select: 3, render: renderHtml, type: 'string' }, // Sector 2 with HTML highlighting
			{ select: 4, render: renderHtml, type: 'string' } // Sector 3 with HTML highlighting
		]
	};

	// Calculate finishing positions based on:
	// 1. Most laps completed
	// 2. Among same lap count, earliest last lap timestamp
	interface FinishingPosition {
		position: number;
		driverGUID: string;
		driverName: string;
		car: RaceCar | null;
		totalLaps: number;
		lastLapTimestamp: number | null;
		totalRaceTime: number | null; // Sum of all lap times
		fastestLap: number | null;
	}

	let finishingPositionsData = $derived.by(() => {
		const positions: Omit<FinishingPosition, 'position'>[] = [];

		// Calculate for each driver/car combination
		for (const group of lapsByDriver) {
			const sortedLaps = [...group.laps].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
			const lastLap = sortedLaps[sortedLaps.length - 1];
			const validLapTimes = sortedLaps
				.map((lap) => lap.lap_time)
				.filter((time): time is number => time !== null && time !== undefined);

			const fastestLap = validLapTimes.length > 0 ? Math.min(...validLapTimes) : null;
			const totalRaceTime =
				validLapTimes.length > 0 ? validLapTimes.reduce((sum, time) => sum + time, 0) : null;

			positions.push({
				driverGUID: group.driverGUID,
				driverName: group.driverName,
				car: group.car,
				totalLaps: sortedLaps.length,
				lastLapTimestamp: lastLap?.timestamp || null,
				totalRaceTime,
				fastestLap
			});
		}

		// Sort by finishing position:
		// 1. Most laps first (descending)
		// 2. Among same lap count, earliest last lap timestamp (ascending)
		positions.sort((a, b) => {
			// First sort by total laps (more laps = better)
			if (b.totalLaps !== a.totalLaps) {
				return b.totalLaps - a.totalLaps;
			}
			// If same number of laps, sort by last lap timestamp (earlier = better)
			const aTime = a.lastLapTimestamp || Infinity;
			const bTime = b.lastLapTimestamp || Infinity;
			return aTime - bTime;
		});

		// Assign positions and create FinishingPosition array
		const finalPositions = positions.map((pos, index) => ({
			...pos,
			position: index + 1
		}));

		// Create a map for quick lookup by driver/car key
		const positionMap = new Map<string, FinishingPosition>();
		finalPositions.forEach((pos) => {
			const key = `${pos.driverGUID}_${pos.car?.car_id ?? 'unknown'}`;
			positionMap.set(key, pos);
		});

		// Sort lapsByDriver by finishing position
		const sortedLapsByDriver = Array.from(lapsByDriver).sort((a, b) => {
			const keyA = `${a.driverGUID}_${a.car?.car_id ?? 'unknown'}`;
			const keyB = `${b.driverGUID}_${b.car?.car_id ?? 'unknown'}`;
			const posA = positionMap.get(keyA)?.position ?? Infinity;
			const posB = positionMap.get(keyB)?.position ?? Infinity;
			return posA - posB;
		});

		return { positions: finalPositions, sortedLapsByDriver };
	});

	// Extract positions and sorted laps
	let finishingPositions = $derived(finishingPositionsData.positions);
	let lapsByDriverSorted = $derived(finishingPositionsData.sortedLapsByDriver);

	// Transform finishing positions for DataTable (includes car info from Race Cars)
	let resultsTableData = $derived(
		finishingPositions.map((pos) => ({
			Position: pos.position,
			Driver: pos.driverName,
			'Total Laps': pos.totalLaps,
			'Fastest Lap': pos.fastestLap ? formatLapTime(pos.fastestLap) : 'N/A',
			'Total Race Time': pos.totalRaceTime ? formatLapTime(pos.totalRaceTime) : 'N/A',
			Model: pos.car?.model ? (getFixedCarName(pos.car.model, data.carAliasMap) ?? 'N/A') : 'N/A',
			'Ballast (kg)': pos.car?.ballast_kg ?? 'N/A',
			DriverGUID: pos.driverGUID,
			CarID: pos.car?.car_id ?? -1, // Use -1 instead of null for table compatibility
			Actions: `${pos.driverGUID || 'unknown'}_${pos.car?.car_id ?? -1}` // Store identifier for lookup
		}))
	);

	// Render driver name as link in results (similar to drivers page)
	const renderResultsDriverName = (data: any) => {
		// Find the position that matches this driver name
		const pos = finishingPositions.find((p) => p.driverName === data);
		if (!pos || !pos.driverGUID || pos.driverGUID === 'unknown') return data || 'N/A';
		return `<a data-umami-event="navigate-to-driver-details" data-umami-event-driver-guid="${pos.driverGUID}" href="/driver/${pos.driverGUID}" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">${data}</a>`;
	};

	// Render button to jump to driver's lap table in results
	const renderResultsViewLapsButton = (data: any) => {
		// data contains the identifier we stored: driverGUID_carId
		const parts = String(data).split('_');
		if (parts.length < 2 || parts[0] === 'unknown' || parts[1] === '-1') return 'N/A';
		const driverGUID = parts[0];
		const carId = parseInt(parts[1]);
		if (isNaN(carId)) return 'N/A';
		const sectionId = getDriverLapSectionId(driverGUID, carId);
		// Use anchor tag with href to hash - this works better than onclick in rendered HTML
		return `<a href="#${sectionId}" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-block text-center no-underline">View Laps</a>`;
	};

	// DataTable options for results
	const resultsTableOptions: DataTableOptions = {
		paging: false,
		searchable: false,
		columns: [
			{ select: 1, render: renderResultsDriverName, type: 'string' }, // Driver name with link
			{ select: 5, hidden: true }, // Hide Model
			{ select: 6, hidden: true }, // Hide DriverGUID
			{ select: 7, hidden: true }, // Hide CarID
			{ select: 8, hidden: true }, // Hide CarID
			{ select: 9, render: renderResultsViewLapsButton, type: 'string' } // Actions button - use string like drivers page
		]
	};

	// Attach smooth scroll behavior to anchor links after table renders
	onMount(() => {
		setTimeout(() => {
			document.querySelectorAll('a[href^="#driver-laps-"]').forEach((link) => {
				link.addEventListener('click', (e) => {
					e.preventDefault();
					const targetId = link.getAttribute('href')?.substring(1);
					if (targetId) {
						const target = document.getElementById(targetId);
						target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
					}
				});
			});
		}, 100);
	});
</script>

<svelte:head>
	<title>Race #{race.id} - Syndicate Motorsport</title>
	<meta name="description" content={`Race session details for ${race.session_file || 'race'}`} />
</svelte:head>

<div class="m-8 mx-auto max-w-7xl">
	<a
		href="/race"
		class="mb-4 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
	>
		← Back to Races
	</a>

	<div class="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
		<h1 class="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
			{race.event_name || `Race Session #${race.id}`}
		</h1>

		<!-- Race Session Information -->
		<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Race Date</p>
					<p class="text-lg font-semibold text-gray-900 dark:text-white">
						{formatDate(race.race_date)}
					</p>
				</div>

				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Track Name</p>
					<p class="text-lg font-semibold text-gray-900 dark:text-white">
						{getFixedTrackName(race.track_name, data.trackAliasMap) || 'N/A'}
					</p>
				</div>

				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Track Config</p>
					<p class="text-lg font-semibold text-gray-900 dark:text-white">
						{race.track_config || 'N/A'}
					</p>
				</div>
			</div>

			<div class="space-y-4">
				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Championship</p>
					<p class="text-lg font-semibold text-gray-900 dark:text-white">
						{#if championship && race.championship_id}
							<a
								href="/events-and-leagues/{race.championship_id}"
								class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
							>
								{championship.name || race.championship_id}
							</a>
						{:else if race.championship_id}
							{race.championship_id}
						{:else}
							N/A
						{/if}
					</p>
				</div>

				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
					<p class="text-lg font-semibold text-gray-900 capitalize dark:text-white">
						{race.type.toLowerCase() || 'N/A'}
					</p>
				</div>

				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Session File</p>
					<p class="text-lg font-semibold text-gray-900 dark:text-white">
						{race.session_file || 'N/A'}
					</p>
				</div>
			</div>
		</div>

		<!-- Race Statistics -->
		<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
			<div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
				<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Drivers</p>
				<p class="text-2xl font-bold text-gray-900 dark:text-white">{finishingPositions.length}</p>
			</div>
			<div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
				<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Laps</p>
				<p class="text-2xl font-bold text-gray-900 dark:text-white">{laps.length}</p>
			</div>
			<div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
				<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Fastest Lap</p>
				<p class="text-2xl font-bold text-gray-900 dark:text-white">
					{#if laps.length > 0}
						{formatLapTime(
							Math.min(
								...laps
									.map((l: RaceLap) => l.lap_time)
									.filter((t: number | null): t is number => t !== null)
							)
						)}
					{:else}
						N/A
					{/if}
				</p>
			</div>
		</div>

		<!-- Race Results Section (merged with Race Cars - only shows drivers who completed laps) -->
		{#if laps.length > 0 && finishingPositions.length > 0}
			<div class="mb-8">
				<h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Race Results</h2>
				<Table items={resultsTableData} dataTableOptions={resultsTableOptions} />
			</div>
		{:else if cars.length > 0}
			<div class="mb-8">
				<h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Race Results</h2>
				<p class="py-4 text-center text-gray-400">No lap data available to determine results.</p>
			</div>
		{/if}

		<!-- Race Laps Section - Grouped by Driver -->
		<div class="mb-8">
			<h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Race Laps</h2>
			{#if laps.length === 0}
				<p class="py-4 text-center text-gray-400">No laps data available.</p>
			{:else}
				{#each lapsByDriverSorted as group}
					{@const sectionId = getDriverLapSectionId(group.driverGUID, group.car?.car_id ?? null)}
					{@const theoreticalFastest =
						group.fastestSector1 !== null &&
						group.fastestSector2 !== null &&
						group.fastestSector3 !== null
							? group.fastestSector1 + group.fastestSector2 + group.fastestSector3
							: null}
					<div
						id={sectionId}
						class="mb-8 scroll-mt-8 rounded-lg border border-gray-200 p-6 dark:border-gray-700"
					>
						<div class="mb-4 flex items-center justify-between">
							<h3 class="text-xl font-semibold text-gray-900 dark:text-white">
								{#if group.driverGUID && group.driverGUID !== 'unknown'}
									<a
										href="/driver/{group.driverGUID}"
										class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
									>
										{group.driverName}
									</a>
								{:else}
									{group.driverName}
								{/if}
							</h3>
							<div class="flex flex-col items-end gap-1">
								{#if theoreticalFastest !== null}
									<div class="text-sm font-medium text-gray-700 dark:text-gray-300">
										<span class="text-gray-500 dark:text-gray-400">Theoretical Fastest: </span>
										<span class="font-semibold">
											{formatLapTime(theoreticalFastest)}
										</span>
									</div>
								{/if}
								<div class="text-sm text-gray-500 dark:text-gray-400">
									{#if group.car}
										<span>Car #{group.car.car_id}</span>
										{#if group.car.model}
											<span class="mx-2">•</span>
											<span
												>{getFixedCarName(group.car.model, data.carAliasMap) ||
													group.car.model}</span
											>
										{/if}
									{/if}
									<span class="mx-2">•</span>
									<span>{group.laps.length} {group.laps.length === 1 ? 'lap' : 'laps'}</span>
								</div>
							</div>
						</div>
						<Table items={group.tableData} dataTableOptions={lapsTableOptions} />
					</div>
				{/each}
			{/if}
		</div>

		<!-- Weather Conditions Section (from first lap if available) -->
		{#if laps.length > 0}
			{@const firstLap = laps[0]}
			{#if firstLap.ambient !== null || firstLap.road !== null || firstLap.grip !== null}
				<div class="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
					<h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Weather Conditions</h2>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						<div>
							<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Ambient Temp</p>
							<p class="text-lg font-semibold text-gray-900 dark:text-white">
								{firstLap.ambient ?? 'N/A'}°C
							</p>
						</div>
						<div>
							<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Road Temp</p>
							<p class="text-lg font-semibold text-gray-900 dark:text-white">
								{firstLap.road ?? 'N/A'}°C
							</p>
						</div>
						<div>
							<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Grip</p>
							<p class="text-lg font-semibold text-gray-900 dark:text-white">
								{firstLap.grip?.toFixed(2) ?? 'N/A'}
							</p>
						</div>
						<div>
							<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Wind Speed</p>
							<p class="text-lg font-semibold text-gray-900 dark:text-white">
								{firstLap.wind_speed ?? 'N/A'} km/h
							</p>
						</div>
						<div>
							<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Wind Direction</p>
							<p class="text-lg font-semibold text-gray-900 dark:text-white">
								{firstLap.wind_direction ?? 'N/A'}°
							</p>
						</div>
						<div>
							<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Rain Intensity</p>
							<p class="text-lg font-semibold text-gray-900 dark:text-white">
								{firstLap.rain_intensity ?? 'N/A'}
							</p>
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>
