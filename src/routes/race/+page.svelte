<script lang="ts">
	import { Table } from '@flowbite-svelte-plugins/datatable';
	import type { DataTableOptions } from '@flowbite-svelte-plugins/datatable';
	import { onMount } from 'svelte';
	import {
		Table as DefaultTable,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import type { RaceSession } from '$lib/races';
	import { goto } from '$app/navigation';

	// Props from server
	let { data } = $props<{ data: { races: RaceSession[] } }>();
	let races: RaceSession[] = data?.races ?? [];
	let isLoading = races.length === 0;

	// Format date for display
	function formatDate(dateString: string | null): string {
		if (!dateString) return 'N/A';
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', {
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

	// Transform races data to match table format
	let tableData = $derived(
		races.map((race) => ({
			ID: race.id,
			'SESSION FILE': race.session_file || 'N/A',
			'RACE DATE': formatDate(race.race_date),
			VERSION: race.version || 'N/A',
			'CHAMPIONSHIP ID': race.championship_id || 'N/A',
			RaceId: race.id
		}))
	);

	const renderRaceLink = (data: any) => {
		// Find the race data by matching the ID
		const race = races.find((r) => r.id === parseInt(data));
		if (!race) return data;
		return `<a class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold underline" data-umami-event="navigate-to-race-details" data-umami-event-race-id="${race.id}" href="/race/${race.id}">${data}</a>`;
	};

	// DataTable Options
	const tableOptions: DataTableOptions = {
		paging: true,
		perPage: 25,
		searchable: true,
		columns: [
			{ select: 0, render: renderRaceLink, type: 'number' },
			{ select: 1, type: 'string' },
			{ select: 2, type: 'string' },
			{ select: 3, type: 'number' },
			{ select: 4, type: 'string' },
			{ select: 5, hidden: true }
		]
	};

	// Headers
	const headers = ['ID', 'SESSION FILE', 'RACE DATE', 'VERSION', 'CHAMPIONSHIP ID'];

	// Make table rows clickable as a fallback
	onMount(() => {
		// Add click handlers to race ID cells after table renders
		setTimeout(() => {
			document.querySelectorAll('table tbody tr').forEach((row) => {
				const firstCell = row.querySelector('td:first-child');
				if (firstCell) {
					const raceId = firstCell.textContent?.trim();
					if (raceId && !isNaN(parseInt(raceId))) {
						// Make the row cursor pointer on hover
						(row as HTMLElement).style.cursor = 'pointer';
						row.addEventListener('click', (e) => {
							// Only navigate if clicking on the row itself, not on a link
							if ((e.target as HTMLElement).tagName !== 'A') {
								goto(`/race/${raceId}`);
							}
						});
					}
				}
			});
		}, 100);
	});
</script>

<svelte:head>
	<title>Races - Syndicate Motorsport</title>
	<meta name="description" content="View all race sessions" />
</svelte:head>

<div class="m-8">
	<h1 class="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Races</h1>
	{#if isLoading}
		<DefaultTable>
			<TableHead>
				{#each headers as header}
					<TableHeadCell>{header}</TableHeadCell>
				{/each}
			</TableHead>
			<TableBody>
				{#each Array(8) as _}
					<TableBodyRow>
						{#each headers as _}
							<TableBodyCell>
								<div role="status" class="max-w-sm animate-pulse">
									<div
										class="mb-2.5 h-2 max-w-[360px] rounded-full bg-gray-200 dark:bg-gray-700"
									></div>
								</div>
							</TableBodyCell>
						{/each}
					</TableBodyRow>
				{/each}
			</TableBody>
		</DefaultTable>
	{:else if races.length === 0}
		<p class="py-8 text-center text-gray-400">No race data available.</p>
	{:else}
		<Table items={tableData} dataTableOptions={tableOptions} />
	{/if}
</div>

