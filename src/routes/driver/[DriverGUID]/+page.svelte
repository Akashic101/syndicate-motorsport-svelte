<script lang="ts">
	import type { Driver } from '$lib/drivers';
	import { getDriverOGData } from '$lib/og';

	let { data } = $props<{ data: { driver: Driver } }>();
	let driver = $derived(data.driver);

	// Generate Open Graph data for driver page
	const ogData = $derived(getDriverOGData(driver));

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
		<div class="mb-6 flex items-center gap-4">
			{#if driver.icon_url}
				<img
					src={driver.icon_url}
					alt={driver.driver || 'Driver'}
					class="h-16 w-16 rounded-full object-cover"
				/>
			{/if}
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white">
				{driver.driver || 'Unknown Driver'}
			</h1>
		</div>

		<!-- Basic Stats -->
		<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Rank</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">#{driver.rank || 'N/A'}</p>
					{#if driver.percentile_rank !== null}
						<p class="text-xs text-gray-500 dark:text-gray-400">
							Top {100 - (driver.percentile_rank || 0)}%
						</p>
					{/if}
				</div>

				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">ELO Rating</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">{driver.elo || 'N/A'}</p>
					{#if driver.range_min !== null && driver.range_max !== null}
						<p class="text-xs text-gray-500 dark:text-gray-400">
							Range: {driver.range_min} - {driver.range_max}
						</p>
					{/if}
				</div>
			</div>

			<div class="space-y-4">
				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">License</p>
					<div class="mt-2">
						<span
							style={getBadgeStyle(driver.license || '')}
							class="inline-block rounded-md border px-4 py-2 text-lg font-semibold"
						>
							{driver.license || 'N/A'}
						</span>
						{#if driver.next_license}
							<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
								Next: {driver.next_license}
							</p>
						{/if}
					</div>
				</div>

				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Safety Rating</p>
					<div class="mt-2">
						<span
							style={getSafetyBadgeStyle(driver.safety_rating || '')}
							class="inline-block rounded-md border px-4 py-2 text-lg font-semibold"
						>
							{driver.safety_rating || 'N/A'}
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Racing Statistics -->
		<div class="mb-8 border-t border-gray-200 pt-8 dark:border-gray-700">
			<h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Racing Statistics</h2>
			<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
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
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Contacts/Min</p>
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

		<!-- Platform Information -->
		{#if driver.ac || driver.pc2 || driver.steam_id64}
			<div class="mb-8 border-t border-gray-200 pt-8 dark:border-gray-700">
				<h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
					Platform Information
				</h2>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
					{#if driver.ac}
						<div>
							<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Assetto Corsa</p>
							<p class="text-lg font-semibold text-gray-900 dark:text-white">{driver.ac}</p>
						</div>
					{/if}
					{#if driver.pc2}
						<div>
							<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Project Cars 2</p>
							<p class="text-lg font-semibold text-gray-900 dark:text-white">{driver.pc2}</p>
						</div>
					{/if}
					{#if driver.steam_id64}
						<div>
							<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Steam ID64</p>
							<p class="font-mono text-lg font-semibold text-gray-900 dark:text-white">
								{driver.steam_id64}
							</p>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Technical Information -->
		<div class="border-t border-gray-200 pt-8 dark:border-gray-700">
			<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Driver GUID</p>
			<p class="mt-1 font-mono text-sm text-gray-600 dark:text-gray-400">
				{driver.driver_guid || 'N/A'}
			</p>
		</div>
	</div>
</div>
