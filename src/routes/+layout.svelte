<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Navbar, NavBrand, NavHamburger, NavUl, NavLi, Button, Dropdown, Radio } from 'flowbite-svelte';
	import { page } from '$app/state';

	let { children } = $props();
	let activeUrl = $derived(page.url.pathname);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	
	<!-- Basic meta tags that apply to all pages -->
	<meta name="robots" content="index, follow" />
	<meta name="author" content="Syndicate Motorsport" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<Navbar>
	<NavBrand data-umami-event="navigate-to-home" href="/">
		<img
			src="/images/Syndicate_Logo.svg"
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
		<NavLi class="text-lg" data-umami-event="navigate-to-home" href="/">Home</NavLi>
		<NavLi class="text-lg" data-umami-event="navigate-to-events-and-leagues" href="/events-and-leagues">Events and Leagues</NavLi>
		<NavLi class="text-lg" data-umami-event="navigate-to-drivers" href="/drivers">Drivers</NavLi>
		<NavLi class="text-lg" data-umami-event="navigate-to-lap-records" href="/lap-records">Lap Records</NavLi>
		<NavLi class="text-lg" data-umami-event="navigate-to-media" href="/media">Media</NavLi>
		<NavLi class="text-lg" data-umami-event="navigate-to-support-us" href="/support-us">Support Us</NavLi>
	</NavUl>
</Navbar>

{@render children?.()}
