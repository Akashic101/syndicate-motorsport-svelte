<script lang="ts">
	import type { Driver } from '$lib/drivers';
	import { getSupabaseImageUrl } from '$lib/imageUtils';

	type Achievement = {
		id: number;
		key: string | null;
		name: string | null;
		description: string | null;
		category: string | null;
		threshold: number | null;
		icon_url: string | null;
		unlocked: boolean;
		unlocked_at: string | null;
	};

	let { data } = $props<{
		data: {
			driver: Driver;
			achievements: Achievement[];
		};
	}>();

	let driver = $derived(data.driver);
	let achievements = $derived(data.achievements || []);

	// Get achievement icon URL from achievement_icons bucket
	function getAchievementIconUrl(achievement: Achievement): string | null {
		if (!achievement.key) return null;
		// Use bucket::path convention to specify the achievement_icons bucket
		// Add .png extension since all achievement icons are PNG files
		const imagePath = `achievement_icons::${achievement.key}.png`;
		return getSupabaseImageUrl(imagePath);
	}

	// Group achievements by category
	let achievements_by_category = $derived.by(() => {
		const grouped: Record<string, Achievement[]> = {};
		for (const achievement of achievements) {
			const category = achievement.category || 'Other';
			if (!grouped[category]) {
				grouped[category] = [];
			}
			grouped[category].push(achievement);
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
	<title>{driver.driver} - Achievements</title>
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
			<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
				{driver.driver}'s Achievements
			</h1>
			<p class="text-gray-600 dark:text-gray-400">
				{achievements.filter((a: { unlocked: boolean }) => a.unlocked).length} of {achievements.length}
				achievements unlocked
			</p>
		</div>

		{#each category_names as category}
			<div class="mb-8 border-t border-gray-200 pt-8 dark:border-gray-700">
				<h2 class="mb-4 text-xl font-semibold text-gray-900 capitalize dark:text-white">
					{category}
				</h2>
				<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
					{#each achievements_by_category[category] as achievement}
						{@const iconUrl = getAchievementIconUrl(achievement)}
						<div
							class="flex flex-col items-center justify-center gap-2 rounded-lg p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
						>
							<div class="relative">
								{#if iconUrl}
									<img
										src={iconUrl}
										alt={achievement.name || achievement.key || 'Achievement'}
										class="h-24 w-24 object-contain {achievement.unlocked
											? ''
											: 'opacity-20 grayscale'}"
									/>
								{:else}
									<div
										class="flex h-24 w-24 items-center justify-center rounded bg-gray-200 dark:bg-gray-700 {achievement.unlocked
											? ''
											: 'opacity-20'}"
									>
										<span class="text-xs text-gray-500 dark:text-gray-400">?</span>
									</div>
								{/if}
								{#if !achievement.unlocked}
									<div class="bg-opacity-20 absolute inset-0 rounded" title="Locked"></div>
								{/if}
							</div>
							{#if achievement.name}
								<p
									class="text-center text-lg font-medium {achievement.unlocked
										? 'text-gray-700 dark:text-gray-300'
										: 'text-gray-400 dark:text-gray-500'}"
								>
									{achievement.name}
								</p>
							{/if}
							{#if achievement.description}
								<p
									class="truncate text-center text-sm {achievement.unlocked
										? 'text-gray-500 dark:text-gray-400'
										: 'text-gray-400 dark:text-gray-500'}"
									title={achievement.description}
								>
									{achievement.description}
								</p>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
