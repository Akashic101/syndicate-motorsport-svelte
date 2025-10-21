<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Navbar, NavBrand, NavHamburger, NavUl, NavLi, Button, Dropdown, Radio } from 'flowbite-svelte';
	import { page } from '$app/state';
	import { getLocale, setLocale } from "../lib/paraglide/runtime";
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import { De, Gb } from 'svelte-flags';
	import { generateOpenGraphTags } from '$lib/og';

	let { children } = $props();
	let activeUrl = $derived(page.url.pathname);

	// Default Open Graph tags
	const defaultOG = generateOpenGraphTags({
		title: 'Syndicate Motorsport - Professional Sim Racing Community',
		description: 'Join Syndicate Motorsport, a professional sim racing community with championships, leagues, and competitive racing across multiple platforms.',
		url: page.url.pathname
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	
	<!-- Default Open Graph Meta Tags -->
	<title>{defaultOG.title}</title>
	<meta name="description" content={defaultOG.description} />
	<meta property="og:title" content={defaultOG['og:title']} />
	<meta property="og:description" content={defaultOG['og:description']} />
	<meta property="og:image" content={defaultOG['og:image']} />
	<meta property="og:url" content={defaultOG['og:url']} />
	<meta property="og:type" content={defaultOG['og:type']} />
	<meta property="og:site_name" content={defaultOG['og:site_name']} />
	<meta property="og:locale" content={defaultOG['og:locale']} />
	
	<!-- Twitter Card Meta Tags -->
	<meta name="twitter:card" content={defaultOG['twitter:card']} />
	<meta name="twitter:title" content={defaultOG['twitter:title']} />
	<meta name="twitter:description" content={defaultOG['twitter:description']} />
	<meta name="twitter:image" content={defaultOG['twitter:image']} />
	
	<!-- Additional Meta Tags -->
	<meta name="robots" content={defaultOG.robots} />
	<meta name="author" content={defaultOG.author} />
	<meta name="viewport" content={defaultOG.viewport} />
</svelte:head>

<Navbar>
	<NavBrand href="/">
		<img
			src="/images/Syndicate_Logo_Clock.png"
			class="me-3 h-6 sm:h-9"
			alt="Syndicate Motorsport Logo"
		/>
		<span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
			Syndicate Motorsport
		</span>
	</NavBrand>

	<div class="flex md:order-2">
		<NavHamburger />
	</div>

	<NavUl {activeUrl}>
		<NavLi class="text-lg" href="/">Home</NavLi>
		<NavLi class="text-lg" href="/events-and-leagues">Events and Leagues</NavLi>
		<NavLi class="text-lg" href="/drivers">Drivers</NavLi>
		<NavLi class="text-lg" href="/lap-records">Lap Records</NavLi>
		<NavLi class="text-lg" href="/media">Media</NavLi>
		<NavLi class="text-lg" href="/support-us">Support Us</NavLi>
	</NavUl>
</Navbar>

{@render children?.()}
