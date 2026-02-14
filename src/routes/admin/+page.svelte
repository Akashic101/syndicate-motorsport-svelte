<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { DiscordSolid } from 'flowbite-svelte-icons';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';

	let { data } = $props<{
		data: {
			session: any;
		};
	}>();

	let loading = $state(false);
	let user = $state(data.session?.user ?? null);

	onMount(() => {
		// Listen for auth state changes
		supabase.auth.onAuthStateChange((_event, session) => {
			user = session?.user ?? null;
		});
	});

	async function sign_in_with_discord() {
		loading = true;
		// Following official Supabase Discord auth docs pattern
		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'discord',
			options: {
				redirectTo: `${page.url.origin}/auth/callback?next=/admin`
			}
		});

		if (error) {
			loading = false;
			alert('Failed to sign in with Discord. Please try again.');
		}
		// Note: signInWithOAuth automatically redirects, so we don't need to handle success
	}

	async function sign_out() {
		loading = true;
		// Following official Supabase docs pattern
		// https://supabase.com/docs/guides/auth/social-login/auth-discord
		const { error } = await supabase.auth.signOut();

		// Clear local state regardless of error (handles case where session is already missing)
		user = null;

		if (error) {
			// If it's a session missing error, that's fine - session is already cleared
			if (
				!error.message?.includes('session missing') &&
				!error.message?.includes('AuthSessionMissingError')
			) {
				loading = false;
				alert('Failed to sign out. Please try again.');
				return;
			}
		}

		// Refresh server-side data and redirect
		await invalidateAll();
		await goto('/admin');
		loading = false;
	}
</script>

<svelte:head>
	<title>Admin - Syndicate Motorsport</title>
	<meta name="description" content="Admin panel for Syndicate Motorsport" />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
	<div class="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
		<div class="text-center">
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">Sign in to access the admin area</p>
		</div>

		{#if user}
			<div class="space-y-4">
				<div class="rounded-lg bg-green-50 p-6 dark:bg-green-900/20">
					<div class="mb-4 text-center">
						{#if user.user_metadata?.avatar_url}
							<img
								src={user.user_metadata.avatar_url}
								alt="Profile avatar"
								class="mx-auto mb-3 h-20 w-20 rounded-full"
							/>
						{/if}
						<h2 class="text-xl font-semibold text-green-900 dark:text-green-100">
							{user.user_metadata?.full_name ?? user.user_metadata?.name ?? 'User'}
						</h2>
					</div>

					<div class="space-y-3 border-t border-green-200 pt-4 dark:border-green-800">
						<div>
							<p class="text-xs font-medium text-green-700 uppercase dark:text-green-300">
								User ID
							</p>
							<p class="mt-1 text-sm break-all text-green-900 dark:text-green-100">
								{user.id}
							</p>
						</div>

						{#if user.email}
							<div>
								<p class="text-xs font-medium text-green-700 uppercase dark:text-green-300">
									Email
								</p>
								<p class="mt-1 text-sm text-green-900 dark:text-green-100">{user.email}</p>
							</div>
						{/if}

						{#if user.user_metadata?.preferred_username}
							<div>
								<p class="text-xs font-medium text-green-700 uppercase dark:text-green-300">
									Discord Username
								</p>
								<p class="mt-1 text-sm text-green-900 dark:text-green-100">
									{user.user_metadata.preferred_username}
								</p>
							</div>
						{/if}

						{#if user.user_metadata?.discord_id}
							<div>
								<p class="text-xs font-medium text-green-700 uppercase dark:text-green-300">
									Discord ID
								</p>
								<p class="mt-1 text-sm text-green-900 dark:text-green-100">
									{user.user_metadata.discord_id}
								</p>
							</div>
						{/if}

						<div>
							<p class="text-xs font-medium text-green-700 uppercase dark:text-green-300">
								Account Created
							</p>
							<p class="mt-1 text-sm text-green-900 dark:text-green-100">
								{new Date(user.created_at).toLocaleString()}
							</p>
						</div>

						{#if user.last_sign_in_at}
							<div>
								<p class="text-xs font-medium text-green-700 uppercase dark:text-green-300">
									Last Sign In
								</p>
								<p class="mt-1 text-sm text-green-900 dark:text-green-100">
									{new Date(user.last_sign_in_at).toLocaleString()}
								</p>
							</div>
						{/if}
					</div>
				</div>

				<Button color="red" size="xl" class="w-full" onclick={sign_out} disabled={loading}>
					Sign Out
				</Button>
			</div>
		{:else}
			<div class="space-y-4">
				<Button
					color="blue"
					size="xl"
					class="w-full"
					onclick={sign_in_with_discord}
					disabled={loading}
				>
					<span class="flex items-center justify-center gap-2">
						<DiscordSolid class="h-5 w-5" />
						{loading ? 'Signing in...' : 'Sign in with Discord'}
					</span>
				</Button>
			</div>
		{/if}
	</div>
</div>
