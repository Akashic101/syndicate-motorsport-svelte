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
		const { data, error } = await supabase.auth.exchangeCodeForSession(code);
		
		// Check if we have a session after exchange
		if (data?.session) {
			// Clean redirect to next path (no query params)
			// SvelteKit redirect() handles relative paths correctly
			throw redirect(303, next);
		}
		
		// If no session in data, try to get it directly (cookies might be set but not in response)
		const { data: sessionData } = await supabase.auth.getSession();
		if (sessionData?.session) {
			// Clean redirect to next path (no query params)
			throw redirect(303, next);
		}
		
		// If there was an error and no session, log it for debugging
		if (error) {
			console.error('Error exchanging code for session:', error);
		}
	}

	// return the user to an error page with instructions
	throw redirect(303, '/auth/auth-code-error');
};

