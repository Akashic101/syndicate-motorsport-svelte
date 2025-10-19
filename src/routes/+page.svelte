<script lang="ts">
	import {
		Button,
		Table,
		TableHead,
		TableHeadCell,
		TableBody,
		TableBodyRow,
		TableBodyCell
	} from 'flowbite-svelte';
	import { DiscordSolid } from 'flowbite-svelte-icons';
	let { data } = $props<{ 
		data: { 
			events: { title: string; href: string; time: number }[];
			stats: {
				discordMembers: number;
				totalRaces: number;
				simGames: number;
				yearsOfExperience: number;
			};
		} 
	}>();
	import { m } from "$lib/paraglide/messages.js"

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
			const timeZoneName = date.toLocaleString('en-US', {
				timeZone: 'Europe/London',
				timeZoneName: 'short'
			}).split(' ').pop() || 'BST';

			return `${bstTime} ${timeZoneName}`;
		} catch (error) {
			console.error('Error formatting event time:', error);
			return 'Invalid date';
		}
	}
</script>

<section class="relative w-full">
	<img
		src="/images/Merc-190E.jpg"
		alt="Syndicate Motorsport"
		class="h-[60vh] w-full object-cover object-center"
	/>
	<div class="absolute inset-0 flex items-center justify-center">
		<Button
			size="xl"
			href="https://discord.gg/c3N6ZkAEue"
			class="px-8 py-4 text-xl dark:text-black"
		>
			<span class="flex items-center gap-2">
				<DiscordSolid class="h-6 w-6 shrink-0" />
				{m.that_male_martin_read()}
			</span>
		</Button>
	</div>
</section>

<section>
	{#if data?.events?.length}
		<div class="px-4 py-8">
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
				<div class="mt-4 text-2xl font-semibold text-white">{data.stats.discordMembers.toLocaleString()}</div>
				<div class="absolute top-4 right-4 h-7 w-7 rounded-lg bg-blue-400"></div>
			</div>
			<div class="relative rounded-2xl bg-slate-900/60 p-6 shadow-sm">
				<div class="text-slate-300">Races held</div>
				<div class="mt-4 text-2xl font-semibold text-white">{data.stats.totalRaces.toLocaleString()}</div>
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
