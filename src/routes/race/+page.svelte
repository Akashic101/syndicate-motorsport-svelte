<script lang="ts">
	import type { RaceSession } from '$lib/races';
	import { getFixedTrackName } from '$lib/trackAliases';

	interface RaceWithDetails {
		race: RaceSession;
		championship: { id: string; name: string } | null;
		podium: Array<{ position: number; driverName: string; driverGUID: string | null }>;
		fastestLap: number | null;
	}

	// Props from server
	let { data } = $props<{
		data: { races: RaceWithDetails[]; trackAliasMap: Record<string, string> };
	}>();
	let races: RaceWithDetails[] = data?.races ?? [];
	let isLoading = races.length === 0;

	// Format date for display (user's local style)
	function formatDate(dateString: string | null): string {
		if (!dateString) return 'N/A';
		try {
			const date = new Date(dateString);
			return date.toLocaleString(undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return 'Invalid Date';
		}
	}

	// Format track name with config in brackets, using track aliases
	function formatTrackName(trackName: string | null): string {
		const fixedName = getFixedTrackName(trackName, data.trackAliasMap);
		if (!fixedName) return 'N/A';

		return fixedName;
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
</script>

<svelte:head>
	<title>Races - Syndicate Motorsport</title>
	<meta name="description" content="View all race sessions" />
</svelte:head>

<div class="m-8">
	<h1 class="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Races</h1>
	{#if isLoading}
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm text-gray-500 dark:text-gray-400">
				<thead
					class="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400"
				>
					<tr>
						<th scope="col" class="px-6 py-3">Event Name</th>
						<th scope="col" class="px-6 py-3">Track</th>
						<th scope="col" class="px-6 py-3">Race Date</th>
						<th scope="col" class="px-6 py-3">Championship</th>
						<th scope="col" class="px-6 py-3">Podium</th>
						<th scope="col" class="px-6 py-3">Best Lap</th>
					</tr>
				</thead>
				<tbody>
					{#each Array(8) as _}
						<tr class="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
							{#each Array(6) as _}
								<td class="px-6 py-4">
									<div role="status" class="max-w-sm animate-pulse">
										<div
											class="mb-2.5 h-2 max-w-[360px] rounded-full bg-gray-200 dark:bg-gray-700"
										></div>
									</div>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else if races.length === 0}
		<p class="py-8 text-center text-gray-400">No race data available.</p>
	{:else}
		<div class="overflow-x-auto rounded-lg bg-white shadow-md dark:bg-gray-800">
			<table class="w-full text-left text-sm text-gray-500 dark:text-gray-400">
				<thead
					class="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400"
				>
					<tr>
						<th scope="col" class="px-6 py-3">Event Name</th>
						<th scope="col" class="px-6 py-3">Track</th>
						<th scope="col" class="px-6 py-3">Race Date</th>
						<th scope="col" class="px-6 py-3">Championship</th>
						<th scope="col" class="px-6 py-3">Podium</th>
						<th scope="col" class="px-6 py-3">Best Lap</th>
					</tr>
				</thead>
				<tbody>
					{#each races as raceWithDetails}
						<tr
							class="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
						>
							<td class="px-6 py-4">
								<a
									data-umami-event="navigate-to-race-details"
									data-umami-event-race-id={raceWithDetails.race.id}
									href="/race/{raceWithDetails.race.id}"
									class="font-semibold text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
								>
									{raceWithDetails.race.event_name || `Race #${raceWithDetails.race.id}`}
								</a>
							</td>
							<td class="px-6 py-4">
								{formatTrackName(raceWithDetails.race.track_name)}
							</td>
							<td class="px-6 py-4">
								{formatDate(raceWithDetails.race.race_date)}
							</td>
							<td class="px-6 py-4">
								{#if raceWithDetails.championship}
									<a
										href="/events-and-leagues/{raceWithDetails.championship.id}"
										class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
									>
										{raceWithDetails.championship.name}
									</a>
								{:else}
									<span class="text-gray-400">—</span>
								{/if}
							</td>
							<td class="px-6 py-4">
								{#if raceWithDetails.podium && raceWithDetails.podium.length > 0}
									{#each raceWithDetails.podium as podiumDriver, index}
										{#if index > 0},
										{/if}
										{#if podiumDriver.driverGUID && podiumDriver.driverGUID !== 'unknown' && podiumDriver.driverGUID !== null}
											{podiumDriver.position}.
											<a
												data-umami-event="navigate-to-driver-details"
												data-umami-event-driver-guid={podiumDriver.driverGUID}
												href="/driver/{podiumDriver.driverGUID}"
												class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
												>{podiumDriver.driverName}</a
											>
										{:else}
											{podiumDriver.position}. {podiumDriver.driverName}
										{/if}
									{/each}
								{:else}
									<span class="text-gray-400">N/A</span>
								{/if}
							</td>
							<td class="px-6 py-4">
								{#if raceWithDetails.fastestLap}
									<span class="font-medium">{formatLapTime(raceWithDetails.fastestLap)}</span>
								{:else}
									<span class="text-gray-400">—</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
