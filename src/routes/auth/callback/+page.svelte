<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { supabase } from '$lib/supabaseClient';

	async function set_session_cookies(session: any) {
		// Set cookies so server can read the session
		if (session?.access_token && session?.refresh_token) {
			// Set cookies with proper expiration
			const expires_at = session.expires_at 
				? new Date(session.expires_at * 1000).toUTCString()
				: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString(); // 7 days default
			
			document.cookie = `sb-access-token=${session.access_token}; path=/; expires=${expires_at}; SameSite=Lax`;
			document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; expires=${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()}; SameSite=Lax`;
		}
	}

	onMount(async () => {
		const hash_params = new URLSearchParams(window.location.hash.substring(1));
		const code = page.url.searchParams.get('code');
		const next = page.url.searchParams.get('next') ?? '/admin';

		// If we have a code parameter, try to exchange it
		if (code) {
			const { data, error } = await supabase.auth.exchangeCodeForSession(code);
			if (!error && data.session) {
				await set_session_cookies(data.session);
				const redirect_path = next.startsWith('/') ? next : `/${next}`;
				await goto(redirect_path);
				return;
			}
		}

		// If we have tokens in the hash, Supabase client should handle them automatically
		// The Supabase client automatically processes hash fragments on initialization
		if (hash_params.has('access_token')) {
			// Wait a moment for Supabase to process the hash and set the session
			await new Promise((resolve) => setTimeout(resolve, 1000));
			
			// Check if we have a session now
			const { data: { session }, error } = await supabase.auth.getSession();
			if (session && !error) {
				await set_session_cookies(session);
				const redirect_path = next.startsWith('/') ? next : `/${next}`;
				await goto(redirect_path);
				return;
			}
		}

		// If we get here, something went wrong
		await goto('/auth/auth-code-error');
	});
</script>

<div class="flex min-h-screen items-center justify-center">
	<div class="text-center">
		<p class="text-lg text-gray-600 dark:text-gray-400">Completing sign in...</p>
	</div>
</div>

