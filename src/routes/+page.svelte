<script lang="ts">
	import { Section, HeroHeader } from 'flowbite-svelte-blocks';
	import {
		Button,
		Table,
		TableHead,
		TableHeadCell,
		TableBody,
		TableBodyRow,
		TableBodyCell,
		Video,
		Card
	} from 'flowbite-svelte';
	import { ArrowRightOutline, CalendarMonthSolid, DiscordSolid } from 'flowbite-svelte-icons';
	import type { Championship } from '$lib/types';
	let { data } = $props<{
		data: {
			events: { title: string; href: string; time: number }[];
			championships: Championship[];
			stats: {
				discordMembers: number;
				totalRaces: number;
				simGames: number;
				yearsOfExperience: number;
			};
		};
	}>();
	import { m } from '$lib/paraglide/messages.js';

	// Function to format time consistently in BST
	function formatEventTime(timestamp: number): string {
		try {
			// Convert to integer if it's a floating point number
			const intTimestamp = Math.floor(timestamp);
			const date = new Date(intTimestamp);

			// Check if the date is valid
			if (isNaN(date.getTime())) {
				console.warn('Invalid timestamp:', timestamp, 'converted to:', intTimestamp);
				return 'Invalid date';
			}

			// Always format in BST (Europe/London timezone)
			const bstTime = date.toLocaleString('en-US', {
				timeZone: 'Europe/London',
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
				hour12: true
			});

			// Get BST/GMT abbreviation
			const timeZoneName =
				date
					.toLocaleString('en-US', {
						timeZone: 'Europe/London',
						timeZoneName: 'short'
					})
					.split(' ')
					.pop() || 'BST';

			return `${bstTime} ${timeZoneName}`;
		} catch (error) {
			console.error('Error formatting event time:', error);
			return 'Invalid date';
		}
	}
</script>

