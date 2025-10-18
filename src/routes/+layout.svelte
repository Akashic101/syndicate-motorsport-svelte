<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Navbar, NavBrand, NavHamburger, NavUl, NavLi, Button, Dropdown, Radio } from 'flowbite-svelte';
	import { page } from '$app/state';
	import { getLocale, setLocale } from "../lib/paraglide/runtime";
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import { De, Gb } from 'svelte-flags';

	let { children } = $props();
	let activeUrl = $derived(page.url.pathname);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
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
