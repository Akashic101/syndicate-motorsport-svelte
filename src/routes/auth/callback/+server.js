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
		// Sometimes exchangeCodeForSession returns an error but still creates a session
		if (data?.session) {
			// Redirect to the next path (clean URL without query params)
			throw redirect(303, next);
		}
		
		// If no session in data, try to get it directly
		const { data: sessionData } = await supabase.auth.getSession();
		if (sessionData?.session) {
			// Session exists, redirect to next
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

