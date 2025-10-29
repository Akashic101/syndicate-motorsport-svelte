<script lang="ts">
	import { Card, Badge, Button, Input } from 'flowbite-svelte';
	import { getEventsLeaguesOGData } from '$lib/og';
	import { BookOpenSolid, SearchOutline } from 'flowbite-svelte-icons';

	// Props from server
	let { data } = $props<{
		data: {
			championships: any[];
			error?: string;
		};
	}>();

	// Generate Open Graph data for events and leagues page
	const ogData = getEventsLeaguesOGData();

	// Search state
	let searchQuery = $state('');

	// Date formatting function
	function formatDate(dateString: string): string {
		if (!dateString) return '';

		const date = new Date(dateString);
		if (isNaN(date.getTime())) return dateString; // Return original if invalid

		const options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		};
		return date.toLocaleDateString('en-US', options);
	}

	// Format date range
	function formatDateRange(startDate: string, endDate: string): string {
		if (!startDate && !endDate) return '';
		if (startDate && endDate) {
			return `${formatDate(startDate)} - ${formatDate(endDate)}`;
		} else if (startDate) {
			return `Starts ${formatDate(startDate)}`;
		} else if (endDate) {
			return `Ends ${formatDate(endDate)}`;
		}
		return '';
	}

	// Sort championships by status and date
	function sortChampionships(championships: any[]): any[] {
		return championships.sort((a, b) => {
			// First sort by status: planned (0), running (1), finished (2)
			const statusOrder = { planned: 0, running: 1, finished: 2 };
			const statusA = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
			const statusB = statusOrder[b.status as keyof typeof statusOrder] ?? 3;

			if (statusA !== statusB) {
				return statusA - statusB;
			}

			// Within each status group, sort by date (most recent first)
			const getSortDate = (championship: any) => {
				// Use end_date if available, otherwise start_date
				const dateStr = championship.end_date || championship.start_date;
				if (!dateStr) return new Date(0); // Very old date for championships without dates

				const date = new Date(dateStr);
				return isNaN(date.getTime()) ? new Date(0) : date;
			};

			const dateA = getSortDate(a);
			const dateB = getSortDate(b);

			// Sort by date descending (most recent first)
			return dateB.getTime() - dateA.getTime();
		});
	}

	// Filtered and sorted championships
	let filteredChampionships = $derived(
		sortChampionships(
			data.championships.filter((championship: any) => {
				if (!searchQuery.trim()) return true;

				const query = searchQuery.toLowerCase();
				return (
					championship.name?.toLowerCase().includes(query) ||
					championship.description?.toLowerCase().includes(query) ||
					championship.season?.toString().toLowerCase().includes(query)
				);
			})
		)
	);

	function navigateToLeague(championshipId: string) {
		window.location.href = `/events-and-leagues/${championshipId}`;
	}

	function handleImageError(event: Event) {
		const target = event.target as HTMLImageElement;
		if (target) {
			target.style.display = 'none';
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

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="mb-6">
			<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Events and Leagues</h1>
			<p class="mb-4 text-gray-600 dark:text-gray-400">
				Discover all available championships and racing leagues - Search enabled!
			</p>

			<!-- Rules Link Button -->
			<div class="mb-6">
				<Button
					data-umami-event="navigate-to-rules"
					href="https://docs.google.com/document/d/1INAGo4rZKlLax-fJ1BGadewKlU48TvNMUSk5d5u6OZo/edit?tab=t.0#heading=h.xidipkakl490"
					color="blue"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2"
				>
					<BookOpenSolid />
					View Rules & Regulations
				</Button>
			</div>

			<!-- Search Bar -->
			<div class="relative max-w-md">
				<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<SearchOutline class="text-gray-500" />
				</div>
				<input
					bind:value={searchQuery}
					type="text"
					placeholder="Search championships..."
					class="py-2pr-3 block w-100 rounded-lg border border-gray-300 bg-gray-50 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
				/>
			</div>
		</div>

		{#if data.error}
			<Card class="mb-6">
				<div class="text-center text-red-600">
					<h2 class="mb-2 text-xl font-bold">Error Loading League Data</h2>
					<p>{data.error}</p>
				</div>
			</Card>
		{:else if data.championships.length === 0}
			<Card>
				<div class="py-8 text-center">
					<h2 class="mb-2 text-xl font-bold">No Leagues Available</h2>
					<p class="text-gray-600">Check back later for new championships and racing leagues.</p>
				</div>
			</Card>
		{:else if filteredChampionships.length === 0}
			<Card>
				<div class="py-8 text-center">
					<h2 class="mb-2 text-xl font-bold">No Results Found</h2>
					<p class="text-gray-600">Try adjusting your search terms or browse all championships.</p>
					<Button color="gray" class="mt-4" onclick={() => (searchQuery = '')}>Clear Search</Button>
				</div>
			</Card>
		{:else}
			<!-- Search Results Info -->
			{#if searchQuery.trim()}
				<div class="mb-4">
					<p class="text-sm text-gray-600 dark:text-gray-400">
						Found {filteredChampionships.length} championship{filteredChampionships.length === 1
							? ''
							: 's'} matching "{searchQuery}"
					</p>
				</div>
			{/if}

			<!-- Leagues Grid with Status Sections -->
			<div class="space-y-8">
				{#each ['planned', 'running', 'finished'] as status}
					{@const statusChampionships = filteredChampionships.filter((c) => c.status === status)}
					{#if statusChampionships.length > 0}
						<div>
							<h2
								class="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white"
							>
								{#if status === 'planned'}
									<span class="h-3 w-3 rounded-full bg-yellow-400"></span>
									Planned Championships
								{:else if status === 'running'}
									<span class="h-3 w-3 rounded-full bg-green-400"></span>
									Running Championships
								{:else if status === 'finished'}
									<span class="h-3 w-3 rounded-full bg-gray-400"></span>
									Finished Championships
								{/if}
								<span class="text-sm font-normal text-gray-500">({statusChampionships.length})</span
								>
							</h2>
							<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
								{#each statusChampionships as championship}
									<Card class="transition-shadow duration-200 hover:shadow-lg">
										{#if championship.image_path}
											<div class="h-48 overflow-hidden rounded-t-lg">
												<img
													src={championship.image_path}
													alt={championship.name}
													class="h-full w-full object-cover"
													onerror={handleImageError}
												/>
											</div>
										{/if}

										<div class="p-6">
											<h2 class="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
												{championship.name}
											</h2>

											<div class="mb-3 flex flex-wrap gap-2">
												{#if championship.season}
													<Badge color="blue">Season {championship.season}</Badge>
												{/if}
												{#if championship.status}
													<Badge
														color={championship.status === 'running'
															? 'green'
															: championship.status === 'finished'
																? 'gray'
																: 'yellow'}
													>
														{championship.status.charAt(0).toUpperCase() +
															championship.status.slice(1)}
													</Badge>
												{/if}
												{#if championship.round_count > 0}
													<Badge color="purple">{championship.round_count} Rounds</Badge>
												{/if}
											</div>

											<p class="mb-4 text-gray-600 dark:text-gray-400">
												{championship.description}
											</p>

											<!-- Date Information -->
											{#if championship.start_date || championship.end_date}
												<div class="mb-4 text-sm text-gray-500 dark:text-gray-400">
													<p>
														📅 {formatDateRange(championship.start_date, championship.end_date)}
													</p>
												</div>
											{/if}

											<!-- Sign-up Link for Running Leagues -->
											{#if championship.status === 'running' && championship.sign_up_link}
												<div class="mb-4">
													<a
														data-umami-event="navigate-to-league-sign-up"
														data-umami-event-league-id={championship.championship_id}
														href={championship.sign_up_link}
														target="_blank"
														rel="noopener noreferrer"
														class="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none dark:focus:ring-green-800"
													>
														Sign Up Now
													</a>
												</div>
											{/if}

											{#if championship.status === 'planned'}
												<Button color="emerald" href={championship.more_info}>More info</Button>
											{/if}
											{#if championship.status !== 'planned'}
												<Button
													data-umami-event="navigate-to-league-details"
													data-umami-event-league-id={championship.championship_id}
													color="blue"
													class="w-full"
													onclick={() => navigateToLeague(championship.championship_id)}
												>
													View League Details
												</Button>
											{/if}
										</div>
									</Card>
								{/each}
							</div>
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
</div>
