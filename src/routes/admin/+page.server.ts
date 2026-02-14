import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

function get_authorized_user_ids(): string[] {
	// Get authorized Discord user IDs from environment variable
	// Format: comma-separated list of Discord user IDs
	const authorized_ids_env = env.AUTHORIZED_USER_IDS;
	if (!authorized_ids_env) {
		return [];
	}
	// Remove quotes if present (sometimes .env files have quotes)
	const cleaned = authorized_ids_env.replace(/^['"]|['"]$/g, '');
	return cleaned
		.split(',')
		.map((id) => id.trim())
		.filter((id) => id.length > 0);
}

export const load: PageServerLoad = async ({ locals, url }) => {
	// Get the session first to check if user is already authenticated
	// Following official Supabase SvelteKit SSR pattern
	let session = null;
	let discord_id = null;

	if (locals.supabase) {
		const { data, error } = await locals.supabase.auth.getSession();
		if (!error && data.session) {
			session = data.session;
			discord_id =
				data.session.user?.user_metadata?.provider_id ||
				data.session.user?.user_metadata?.discord_id;
		}
	}

	// If there's a code parameter, always redirect to callback handler to process it
	// This ensures codes are processed and removed from the URL
	if (url.searchParams.has('code')) {
		const next = url.searchParams.get('next') ?? '/admin';
		const code = url.searchParams.get('code');
		// Redirect to callback handler which will process the code and redirect to clean URL
		throw redirect(303, `/auth/callback?code=${code}&next=${encodeURIComponent(next)}`);
	}

	// Get authorized Discord user IDs
	const authorized_user_ids = get_authorized_user_ids();

	// If there's an authorized list configured
	if (authorized_user_ids.length > 0) {
		// If user is logged in but not authorized, redirect
		if (discord_id && !authorized_user_ids.includes(discord_id)) {
			throw redirect(303, '/admin/not-authorized');
		}
	} else {
		// If no authorized list is configured, deny all access
		if (discord_id) {
			throw redirect(303, '/admin/not-authorized');
		}
	}

	return {
		session
	};
};
