<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { getSupportUsOGData } from '$lib/og';

	// Generate Open Graph data for support page
	const ogData = getSupportUsOGData();

	const socialLinks = {
		patreon: 'https://www.patreon.com/syndicate_motorsport',
		discord: 'https://discord.gg/c3N6ZkAEue',
		youtube: 'https://www.youtube.com/@syndicatemotorsport',
		instagram: 'https://www.instagram.com/syndicate.motorsport/',
		bluesky: 'https://bsky.app/profile/synmotorsport.bsky.social#'
	};

	type Tier = {
		name: string;
		price: string | number;
		description: string;
		benefits: string[];
		link: string;
		recommended?: boolean;
	};

	const patreonTiers: Tier[] = [
		{
			name: 'Supporter',
			price: 2,
			description:
				"Becoming a 'Supporter' means you are directly helping to support our server and website running costs in addition to allowing us to continue hosting events and leagues. With your support we will be able to more effectively grow our community.",
			benefits: [
				'Discord role: Stand out in the Discord server as a supporter',
				'Early Access: Get access to league registration first',
				'Priority Slots: Get priority when joining leagues',
				'Discord Channels: Get access to special channels for supporters'
			],
			link: 'https://www.patreon.com/checkout/syndicate_motorsport?rid=9449419',
			recommended: true
		},
		{
			name: 'Supporter Plus',
			price: 6.5,
			description:
				"The 'Supporter Plus' tier offers all of the great benefits of our 'Supporter' tier with a few extras thrown in to show you how much we appreciate your support. As extras over the 'Supporter' tier we will provide you with a custom livery for our leagues (includes car and driver suit). You will also be able to commission one digital artwork, such as those features on this page, per month.",
			benefits: [
				'Early Access: Get access to league registration first',
				'Priority Slots: Get priority when joining leagues',
				'Discord Channels: Get access to special channels for supporters',
				'Discord role: Stand out in the Discord server as a supporter',
				'Custom Car and Driver Livery for leagues',
				'Digital Artwork Commissions (One per month)'
			],
			link: 'https://www.patreon.com/checkout/syndicate_motorsport?rid=11536150'
		},
		{
			name: 'Supporter Pro',
			price: 13,
			description:
				"The 'Supporter Pro' tier offers all of the great benefits of our 'Supporter Plus' tier with the added benefit of being able to contribute to planning discussions.",
			benefits: [
				'Early Access: Get access to league registration first',
				'Priority Slots: Get priority when joining leagues',
				'Discord Channels: Get access to special channels for supporters',
				'Discord role: Stand out in the Discord server as a supporter',
				'AC Dedicated Server'
			],
			link: 'https://www.patreon.com/checkout/syndicate_motorsport?rid=9571244'
		}
	];

	type Server = {
		name: string;
		description: string;
		contact: string;
		liveTiming: string;
		joinLink: string;
	};

	const servers: Server[] = [
		{
			name: 'Assetto Corsa #1',
			description: 'Primary server, usually used for Saturday nights.',
			contact: 'PirateLaserBeam',
			liveTiming: 'http://138.201.226.34:8092/live-timing',
			joinLink: 'https://acstuff.ru/s/q:race/online/join?httpPort=8081&ip=138.201.226.34'
		},
		{
			name: 'Assetto Corsa #2',
			description: 'Secondary server, usually used for Wednesday nights.',
			contact: 'Red',
			liveTiming: 'http://138.201.226.34:8192/live-timing',
			joinLink: 'https://acstuff.ru/s/q:race/online/join?httpPort=8182&ip=138.201.226.34'
		},
		{
			name: 'Assetto Corsa #3',
			description: 'Fun race server, usually used for non ELO enabled events.',
			contact: 'PirateLaserBeam',
			liveTiming: 'http://138.201.226.34:8392/live-timing',
			joinLink: 'https://acstuff.ru/s/q:race/online/join?httpPort=8381&ip=138.201.226.34'
		}
	];
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