<section class="relative w-full">
	<Video
		src="/videos/intro.mp4"
		class="h-[60vh] w-full object-cover object-center"
		autoplay
		muted
		loop
		playsinline
	/>
	<div class="absolute inset-0 flex items-center justify-center p-4">
		<HeroHeader
			h1Class="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white text-center"
			pClass="text-center max-w-2xl mb-6 dark:text-white font-normal lg:mb-8 md:text-lg lg:text-xl sm:px-0 lg:px-0 xl:px-0"
		>
			{#snippet h1()}Syndicate Motorsport{/snippet}
			{#snippet paragraph()}From historic cars to modern day racing, Syndicate Motorsport is a
				community of sim racers who are passionate about the sport.{/snippet}
			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<Button
					size="xl"
					href="https://discord.gg/c3N6ZkAEue"
					class="w-full px-8 py-4 text-xl sm:w-auto dark:text-black"
				>
					<span class="flex items-center gap-2">
						<DiscordSolid class="h-6 w-6 shrink-0" />
						{m.that_male_martin_read()}
					</span>
				</Button>
				<Button
					size="xl"
					href="/events-and-leagues"
					class="w-full px-8 py-4 text-xl sm:w-auto dark:text-black"
				>
					<span class="flex items-center gap-2">
						<CalendarMonthSolid class="h-6 w-6 shrink-0" />
						See our leagues
					</span>
				</Button>
			</div>
		</HeroHeader>
	</div>
</section>

<section class="flex flex-col p-4 md:flex-row">
	{#if data?.events?.length}
		<Card class="m-3 max-w-full p-3 md:max-w-[50%]">
			<div class="px-4 py-8">
				<h3 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Events</h3>
				<Table>
					<TableHead>
						<TableHeadCell>Event</TableHeadCell>
						<TableHeadCell>Time</TableHeadCell>
					</TableHead>
					<TableBody>
						{#each data.events as item}
							<TableBodyRow>
								<TableBodyCell>
									<a
										href={item.href}
										target="_blank"
										rel="noopener noreferrer"
										class="text-primary-600 hover:underline"
									>
										{item.title}
									</a>
								</TableBodyCell>

								<TableBodyCell class="whitespace-nowrap">
									{formatEventTime(item.time)}
								</TableBodyCell>
							</TableBodyRow>
						{/each}
					</TableBody>
				</Table>
			</div>
		</Card>
		<Card class="m-3 max-w-full p-3 md:max-w-[50%]">
			<div class="px-4 py-8">
				<h3 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
					Active Championships
				</h3>
				{#if data?.championships?.length}
					<div class="space-y-3">
						{#each data.championships as championship}
							<div
								class="flex items-center space-x-4 border-b border-gray-200 py-2 last:border-b-0"
							>
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm text-xl text-gray-900 dark:text-white">
										{championship.name || 'Unnamed Championship'}
									</p>
									{#if championship.description}
										<p class="text-md line-clamp-3 text-gray-500 dark:text-gray-400">
											{championship.description}
										</p>
									{/if}
									{#if championship.season}
										<p class="text-sm text-gray-400 dark:text-gray-500">
											Season {championship.season} | {championship.round_count} Rounds
											{#if championship.start_date || championship.end_date}
												|
												{new Date(championship.start_date).toLocaleDateString()} - {new Date(
													championship.end_date
												).toLocaleDateString()}
											{/if}
										</p>
									{/if}
								</div>
								<div class="flex flex-col items-center gap-2 lg:flex-row sm:gap-0">
									<Button
										size="sm"
										href={`/events-and-leagues/${championship.championship_id}`}
										class="text-black m-2"
									>
										View Info
									</Button>
									{#if championship.sign_up_link}
										<Button
											size="sm"
											href={championship.sign_up_link}
											target="_blank"
											rel="noopener noreferrer"
											class="text-black m-2"
										>
											Sign Up
										</Button>
									{:else}
										<Button
											class="text-black m-2"
											size="sm"
											href="/events-and-leagues/{championship.championship_id}"
										>
											View
										</Button>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<p class="py-4 text-center text-gray-500 dark:text-gray-400">
						No active championships at the moment
					</p>
				{/if}
			</div>
		</Card>
	{/if}
</section>

<section>
	<div class="bg-[#6f7480] px-4 py-16 dark:bg-[#1c1b22]">
		<div class="mx-auto max-w-2xl rounded-2xl p-8 text-center">
			<div
				class="flex items-center justify-center gap-2 text-sm tracking-widest text-slate-300 uppercase"
			>
				<DiscordSolid class="h-5 w-5" />
				Powered by Discord
			</div>
			<h2 class="mt-4 text-4xl font-bold text-white">Join our community!</h2>
			<p class="mt-3 text-slate-300">Weekly races, community events, friendly chats and more!</p>
			<div class="mt-6 flex justify-center">
				<Button size="xl" href="https://discord.gg/c3N6ZkAEue" class="px-6 dark:text-black">
					<span class="flex items-center gap-2">
						<DiscordSolid class="h-5 w-5" />
						Join Now
					</span>
				</Button>
			</div>
		</div>
	</div>
</section>

<section>
	<div class="p-8">
		<div class="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
			<div class="relative rounded-2xl bg-slate-900/60 p-6 shadow-sm">
				<div class="text-slate-300">Discord Members</div>
				<div class="mt-4 text-2xl font-semibold text-white">
					{data.stats.discordMembers.toLocaleString()}
				</div>
				<div class="absolute top-4 right-4 h-7 w-7 rounded-lg bg-blue-400"></div>
			</div>
			<div class="relative rounded-2xl bg-slate-900/60 p-6 shadow-sm">
				<div class="text-slate-300">Races held</div>
				<div class="mt-4 text-2xl font-semibold text-white">
					{data.stats.totalRaces.toLocaleString()}
				</div>
				<div class="absolute top-4 right-4 h-7 w-7 rounded-lg bg-rose-400"></div>
			</div>
			<div class="relative rounded-2xl bg-slate-900/60 p-6 shadow-sm">
				<div class="text-slate-300">Sim games</div>
				<div class="mt-4 text-2xl font-semibold text-white">{data.stats.simGames}</div>
				<div class="absolute top-4 right-4 h-7 w-7 rounded-lg bg-green-500"></div>
			</div>
			<div class="relative rounded-2xl bg-slate-900/60 p-6 shadow-sm">
				<div class="text-slate-300">Years of experience</div>
				<div class="mt-4 text-2xl font-semibold text-white">{data.stats.yearsOfExperience}+</div>
				<div class="absolute top-4 right-4 h-7 w-7 rounded-lg bg-amber-400"></div>
			</div>
		</div>
	</div>
</section>
