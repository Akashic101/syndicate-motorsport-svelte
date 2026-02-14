<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';

	async function sign_out() {
		await supabase.auth.signOut();
		await goto('/admin');
	}
</script>

<svelte:head>
	<title>Not Authorized - Syndicate Motorsport</title>
	<meta name="description" content="Access denied" />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
	<div class="w-full max-w-2xl space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
		<div class="text-center">
			<img
				src="/images/cry_about_it.gif"
				alt="Cry about it"
				class="mx-auto mb-6 max-w-md rounded-lg"
			/>
			<h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
				Nice Try, But No
			</h1>
			<div class="space-y-3 text-lg text-gray-700 dark:text-gray-300">
				<p>
					Oh look, someone thought they could just waltz in here without being on the authorized list. How cute.
				</p>
				<p>
					You really went through all that trouble of logging in with Discord, thinking you'd get access to the admin panel? That's adorable.
				</p>
				<p class="font-semibold text-red-600 dark:text-red-400">
					Your user ID isn't in the list. You're not special enough. Deal with it.
				</p>
				<p class="text-sm italic text-gray-500 dark:text-gray-400">
					Maybe try asking nicely next time? Or, you know, just don't try at all.
				</p>
			</div>
		</div>

		<div class="space-y-4">
			<Button color="blue" size="xl" class="w-full" onclick={sign_out}>
				Get Out
			</Button>
		</div>
	</div>
</div>

