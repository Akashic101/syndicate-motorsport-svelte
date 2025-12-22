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
	return cleaned.split(',').map((id) => id.trim()).filter((id) => id.length > 0);
}

export const load: PageServerLoad = async ({ locals, cookies, url }) => {
	// If there's a code parameter, redirect to callback handler to process it
	if (url.searchParams.has('code')) {
		const next = url.searchParams.get('next') ?? '/admin';
		const code = url.searchParams.get('code');
		throw redirect(303, `/auth/callback?code=${code}&next=${encodeURIComponent(next)}`);
	}

	// Get the session using locals.supabase (which handles cookies automatically)
	let session = null;
	let discord_id = null;

	if (locals.supabase) {
		const { data, error } = await locals.supabase.auth.getSession();
		if (!error && data.session) {
			session = data.session;
			discord_id = data.session.user?.user_metadata?.provider_id || data.session.user?.user_metadata?.discord_id;
		} else {
			// Try to get user directly (this makes a request to Supabase)
			const { data: user_data, error: user_error } = await locals.supabase.auth.getUser();
			if (user_data.user && !user_error) {
				discord_id = user_data.user.user_metadata?.provider_id || user_data.user.user_metadata?.discord_id;
				// Create a minimal session object
				session = { user: user_data.user };
			}
			
			// Also check for manually set cookies (from client-side callback)
			const access_token = cookies.get('sb-access-token');
			const refresh_token = cookies.get('sb-refresh-token');
			if (access_token && refresh_token && !discord_id) {
				const { data: session_data, error: session_error } = await locals.supabase.auth.setSession({
					access_token,
					refresh_token
				});
				if (!session_error && session_data.session) {
					session = session_data.session;
					discord_id = session_data.session.user?.user_metadata?.provider_id || session_data.session.user?.user_metadata?.discord_id;
				}
			}
		}
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

