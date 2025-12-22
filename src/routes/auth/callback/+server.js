import { redirect } from '@sveltejs/kit';

// Following official Supabase SvelteKit SSR pattern for OAuth callback
export const GET = async (event) => {
	const {
		url,
		locals: { supabase }
	} = event;
	const code = url.searchParams.get('code');
	// if "next" is in param, use it as the redirect URL
	let next = url.searchParams.get('next') ?? '/admin';
	if (!next.startsWith('/')) {
		// if "next" is not a relative URL, use the default
		next = '/admin';
	}

	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			// Redirect to the next path (clean URL without query params)
			throw redirect(303, next);
		}
	}

	// return the user to an error page with instructions
	throw redirect(303, '/auth/auth-code-error');
};

