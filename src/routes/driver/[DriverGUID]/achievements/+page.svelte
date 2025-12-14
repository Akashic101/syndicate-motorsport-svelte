<script lang="ts">
	import type { Driver } from '$lib/drivers';
	import { getSupabaseImageUrl } from '$lib/imageUtils';
	import { getDriverAchievementsOGData } from '$lib/og';
	import { fly, fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	type Achievement = {
		id: number;
		key: string | null;
		name: string | null;
		description: string | null;
		category: string | null;
		subcategory: string | null;
		threshold: number | null;
		icon_url: string | null;
		level: number | null;
		hidden: boolean;
		unlocked: boolean;
		unlocked_at: string | null;
		unlocked_count?: number;
		percentage?: number;
	};

	let { data } = $props<{
		data: {
			driver: Driver;
			achievements: Achievement[];
		};
	}>();

	let driver = $derived(data.driver);
	let achievements = $derived(data.achievements || []);

	// Sort mode: 'default', 'newest', 'rarest', 'level'
	let sort_mode = $state<'default' | 'newest' | 'rarest' | 'level'>('default');

	// Track which achievement is currently showing its tooltip
	let hovered_achievement_id = $state<number | null>(null);

	// Calculate unlocked and total counts for OG data
	let unlocked_count = $derived(
		achievements.filter((a: { unlocked: boolean }) => a.unlocked).length
	);
	let total_count = $derived(achievements.length);

	// Generate Open Graph data
	const ogData = $derived(getDriverAchievementsOGData(driver, unlocked_count, total_count));

	// Get achievement icon URL from achievement_icons bucket
	function getAchievementIconUrl(achievement: Achievement): string | null {
		if (!achievement.key) return null;
		// Use bucket::path convention to specify the achievement_icons bucket
		// Add .png extension since all achievement icons are PNG files
		const imagePath = `achievement_icons::${achievement.key}.png`;
		return getSupabaseImageUrl(imagePath);
	}

	// Format unlock date in local timezone
	function formatUnlockDate(date_string: string | null): string {
		if (!date_string) return '';
		try {
			const date = new Date(date_string);
			return date.toLocaleString(undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return '';
		}
	}

	// Group achievements by category and apply sorting based on sort_mode
	let achievements_by_category = $derived.by(() => {
		const grouped: Record<string, Achievement[]> = {};
		for (const achievement of achievements) {
			const category = achievement.category || 'Other';
			if (!grouped[category]) {
				grouped[category] = [];
			}
			grouped[category].push(achievement);
		}

		// Sort achievements within each category based on sort_mode
		for (const category in grouped) {
			if (sort_mode === 'newest') {
				// Sort by unlocked_at descending (newest first), unlocked achievements first
				grouped[category].sort((a, b) => {
					// Unlocked achievements first
					if (a.unlocked !== b.unlocked) {
						return a.unlocked ? -1 : 1;
					}
					// Then by unlocked_at (newest first)
					if (a.unlocked && b.unlocked) {
						const dateA = a.unlocked_at ? new Date(a.unlocked_at).getTime() : 0;
						const dateB = b.unlocked_at ? new Date(b.unlocked_at).getTime() : 0;
						return dateB - dateA;
					}
					// Locked achievements at the end, sorted by subcategory
					const subcatA = a.subcategory || '';
					const subcatB = b.subcategory || '';
					return subcatA.localeCompare(subcatB);
				});
			} else if (sort_mode === 'rarest') {
				// Sort by unlocked_count ascending (rarest first), unlocked achievements first
				grouped[category].sort((a, b) => {
					// Unlocked achievements first
					if (a.unlocked !== b.unlocked) {
						return a.unlocked ? -1 : 1;
					}
					// Then by unlocked_count (rarest first)
					const countA = a.unlocked_count ?? Infinity;
					const countB = b.unlocked_count ?? Infinity;
					return countA - countB;
				});
			} else if (sort_mode === 'level') {
				// Sort by level ascending (lowest level first), unlocked achievements first
				grouped[category].sort((a, b) => {
					// Unlocked achievements first
					if (a.unlocked !== b.unlocked) {
						return a.unlocked ? -1 : 1;
					}
					// Then by level (lowest first)
					const levelA = a.level ?? Infinity;
					const levelB = b.level ?? Infinity;
					return levelA - levelB;
				});
			} else {
				// Default: sort by subcategory
				grouped[category].sort((a, b) => {
					const subcatA = a.subcategory || '';
					const subcatB = b.subcategory || '';
					return subcatA.localeCompare(subcatB);
				});
			}
		}
		return grouped;
	});

	// Get category names sorted by amount of achievements (descending)
	let category_names = $derived.by(() => {
		return Object.keys(achievements_by_category).sort((a, b) => {
			const countA = achievements_by_category[a].length;
			const countB = achievements_by_category[b].length;
			return countB - countA; // Descending order (most achievements first)
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

<div class="m-8 mx-auto max-w-6xl">
	<a
		href="/driver/{driver.driver_guid}"
		class="mb-4 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
	>
		← Back to Driver Profile
	</a>

	<div class="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
		<div class="mb-8">
			<div class="mb-4 flex items-center justify-between">
				<div>
					<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
						{driver.driver}'s Achievements
					</h1>
					<p class="text-gray-600 dark:text-gray-400">
						{achievements.filter((a: { unlocked: boolean }) => a.unlocked).length} of {achievements.length}
						achievements unlocked
					</p>
				</div>
				<!-- Sort toggle -->
				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={() => (sort_mode = 'default')}
						class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors {sort_mode ===
						'default'
							? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
							: 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}"
					>
						Default
					</button>
					<button
						type="button"
						onclick={() => (sort_mode = 'newest')}
						class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors {sort_mode ===
						'newest'
							? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
							: 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}"
					>
						Newest
					</button>
					<button
						type="button"
						onclick={() => (sort_mode = 'rarest')}
						class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors {sort_mode ===
						'rarest'
							? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
							: 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}"
					>
						Rarest
					</button>
					<button
						type="button"
						onclick={() => (sort_mode = 'level')}
						class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors {sort_mode ===
						'level'
							? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
							: 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}"
					>
						Level
					</button>
				</div>
			</div>
		</div>

		{#each category_names as category}
			<div class="mb-8 border-t border-gray-200 pt-8 dark:border-gray-700">
				<h2 class="mb-4 text-xl font-semibold text-gray-900 capitalize dark:text-white">
					{category}
				</h2>
				<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
					{#each achievements_by_category[category] as achievement}
						{@const iconUrl = getAchievementIconUrl(achievement)}
						{@const showTooltip = hovered_achievement_id === achievement.id}
						<div
							class="relative flex w-full flex-col items-center justify-center gap-2 rounded-lg p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
							role="presentation"
							onmouseenter={() => (hovered_achievement_id = achievement.id)}
							onmouseleave={() => (hovered_achievement_id = null)}
						>
							<div class="relative">
								{#if !achievement.hidden}
									{#if iconUrl}
										<img
											src={iconUrl}
											alt={achievement.name || achievement.key || 'Achievement'}
											class="h-24 w-24 object-contain {!achievement.unlocked
												? 'opacity-20 grayscale'
												: ''}"
										/>
									{:else}
										<div
											class="flex h-24 w-24 items-center justify-center rounded bg-gray-200 dark:bg-gray-700 {!achievement.unlocked
												? 'opacity-20'
												: ''}"
										>
											<span class="text-xs text-gray-500 dark:text-gray-400">?</span>
										</div>
									{/if}
								{:else}
									<div
										class="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 opacity-20 dark:bg-gray-700"
									></div>
								{/if}
								{#if !achievement.unlocked || achievement.hidden}
									<div
										class="bg-opacity-20 absolute inset-0 rounded"
										title={achievement.hidden ? 'Hidden' : 'Locked'}
									></div>
								{/if}
							</div>
							<p
								class="line-clamp-2 min-h-[3rem] text-center text-lg font-medium {achievement.hidden ||
								!achievement.unlocked
									? 'text-gray-400 dark:text-gray-500'
									: 'text-gray-700 dark:text-gray-300'}"
							>
								{achievement.name}
							</p>
							{#if achievement.description || achievement.hidden}
								<p
									class="line-clamp-2 w-full px-1 text-center text-sm {achievement.hidden ||
									!achievement.unlocked
										? 'text-gray-400 dark:text-gray-500'
										: 'text-gray-500 dark:text-gray-400'}"
									title={achievement.hidden
										? 'This Achievement is a secret'
										: achievement.description}
								>
									{achievement.hidden ? 'This Achievement is a secret' : achievement.description}
								</p>
							{/if}
							{#if showTooltip && achievement.unlocked_count !== undefined}
								<div
									class="absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-sm text-white shadow-lg dark:bg-gray-700"
									in:fly={{ y: 10, duration: 200, easing: quintOut }}
									out:fly={{ y: 10, duration: 150, easing: quintOut }}
									role="tooltip"
								>
									<div class="space-y-1">
										{#if achievement.description || achievement.hidden}
											<div class="mb-1 border-b border-gray-700 pb-1 text-xs text-gray-200">
												{achievement.hidden
													? 'This Achievement is a secret'
													: achievement.description}
											</div>
										{/if}
										<div class="font-semibold whitespace-nowrap">
											{achievement.unlocked_count} driver{achievement.unlocked_count !== 1
												? 's'
												: ''}
										</div>
										<div class="text-xs whitespace-nowrap text-gray-300">
											{achievement.percentage !== undefined
												? achievement.percentage.toFixed(1)
												: '0.0'}% unlocked
										</div>
										{#if achievement.unlocked && achievement.unlocked_at}
											<div class="mt-1 border-t border-gray-700 pt-1 text-xs text-gray-300">
												Unlocked: {formatUnlockDate(achievement.unlocked_at)}
											</div>
										{/if}
									</div>
									<!-- Tooltip arrow -->
									<div
										class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"
									></div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
