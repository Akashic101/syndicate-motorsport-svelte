<script lang="ts">
	import type { Driver } from '$lib/drivers';
	import { getDriverOGData } from '$lib/og';
	import type { ApexOptions } from 'apexcharts';
	import { Chart } from '@flowbite-svelte-plugins/chart';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	import { Table } from '@flowbite-svelte-plugins/datatable';
	import type { DataTable } from '@flowbite-svelte-plugins/datatable';
	import type { DataTableOptions } from 'simple-datatables';
	import { Card, Spinner } from 'flowbite-svelte';
	import { getFixedTrackName } from '$lib/trackAliases';
	import { getSupabaseImageUrl } from '$lib/imageUtils';

	interface CellNode {
		nodeName: string;
		attributes?: Record<string, string | number>;
		childNodes?: (CellNode | TextNode)[];
	}

	interface TextNode {
		nodeName: '#text';
		data: string;
	}

	interface TableCell {
		childNodes: (CellNode | TextNode)[];
		data: any;
	}

	type EloChange = {
		id: number;
		created_at: string | null;
		driver_guid: string | null;
		date: string | null;
		track: string | null;
		elo_change: number | null;
		platform: string | null;
	};

	type Achievement = {
		id: number;
		key: string | null;
		name: string | null;
		description: string | null;
		category: string | null;
		threshold: number | null;
		icon_url: string | null;
		unlocked_at: string | null;
	};

	let { data } = $props<{
		data: {
			driver: Driver;
			steamAvatar: string | null;
			elo_changes: EloChange[];
			trackAliasMap: Record<string, string>;
			achievements: Achievement[];
			totalAchievementsCount: number;
		};
	}>();
	let driver = $derived(data.driver);
	let steamAvatar = $derived(data.steamAvatar);
	let elo_changes = $derived(data.elo_changes);
	let achievements = $derived(data.achievements || []);
	let totalAchievementsCount = $derived(data.totalAchievementsCount || 0);
	// Get last 4 achievements (sorted by unlocked_at descending, most recent first)
	let recent_achievements = $derived.by(() => {
		if (!achievements || achievements.length === 0) return [];
		// Sort by unlocked_at descending (most recent first)
		const sorted = [...achievements].sort((a, b) => {
			const dateA = a.unlocked_at ? new Date(a.unlocked_at).getTime() : 0;
			const dateB = b.unlocked_at ? new Date(b.unlocked_at).getTime() : 0;
			return dateB - dateA; // Descending order
		});
		// Return only the first 4
		return sorted.slice(0, 4);
	});
	// Sort ELO changes by date descending (most recent first) for table display
	let sorted_elo_changes = $derived.by(() => {
		if (!elo_changes) return [];
		// Sort by date descending (most recent first)
		return [...elo_changes].sort((a, b) => {
			const dateA = a.date ? new Date(a.date).getTime() : 0;
			const dateB = b.date ? new Date(b.date).getTime() : 0;
			return dateB - dateA; // Descending order
		});
	});
	let trackAliasMap = $derived(data.trackAliasMap);

	// Calculate cumulative ELO for chart (starting at start_elo)
	let cumulative_elo = $derived.by(() => {
		if (!elo_changes || elo_changes.length === 0) return [];
		const start_elo_value = driver.start_elo;
		let cumulative = start_elo_value;
		return elo_changes.map((change: EloChange) => {
			cumulative += change.elo_change || 0;
			return cumulative;
		});
	});

	// Prepare chart data
	let chart_options = $derived.by((): ApexOptions => {
		// Calculate symmetric range around start_elo for y-axis
		const start_elo_value = driver.start_elo || 1500;
		const range = 500; // 500 points above and below
		let y_min = start_elo_value - range;
		let y_max = start_elo_value + range;

		return {
			chart: {
				width: '100%',
				height: '400px',
				type: 'line',
				fontFamily: 'Inter, sans-serif',
				dropShadow: {
					enabled: false
				},
				toolbar: {
					show: false
				}
			},
			tooltip: {
				enabled: true,
				x: {
					show: true
				}
			},
			dataLabels: {
				enabled: false
			},
			stroke: {
				width: 3,
				curve: 'smooth'
			},
			grid: {
				show: true,
				strokeDashArray: 4,
				padding: {
					left: 2,
					right: 2,
					top: 0
				}
			},
			series: [
				{
					name: 'ELO Rating',
					data: cumulative_elo,
					color: 'var(--color-primary-500)'
				}
			],
			xaxis: {
				labels: {
					show: false
				}
			},
			yaxis: {
				min: y_min,
				max: y_max,
				title: {
					text: 'ELO Rating',
					style: {
						fontFamily: 'Inter, sans-serif',
						cssClass: 'text-xs font-normal text-red-100 dark:text-red-100'
					}
				},
				labels: {
					formatter: function (val: number) {
						return Math.round(val).toString();
					},
					style: {
						fontFamily: 'Inter, sans-serif',
						cssClass: 'text-xs font-normal fill-gray-100 dark:fill-gray-100'
					}
				}
			}
		};
	});

	// Format date for display
	function format_date(date_string: string | null): string {
		if (!date_string) return 'N/A';
		try {
			const date = new Date(date_string);
			return date.toLocaleDateString();
		} catch {
			return 'Invalid Date';
		}
	}

	// Format ELO change with sign
	function format_elo_change(change: number | null): string {
		if (change === null || change === undefined) return 'N/A';
		return change >= 0 ? `+${change}` : `${change}`;
	}

	// Transform ELO changes data for DataTable
	let table_data = $derived.by(() => {
		if (!sorted_elo_changes || sorted_elo_changes.length === 0) return [];
		return sorted_elo_changes.map((change: EloChange) => ({
			Date: format_date(change.date),
			Track: getFixedTrackName(change.track, trackAliasMap) || 'N/A',
			Platform: change.platform || 'N/A',
			'ELO Change': format_elo_change(change.elo_change)
		}));
	});

	// Render function for ELO Change column
	const renderEloChange = function (
		data: any,
		cell: TableCell,
		_dataIndex: number,
		_cellIndex: number
	): void {
		const data_str = String(data || '');
		const change = parseFloat(data_str.replace('+', '')) || 0;
		const color_class =
			change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

		cell.childNodes = [
			{
				nodeName: 'SPAN',
				attributes: {
					class: `font-semibold ${color_class}`
				},
				childNodes: [
					{
						nodeName: '#text',
						data: data_str
					}
				]
			}
		];
	};

	// Configure DataTable options
	let data_table_options = $derived.by(
		(): DataTableOptions => ({
			searchable: false,
			perPage: 10,
			perPageSelect: [10, 25, 50, 100],
			columns: [
				{
					select: 3,
					render: renderEloChange,
					type: 'string'
				}
			]
		})
	);

	// Table loading state
	let isTableLoading = $state(true);
	let tableInstance: DataTable | null = $state(null);
	let isClient = $state(false);

	onMount(() => {
		isClient = true;
	});

	function handleInitStart(): void {
		isTableLoading = true;
	}

	function handleInitComplete(dataTable: DataTable): void {
		isTableLoading = false;
	}

	function handleInitError(error: Error): void {
		isTableLoading = false;
	}

	// Prepare radial chart options for race statistics
	let radial_chart_options = $derived.by((): ApexOptions => {
		const race_starts = driver.race_starts || 0;
		const wins = driver.win_count || 0;
		const podiums = driver.podium_count || 0;

		// Calculate percentages
		const win_percentage = race_starts > 0 ? Math.round((wins / race_starts) * 100) : 0;
		const podium_percentage = race_starts > 0 ? Math.round((podiums / race_starts) * 100) : 0;

		return {
			chart: {
				height: '350px',
				type: 'radialBar',
				fontFamily: 'Inter, sans-serif'
			},
			series: [win_percentage, podium_percentage],
			colors: ['#10b981', '#f59e0b'],
			plotOptions: {
				radialBar: {
					hollow: {
						size: '50%'
					},
					track: {
						background: '#e5e7eb',
						strokeWidth: '100%'
					},
					dataLabels: {
						name: {
							fontSize: '16px',
							fontWeight: 600,
							color: undefined
						},
						value: {
							fontSize: '20px',
							fontWeight: 700,
							color: undefined,
							formatter: function (val: number) {
								return val + '%';
							}
						},
						total: {
							show: true,
							label: 'Race Starts',
							fontSize: '18px',
							fontWeight: 600,
							color: undefined,
							formatter: function () {
								return race_starts.toLocaleString();
							}
						}
					}
				}
			}
		};
	});

	// Generate Open Graph data for driver page
	const ogData = $derived(getDriverOGData(driver));

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

	// Get achievement icon URL from achievement_icons bucket
	function getAchievementIconUrl(achievement: Achievement): string | null {
		if (!achievement.key) return null;
		// Use bucket::path convention to specify the achievement_icons bucket
		// Add .png extension since all achievement icons are PNG files
		const imagePath = `achievement_icons::${achievement.key}.png`;
		return getSupabaseImageUrl(imagePath);
	}
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