<div class="bg-linear-180 from-[#1e2939] to-[#1a1a1a]">
	<div class="container mx-auto px-4 py-8">
		<section class="mb-12">
			<h1 class="mb-6 text-4xl font-bold dark:text-white">Support Syndicate Motorsport</h1>

			<div class=" mb-8 rounded-lg p-6 shadow-lg">
				<p class="mb-6 text-lg dark:text-white">
					As many of you know, we run our events on dedicated servers along with hosting a website
					for stats tracking. We don't pass the cost of this infrastructure onto our drivers and
					never intend to. Some of you however have voluntarily expressed an interest in directly
					supporting the community via donations or contributions to enable further growth. To this
					end we have the following ways in which you can directly support Syndicate Motorsport:
				</p>

				<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
					<Button
						class="text-md text-black"
						data-umami-event="navigate-to-patreon"
						href={socialLinks.patreon}>Support on Patreon</Button
					>
					<Button
						class="text-md text-black"
						data-umami-event="navigate-to-discord"
						href={socialLinks.discord}>Join Discord</Button
					>
					<Button
						class="text-md text-black"
						data-umami-event="navigate-to-youtube"
						href={socialLinks.youtube}>YouTube Channel</Button
					>
					<Button
						class="text-md text-black"
						data-umami-event="navigate-to-instagram"
						href={socialLinks.instagram}>Follow on Instagram</Button
					>
					<Button
						class="text-md text-black"
						data-umami-event="navigate-to-bluesky"
						href={socialLinks.bluesky}>Follow on BlueSky</Button
					>
				</div>
			</div>

			<div class="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
				{#each patreonTiers as tier}
					<div
						class="relative rounded-lg border border-primary-500 p-6 shadow-lg transition-shadow hover:shadow-xl"
					>
						{#if tier.recommended}
							<div
								class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-4 py-1 text-sm"
							>
								Recommended
							</div>
						{/if}
						<h3 class="mb-2 text-2xl font-bold dark:text-white">{tier.name}</h3>
						<div class="mb-4 flex items-baseline">
							<span class="text-3xl font-bold dark:text-white">€{tier.price}</span>
							<span class="ml-2 dark:text-white">/ month</span>
							<span class="ml-2 text-sm dark:text-white">(plus VAT)</span>
						</div>
						<p class="mb-6 dark:text-white">{tier.description}</p>
						<ul class="mb-6 space-y-3">
							{#each tier.benefits as benefit}
								<li class="flex items-start gap-2">
									<span class="mt-1 text-sky-500">•</span>
									<span class="dark:text-white">{benefit}</span>
								</li>
							{/each}
							<a
								data-umami-event="navigate-to-patreon-join-tier"
								data-umami-event-tier-name={tier.name}
								href={tier.link}
								target="_blank"
								class="block rounded-lg bg-primary-600 px-4 py-2 text-center transition-all hover:bg-primary-800"
								>Join Now</a
							>
						</ul>
					</div>
				{/each}
			</div>
		</section>

		<section>
			<h2 class="mb-6 text-3xl font-bold dark:text-white">Our Racing Servers</h2>
			<p class="mb-6 text-lg dark:text-white">
				We currently run the following servers for our events:
			</p>

			<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{#each servers as server}
					<div class="rounded-lg border border-primary-500 p-6">
						<h3 class="mb-3 text-2xl font-bold dark:text-white">{server.name}</h3>
						<p class="mb-4 dark:text-white">{server.description}</p>
						<div class="space-y-3">
							<a
								data-umami-event="navigate-to-live-timing"
								data-umami-event-server-name={server.name}
								href={server.liveTiming}
								target="_blank"
								class="block text-sky-400 hover:text-sky-300">Live Timing</a
							>
							<a
								data-umami-event="navigate-to-join-server"
								data-umami-event-server-name={server.name}
								href={server.joinLink}
								target="_blank"
								class="block text-sky-400 hover:text-sky-300">Join Server (Requires CM)</a
							>
							<p class="text-sm dark:text-white">
								Primary contact: <span class="font-semibold dark:text-white">{server.contact}</span>
							</p>
						</div>
					</div>
				{/each}
			</div>
		</section>
	</div>
</div>
