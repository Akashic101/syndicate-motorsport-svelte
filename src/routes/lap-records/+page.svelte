<script lang="ts">
	import { Table } from '@flowbite-svelte-plugins/datatable';
	import type { DataTableOptions } from '@flowbite-svelte-plugins/datatable';
	import type { LapRecord } from '$lib/lapRecords';
	import { getLapRecordsOGData } from '$lib/og';

	export let data: { lapRecords: LapRecord[] };

	// Generate Open Graph data for lap records page
	const ogData = getLapRecordsOGData();

	// Sort lap records by lap time (ascending - fastest first)
	const lapRecords: LapRecord[] = (data.lapRecords ?? []).sort((a, b) => {
		// Convert lap times to comparable format (remove colons and compare as numbers)
		const timeA = (a.lap_time || '').replace(/:/g, '');
		const timeB = (b.lap_time || '').replace(/:/g, '');
		return timeA.localeCompare(timeB);
	});

	const tableOptions: DataTableOptions = {
		paging: true,
		searchable: true,
		perPage: 25,
		perPageSelect: [10, 15, 20, 25, 50, 100],
		tableRender: (data: any[], table: any, type: string) => {
			if (type === 'print') {
				return table;
			}

			const tHead = table.childNodes[0];
			const filterHeaders = {
				nodeName: 'TR',
				attributes: {
					class: 'search-filtering-row'
				},
				childNodes: tHead.childNodes[0].childNodes.map((_th: any, index: number) => {
					// Only add search inputs for visible columns (track_name, car_model, platform, driver)
					const searchableColumns = [0, 1, 2, 3]; // track_name, car_model, platform, driver
					if (!searchableColumns.includes(index)) {
						return { nodeName: 'TH', childNodes: [] };
					}

					return {
						nodeName: 'TH',
						childNodes: [
							{
								nodeName: 'INPUT',
								attributes: {
									class: 'datatable-input',
									type: 'search',
									'data-columns': `[${index}]`
								}
							}
						]
					};
				})
			};

			tHead.childNodes.push(filterHeaders);
			return table;
		}
	};
</script>

<svelte:head>
	<title>{ogData.title}</title>
	<meta name="description" content={ogData.description} />
	<meta property="og:title" content={ogData['og:title']} />
	<meta property="og:description" content={ogData['og:description']} />
	<meta property="og:image" content={ogData['og:image']} />
	<meta property="og:url" content={ogData['og:url']} />
	<meta property="og:type" content={ogData['og:type']} />
	<meta property="og:site_name" content={ogData['og:site_name']} />
	<meta property="og:locale" content={ogData['og:locale']} />

	<meta name="twitter:card" content={ogData['twitter:card']} />
	<meta name="twitter:title" content={ogData['twitter:title']} />
	<meta name="twitter:description" content={ogData['twitter:description']} />
	<meta name="twitter:image" content={ogData['twitter:image']} />
</svelte:head>

<div class="m-8">
	<Table items={lapRecords as any} dataTableOptions={tableOptions} />
</div>