<div class="m-8 mx-auto max-w-4xl">
	<a
		href="/drivers"
		class="mb-4 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
	>
		← Back to Rankings
	</a>

	<div class="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
		<div class="mb-6">
			<Card img={steamAvatar || ''} horizontal size="md" class="w-full max-w-none">
				<div class="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
					<!-- Driver Info Section -->
					<div>
						<h5 class="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
							{driver.driver}
						</h5>
						<div class="flex flex-wrap gap-4">
							<div>
								<p class="text-lg font-semibold text-gray-700 dark:text-gray-300">
									Rank #{driver.rank || 'N/A'}
								</p>
								{#if driver.percentile_rank !== null}
									<p class="text-xs text-gray-500 dark:text-gray-400">
										Top {100 - (driver.percentile_rank || 0)}%
									</p>
								{/if}
							</div>
							<div class="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
							<div>
								<p class="text-sm font-medium text-gray-500 dark:text-gray-400">ELO Rating</p>
								<p class="text-xl font-bold text-gray-900 dark:text-white">{driver.elo || 'N/A'}</p>
								{#if driver.range_min !== null && driver.range_max !== null}
									<p class="text-xs text-gray-500 dark:text-gray-400">
										Range: {driver.range_min} - {driver.range_max}
									</p>
								{/if}
							</div>
						</div>
					</div>

					<!-- Badges Section -->
					<div class="grid grid-cols-1 justify-items-end gap-4">
						<div class="flex gap-2">
							<img src={driver.icon_url} alt={driver.license || 'License'} class="h-18 w-auto" />
						</div>

						<div>
							<span
								style={getSafetyBadgeStyle(driver.safety_rating || '')}
								class="inline-block rounded-md border px-4 py-2 text-5xl font-semibold"
							>
								{driver.safety_rating || 'N/A'}
							</span>
						</div>
					</div>
				</div>
			</Card>
		</div>

		<!-- Racing Statistics -->
		<div class="mb-8 border-t border-gray-200 pt-8 dark:border-gray-700">
			<h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Racing Statistics</h2>
			<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
				<!-- Radial Chart -->
				{#if driver.race_starts && driver.race_starts > 0 && isClient}
					<div class="flex flex-col items-center justify-center">
						<Chart options={radial_chart_options} />
					</div>
				{/if}
				<!-- Stats Grid -->
				<div class="grid grid-cols-2 gap-4 md:grid-cols-2">
					<div>
						<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Race Starts</p>
						<p class="text-2xl font-bold text-gray-900 dark:text-white">
							{driver.race_starts?.toLocaleString() || '0'}
						</p>
					</div>
					<div>
						<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Wins</p>
						<p class="text-2xl font-bold text-green-600 dark:text-green-400">
							{driver.win_count?.toLocaleString() || '0'}
						</p>
						{#if driver.race_starts && driver.race_starts > 0 && driver.win_count}
							<p class="text-xs text-gray-500 dark:text-gray-400">
								{((driver.win_count / driver.race_starts) * 100).toFixed(1)}% win rate
							</p>
						{/if}
					</div>
					<div>
						<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Podiums</p>
						<p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
							{driver.podium_count?.toLocaleString() || '0'}
						</p>
						{#if driver.race_starts && driver.race_starts > 0 && driver.podium_count}
							<p class="text-xs text-gray-500 dark:text-gray-400">
								{((driver.podium_count / driver.race_starts) * 100).toFixed(1)}% podium rate
							</p>
						{/if}
					</div>
					<div>
						<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Percentile Rank</p>
						<p class="text-2xl font-bold text-gray-900 dark:text-white">
							{driver.percentile_rank !== null ? `${driver.percentile_rank}%` : 'N/A'}
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Activity Statistics -->
		<div class="mb-8 border-t border-gray-200 pt-8 dark:border-gray-700">
			<h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Activity Statistics</h2>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Session Files</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">
						{driver.number_of_session_files?.toLocaleString() || '0'}
					</p>
				</div>
				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Driving Time</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">
						{#if driver.total_driving_time_minutes}
							{Math.floor(driver.total_driving_time_minutes / 60)}h {driver.total_driving_time_minutes %
								60}m
						{:else}
							0h 0m
						{/if}
					</p>
					{#if driver.total_driving_time_minutes}
						<p class="text-xs text-gray-500 dark:text-gray-400">
							{driver.total_driving_time_minutes.toLocaleString()} minutes
						</p>
					{/if}
				</div>
				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Collisions (Weighted)</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">
						{driver.total_collisions_weighted?.toLocaleString() || '0'}
					</p>
				</div>
				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Contacts/Hour</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">
						{driver.avg_contacts_per_minute?.toFixed(2) || '0.00'}
					</p>
				</div>
			</div>
		</div>

		<!-- Experience -->
		<div class="mb-8 border-t border-gray-200 pt-8 dark:border-gray-700">
			<h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Experience</h2>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Cars Driven</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">
						{driver.cars_driven?.toLocaleString() || '0'}
					</p>
				</div>
				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Tracks Driven</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">
						{driver.tracks_driven?.toLocaleString() || '0'}
					</p>
				</div>
			</div>
		</div>

		<!-- Achievements -->
		{#if achievements && achievements.length > 0}
			<div class="mb-8 border-t border-gray-200 pt-8 dark:border-gray-700">
				<div class="mb-4 flex items-center justify-between">
					<div>
						<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Achievements</h2>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							{achievements.length} / {totalAchievementsCount} achievement{totalAchievementsCount !==
							1
								? 's'
								: ''} unlocked
						</p>
					</div>
					<a
						href="/driver/{driver.driver_guid}/achievements"
						class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
					>
						Show All
					</a>
				</div>
				<div class="grid grid-cols-4 gap-4">
					{#each recent_achievements as achievement}
						{@const iconUrl = getAchievementIconUrl(achievement)}
						<div class="flex flex-col items-center justify-center gap-2">
							{#if iconUrl}
								<img
									src={iconUrl}
									alt={achievement.name || achievement.key || 'Achievement'}
									class="h-32 w-32 object-contain"
								/>
							{:else}
								<div
									class="flex h-32 w-32 items-center justify-center rounded bg-gray-200 dark:bg-gray-700"
								>
									<span class="text-xs text-gray-500 dark:text-gray-400">?</span>
								</div>
							{/if}
							{#if achievement.name}
								<p class="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
									{achievement.name}
								</p>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- ELO Changes Chart -->
		{#if elo_changes && elo_changes.length > 0 && isClient}
			<div class="mb-8 w-full border-t border-gray-200 pt-8 dark:border-gray-700">
				<h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
					ELO Rating Changes Over Time
				</h2>
				<Chart options={chart_options} />
			</div>
		{/if}

		<!-- ELO Changes Table -->
		{#if elo_changes && elo_changes.length > 0 && isClient}
			<div class="mb-8 border-t border-gray-200 pt-8 dark:border-gray-700">
				<h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">All ELO Changes</h2>
				<div class="overflow-x-auto">
					{#if isTableLoading}
						<Spinner />
					{/if}
					<Table
						items={table_data}
						dataTableOptions={data_table_options}
						bind:isLoading={isTableLoading}
						bind:dataTableInstance={tableInstance}
						onInitStart={handleInitStart}
						onInitComplete={handleInitComplete}
						onInitError={handleInitError}
					/>
				</div>
			</div>
		{/if}
	</div>
</div>
