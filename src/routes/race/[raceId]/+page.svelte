<script lang="ts">
	import type { RaceSession, RaceCar, RaceLap } from '$lib/races';
	import type { Driver } from '$lib/drivers';
	import {
		Table as DefaultTable,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';

	let { data } = $props<{
		data: {
			race: RaceSession;
			cars: RaceCar[];
			laps: RaceLap[];
			driversMap: Record<string, Driver>;
		};
	}>();
	let race = $derived(data.race);
	let cars = $derived(data.cars);
	let laps = $derived(data.laps);
	let driversMap = $derived(data.driversMap);

	// Format date for display
	function formatDate(dateString: string | null): string {
		if (!dateString) return 'N/A';
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', {
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
	}

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
					laps: []
				});
			}

			groups.get(key)!.laps.push(lap);
		}

		// Sort laps by timestamp for each driver
		for (const group of groups.values()) {
			group.laps.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
		}

		// Convert to array and sort by driver name
		return Array.from(groups.values()).sort((a, b) =>
			a.driverName.localeCompare(b.driverName)
		);
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
			Race Session #{race.id}
		</h1>

		<!-- Race Session Information -->
		<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Session File</p>
					<p class="text-lg font-semibold text-gray-900 dark:text-white">
						{race.session_file || 'N/A'}
					</p>
				</div>

				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Race Date</p>
					<p class="text-lg font-semibold text-gray-900 dark:text-white">
						{formatDate(race.race_date)}
					</p>
				</div>
			</div>

			<div class="space-y-4">
				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Version</p>
					<p class="text-lg font-semibold text-gray-900 dark:text-white">
						{race.version || 'N/A'}
					</p>
				</div>

				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Championship ID</p>
					<p class="text-lg font-semibold text-gray-900 dark:text-white">
						{race.championship_id || 'N/A'}
					</p>
				</div>
			</div>
		</div>

		<!-- Race Statistics -->
		<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
			<div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
				<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cars</p>
				<p class="text-2xl font-bold text-gray-900 dark:text-white">{cars.length}</p>
			</div>
			<div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
				<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Laps</p>
				<p class="text-2xl font-bold text-gray-900 dark:text-white">{laps.length}</p>
			</div>
			<div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
				<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Fastest Lap</p>
				<p class="text-2xl font-bold text-gray-900 dark:text-white">
					{#if laps.length > 0}
						{formatLapTime(Math.min(...laps.map((l: RaceLap) => l.lap_time).filter((t: number | null): t is number => t !== null)))}
					{:else}
						N/A
					{/if}
				</p>
			</div>
		</div>

		<!-- Race Cars Section -->
		<div class="mb-8">
			<h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Race Cars</h2>
			{#if cars.length === 0}
				<p class="py-4 text-center text-gray-400">No cars data available.</p>
			{:else}
				<div class="overflow-x-auto">
					<DefaultTable>
						<TableHead>
							<TableHeadCell>Car ID</TableHeadCell>
							<TableHeadCell>Driver GUID</TableHeadCell>
							<TableHeadCell>Model</TableHeadCell>
							<TableHeadCell>Skin</TableHeadCell>
							<TableHeadCell>Ballast (kg)</TableHeadCell>
							<TableHeadCell>Restrictor</TableHeadCell>
							<TableHeadCell>Min Ping</TableHeadCell>
							<TableHeadCell>Max Ping</TableHeadCell>
						</TableHead>
						<TableBody>
							{#each cars as car}
								<TableBodyRow>
									<TableBodyCell>{car.car_id ?? 'N/A'}</TableBodyCell>
									<TableBodyCell>
										{#if car.driver_guid}
											<a
												href="/driver/{car.driver_guid}"
												class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
											>
												{car.driver_guid.substring(0, 8)}...
											</a>
										{:else}
											N/A
										{/if}
									</TableBodyCell>
									<TableBodyCell>{car.model ?? 'N/A'}</TableBodyCell>
									<TableBodyCell>{car.skin ?? 'N/A'}</TableBodyCell>
									<TableBodyCell>{car.ballast_kg ?? 'N/A'}</TableBodyCell>
									<TableBodyCell>{car.restrictor ?? 'N/A'}</TableBodyCell>
									<TableBodyCell>{car.min_ping ?? 'N/A'}</TableBodyCell>
									<TableBodyCell>{car.max_ping ?? 'N/A'}</TableBodyCell>
								</TableBodyRow>
							{/each}
						</TableBody>
					</DefaultTable>
				</div>
			{/if}
		</div>

		<!-- Race Laps Section - Grouped by Driver -->
		<div class="mb-8">
			<h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Race Laps</h2>
			{#if laps.length === 0}
				<p class="py-4 text-center text-gray-400">No laps data available.</p>
			{:else}
				{#each lapsByDriver as group}
					<div class="mb-8 rounded-lg border border-gray-200 p-6 dark:border-gray-700">
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
							<div class="text-sm text-gray-500 dark:text-gray-400">
								{#if group.car}
									<span>Car #{group.car.car_id}</span>
									{#if group.car.model}
										<span class="mx-2">•</span>
										<span>{group.car.model}</span>
									{/if}
								{/if}
								<span class="mx-2">•</span>
								<span>{group.laps.length} {group.laps.length === 1 ? 'lap' : 'laps'}</span>
							</div>
						</div>
						<div class="overflow-x-auto">
							<DefaultTable>
								<TableHead>
									<TableHeadCell>Lap #</TableHeadCell>
									<TableHeadCell>Lap Time</TableHeadCell>
									<TableHeadCell>Sector 1</TableHeadCell>
									<TableHeadCell>Sector 2</TableHeadCell>
									<TableHeadCell>Sector 3</TableHeadCell>
									<TableHeadCell>Tyre</TableHeadCell>
									<TableHeadCell>Cuts</TableHeadCell>
									<TableHeadCell>Fastest</TableHeadCell>
								</TableHead>
								<TableBody>
									{#each group.laps as lap, index}
										<TableBodyRow>
											<TableBodyCell>{index + 1}</TableBodyCell>
											<TableBodyCell>{formatLapTime(lap.lap_time)}</TableBodyCell>
											<TableBodyCell>{formatSectorTime(lap.sector1)}</TableBodyCell>
											<TableBodyCell>{formatSectorTime(lap.sector2)}</TableBodyCell>
											<TableBodyCell>{formatSectorTime(lap.sector3)}</TableBodyCell>
											<TableBodyCell>{lap.tyre ?? 'N/A'}</TableBodyCell>
											<TableBodyCell>{lap.cuts ?? 0}</TableBodyCell>
											<TableBodyCell>
												{#if lap.contributed_to_fastest_lap}
													<span class="text-green-600 dark:text-green-400">✓</span>
												{:else}
													—
												{/if}
											</TableBodyCell>
										</TableBodyRow>
									{/each}
								</TableBody>
							</DefaultTable>
						</div>
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

