<script lang="ts">
	import type { RaceSession } from '$lib/races';
	import { getFixedTrackName } from '$lib/trackAliases';
	import { Table } from '@flowbite-svelte-plugins/datatable';
	import type { DataTableOptions } from '@flowbite-svelte-plugins/datatable';

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

	// Transform races data to table format
	let tableData = $derived(
		races.map((raceWithDetails) => {
			// Format podium as string for searchability, but store raw data for rendering
			const podiumString =
				raceWithDetails.podium && raceWithDetails.podium.length > 0
					? raceWithDetails.podium.map((p) => `${p.position}. ${p.driverName}`).join(', ')
					: 'N/A';

			return {
				'Event Name': raceWithDetails.race.event_name || `Race #${raceWithDetails.race.id}`,
				Track: formatTrackName(raceWithDetails.race.track_name),
				'Race Date': formatDate(raceWithDetails.race.race_date),
				Championship: raceWithDetails.championship?.name || 'N/A',
				Podium: podiumString,
				'Best Lap': raceWithDetails.fastestLap ? formatLapTime(raceWithDetails.fastestLap) : 'N/A',
				// Store raw data for rendering links
				_raceId: raceWithDetails.race.id,
				_championshipId: raceWithDetails.championship?.id || null,
				_podium: raceWithDetails.podium || [],
				_eventName: raceWithDetails.race.event_name || `Race #${raceWithDetails.race.id}`
			};
		})
	);

	// Create maps for quick lookups (reactive)
	const raceByEventNameMap = $derived(
		new Map(races.map((r) => [r.race.event_name || `Race #${r.race.id}`, r]))
	);
	const raceByChampionshipMap = $derived(
		new Map(races.filter((r) => r.championship).map((r) => [r.championship!.name, r]))
	);
	const raceByPodiumMap = $derived(
		new Map(
			races.map((r) => {
				const podiumString =
					r.podium && r.podium.length > 0
						? r.podium.map((p) => `${p.position}. ${p.driverName}`).join(', ')
						: 'N/A';
				return [podiumString, r];
			})
		)
	);

	// Render functions for columns with links
	const renderEventName = (data: any) => {
		const raceWithDetails = raceByEventNameMap.get(data);
		if (!raceWithDetails) return data;
		return `<a data-umami-event="navigate-to-race-details" data-umami-event-race-id="${raceWithDetails.race.id}" href="/race/${raceWithDetails.race.id}" class="font-semibold text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">${data}</a>`;
	};

	const renderChampionship = (data: any) => {
		if (data === 'N/A') return '<span class="text-gray-400">—</span>';
		const raceWithDetails = raceByChampionshipMap.get(data);
		if (!raceWithDetails || !raceWithDetails.championship) return data;
		return `<a href="/events-and-leagues/${raceWithDetails.championship.id}" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">${data}</a>`;
	};

	const renderPodium = (data: any) => {
		if (data === 'N/A') return '<span class="text-gray-400">N/A</span>';
		const raceWithDetails = raceByPodiumMap.get(data);
		if (!raceWithDetails || !raceWithDetails.podium || raceWithDetails.podium.length === 0) {
			return data;
		}
		return raceWithDetails.podium
			.map((p, index) => {
				const prefix = index > 0 ? ', ' : '';
				if (p.driverGUID && p.driverGUID !== 'unknown' && p.driverGUID !== null) {
					return `${prefix}${p.position}. <a data-umami-event="navigate-to-driver-details" data-umami-event-driver-guid="${p.driverGUID}" href="/driver/${p.driverGUID}" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">${p.driverName}</a>`;
				}
				return `${prefix}${p.position}. ${p.driverName}`;
			})
			.join('');
	};

	// DataTable options
	const racesTableOptions: DataTableOptions = {
		searchable: true,
		perPage: 25,
		perPageSelect: [10, 25, 50, 100, ['All', -1]],
		columns: [
			{ select: 0, render: renderEventName, type: 'string' }, // Event Name with link
			{ select: 3, render: renderChampionship, type: 'string' }, // Championship with link
			{ select: 4, render: renderPodium, type: 'string' }, // Podium with links
			{ select: 6, hidden: true }, // Hide _raceId
			{ select: 7, hidden: true }, // Hide _championshipId
			{ select: 8, hidden: true }, // Hide _podium
			{ select: 9, hidden: true } // Hide _eventName
		]
	};
</script>

<svelte:head>
	<title>Races - Syndicate Motorsport</title>
	<meta name="description" content="View all race sessions" />
</svelte:head>

<div class="m-8">
	<h1 class="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Races</h1>
	{#if isLoading}
		<div class="rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
			<p class="text-center text-gray-400">Loading race data...</p>
		</div>
	{:else if races.length === 0}
		<div class="rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
			<p class="text-center text-gray-400">No race data available.</p>
		</div>
	{:else}
		<div class="rounded-lg bg-white shadow-md dark:bg-gray-800">
			<Table items={tableData} dataTableOptions={racesTableOptions} />
		</div>
	{/if}
</div>
