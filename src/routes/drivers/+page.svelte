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
	import type { Driver } from '$lib/drivers';
	import { getDriversOGData } from '$lib/og';

	// Props from server
	let { data } = $props<{ data: { drivers: Driver[] } }>();
	let drivers: Driver[] = data?.drivers ?? [];
	let isLoading = drivers.length === 0;

	// Generate Open Graph data for drivers page
	const ogData = getDriversOGData();

	// Transform drivers data to match table format
	let tableData = $derived(drivers.map(driver => ({
		RANK: driver.rank || 0,
		DRIVER: driver.driver || '',
		ELO: driver.elo || 0,
		LICENSE: driver.license || '',
		'SAFETY RATING': driver.safety_rating || '',
		DriverGUID: driver.driver_guid || 0
	})));

	const renderDriverName = (data: any) => {
		// Find the driver data by matching the driver name
		const driver = drivers.find(d => d.driver === data);
		if (!driver) return data;
		return `<a href="/driver/${driver.driver_guid}">${driver.driver}</a>`;
	};

	// --------------------------
	// License / Safety Sort & Badge Functions
	// --------------------------
	function getLicenseSortValue(license: string): number {
		switch (license.toLowerCase()) {
			case 'gold':
				return 4;
			case 'silver':
				return 3;
			case 'bronze':
				return 2;
			case 'rookie':
				return 1;
			default:
				return 0;
		}
	}

	function getSafetySortValue(rating: string): number {
		switch (rating.toUpperCase()) {
			case 'S':
				return 6;
			case 'A':
				return 5;
			case 'B':
				return 4;
			case 'C':
				return 3;
			case 'D':
				return 2;
			case 'E':
				return 1;
			default:
				return 0;
		}
	}

	function getBadgeStyle(license: string): string {
		switch (license.toLowerCase()) {
			case 'gold':
				return 'color:#f59e0b;background-color:rgba(245,158,11,0.15);border-color:rgba(245,158,11,0.4);';
			case 'silver':
				return 'color:#e5e7eb;background-color:rgba(229,231,235,0.12);border-color:rgba(229,231,235,0.35);';
			case 'bronze':
				return 'color:#cd7f32;background-color:rgba(205,127,50,0.15);border-color:rgba(205,127,50,0.45);';
			case 'rookie':
			default:
				return 'color:#22c55e;background-color:rgba(34,197,94,0.12);border-color:rgba(34,197,94,0.35);';
		}
	}

	function getSafetyBadgeStyle(rating: string): string {
		switch (rating.toUpperCase()) {
			case 'S':
				return 'color:#fff;background:linear-gradient(135deg,#10b981 0%,#059669 50%,#047857 100%);border-color:#10b981;box-shadow:0 0 8px rgba(16,185,129,0.4),inset 0 1px 0 rgba(255,255,255,0.2);text-shadow:0 1px 2px rgba(0,0,0,0.3);';
			case 'A':
				return 'color:#3b82f6;background-color:rgba(59,130,246,0.15);border-color:rgba(59,130,246,0.4);';
			case 'B':
				return 'color:#f59e0b;background-color:rgba(245,158,11,0.15);border-color:rgba(245,158,11,0.4);';
			case 'C':
				return 'color:#f97316;background-color:rgba(249,115,22,0.15);border-color:rgba(249,115,22,0.4);';
			case 'D':
				return 'color:#ef4444;background-color:rgba(239,68,68,0.15);border-color:rgba(239,68,68,0.4);';
			case 'E':
				return 'color:#6b7280;background-color:rgba(107,114,128,0.15);border-color:rgba(107,114,128,0.4);';
			default:
				return '';
		}
	}

	const renderLicenseBadge = (data: any) => {
		const value = String(data ?? '');
		const style = getBadgeStyle(value);
		return `<span style="${style};padding:0.25rem 0.5rem;border-radius:0.375rem;border:1px solid;">${value}</span>`;
	};

	const renderSafetyBadge = (data: any) => {
		const value = String(data ?? '');
		const style = getSafetyBadgeStyle(value);
		return `<span style="${style};padding:0.25rem 0.5rem;border-radius:0.375rem;border:1px solid;">${value}</span>`;
	};

	// --------------------------
	// DataTable Options
	// --------------------------
	const tableOptions: DataTableOptions = {
		paging: true,
		perPage: 25,
		searchable: false,
		columns: [
			{ select: 0, sort: 'asc', hidden: false, type: 'number' },
			{ select: 1, render: renderDriverName, type: 'string' },
			{
				select: 3,
				render: renderLicenseBadge,
				type: 'string',
				cellAttributes: (row: any) => ({
					'data-order': getLicenseSortValue(row.LICENSE || '').toString()
				})
			},
			{
				select: 4,
				render: renderSafetyBadge,
				type: 'string',
				cellAttributes: (row: any) => ({
					'data-order': getSafetySortValue(row['SAFETY RATING'] || '').toString()
				})
			},{ select: 5, hidden: true },
		]
	};

	// --------------------------
	// Headers
	// --------------------------
	const headers = ['RANK', 'DRIVER', 'ELO', 'LICENSE', 'SAFETY RATING'];

	// --------------------------
	// KEEP ONMOUNT INTACT
	// --------------------------
	onMount(() => {
		document.querySelectorAll('table tbody tr').forEach((tr) => {
			const licenseCell = tr.children[3]; // 0-indexed
			const safetyCell = tr.children[4];

			if (licenseCell) {
				const value = licenseCell.textContent ?? '';
				licenseCell.setAttribute('data-order', getLicenseSortValue(value).toString());
			}

			if (safetyCell) {
				const value = safetyCell.textContent ?? '';
				safetyCell.setAttribute('data-order', getSafetySortValue(value).toString());
			}
		});
	});
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
	{:else if drivers.length === 0}
		<p class="py-8 text-center text-gray-400">No driver data available.</p>
	{:else}
		<Table items={tableData} dataTableOptions={tableOptions} />
	{/if}
</div>
