import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Get session to show user info, but don't check authorization
	// This page should be accessible to logged-in users who aren't authorized
	let session = null;

	if (locals.supabase) {
		const { data } = await locals.supabase.auth.getSession();
		session = data.session;
	}

	return {
		session
	};
};

