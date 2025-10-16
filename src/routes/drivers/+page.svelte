<script lang="ts">
	import { Table } from '@flowbite-svelte-plugins/datatable';
	import type { DataTable, DataTableOptions } from '@flowbite-svelte-plugins/datatable';
	import type { DriverRow } from './+page.server';

	let { data } = $props<{ data: { drivers: DriverRow[] } }>();
	const drivers: DriverRow[] = data?.drivers ?? [];

	// --------------------------
	// Driver Name Renderer
	// --------------------------
	function extractLinkText(htmlString: string): string {
		const temp = document.createElement('div');
		temp.innerHTML = htmlString;
		const link = temp.querySelector('a');
		return link?.textContent ?? '';
	}

	const renderDriverName = (data: any) => extractLinkText(data);

	// --------------------------
	// License Badge Renderer
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

	// --------------------------
	// Badge Styles
	// --------------------------
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
			default:
				return 'color:#6b7280;background-color:rgba(107,114,128,0.15);border-color:rgba(107,114,128,0.4);';
		}
	}

	const renderLicenseBadge = (data: any) => {
		const value = String(data ?? '');
		const style = getBadgeStyle(value);
		return `<span style="${style};padding:0.25rem 0.5rem;border-radius:0.375rem;border:1px solid;">${value}</span>`;
	};

	const renderSafetyBadge = (data: any) => {
		const value = String(data ?? '');
		let style = getSafetyBadgeStyle(value);

		if (value.toUpperCase() === 'S') {
			// Silver shiny diamond style
			style = `
			color:#000;
			background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 50%, #d1d5db 100%);
			border-color: rgba(229,231,235,0.6);
			box-shadow: 0 0 6px rgba(255,255,255,0.6) inset, 0 2px 6px rgba(0,0,0,0.15);
		`;

			return `<span style="${style};display:inline-block;padding:0.25rem 0.5rem;border:1px solid;transform: rotate(45deg);text-align:center;line-height:1;min-width:1.5rem;min-height:1.5rem;">
			<span style="display:inline-block;transform: rotate(-45deg);">${value}</span>
		</span>`;
		}

		// Normal badge for other ratings
		return `<span style="${style};padding:0.25rem 0.5rem;border-radius:0.375rem;border:1px solid;">${value}</span>`;
	};

	// --------------------------
	// Table Options
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
				cellAttributes: (row: any, cell: any) => ({
					'data-order': getLicenseSortValue(row[cell.dataIndex]).toString()
				})
			},
			{
				select: 4,
				render: renderSafetyBadge,
				type: 'string',
				cellAttributes: (row: any, cell: any) => ({
					'data-order': getSafetySortValue(row[cell.dataIndex]).toString()
				})
			}
		]
	};

	import { onMount } from 'svelte';

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

<div class="m-8">
    <Table items={drivers} dataTableOptions={tableOptions} />
</div>
