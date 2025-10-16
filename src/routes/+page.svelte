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
	let { data } = $props<{ data: { events: { title: string; href: string; time: string }[] } }>();
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
				Join our Discord
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
								{item.time} BST (UTC+1)
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
				<div class="mt-4 text-2xl font-semibold text-white">850</div>
				<div class="absolute top-4 right-4 h-7 w-7 rounded-lg bg-blue-400"></div>
			</div>
			<div class="relative rounded-2xl bg-slate-900/60 p-6 shadow-sm">
				<div class="text-slate-300">Races held</div>
				<div class="mt-4 text-2xl font-semibold text-white">1673</div>
				<div class="absolute top-4 right-4 h-7 w-7 rounded-lg bg-rose-400"></div>
			</div>
			<div class="relative rounded-2xl bg-slate-900/60 p-6 shadow-sm">
				<div class="text-slate-300">Sim games</div>
				<div class="mt-4 text-2xl font-semibold text-white">3</div>
				<div class="absolute top-4 right-4 h-7 w-7 rounded-lg bg-green-500"></div>
			</div>
			<div class="relative rounded-2xl bg-slate-900/60 p-6 shadow-sm">
				<div class="text-slate-300">Years of experience</div>
				<div class="mt-4 text-2xl font-semibold text-white">4+</div>
				<div class="absolute top-4 right-4 h-7 w-7 rounded-lg bg-amber-400"></div>
			</div>
		</div>
	</div>
</section>
