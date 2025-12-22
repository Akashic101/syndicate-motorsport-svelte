import { redirect } from '@sveltejs/kit';

export const GET = async (event) => {
	const {
		url,
		locals: { supabase }
	} = event;
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/admin';

	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			// Clean redirect path without any query parameters
			const redirect_path = next.startsWith('/') ? next : `/${next}`;
			// Create a new URL to ensure no query params are included
			const clean_url = new URL(redirect_path, url.origin);
			throw redirect(303, clean_url.pathname);
		}
	}

	// return the user to an error page with instructions
	throw redirect(303, '/auth/auth-code-error');
};

