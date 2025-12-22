import { redirect } from '@sveltejs/kit';

export const GET = async (event) => {
	const {
		url,
		locals: { supabase }
	} = event;
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/admin';

	if (code) {
		const { data, error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error && data.session) {
			const redirect_path = next.startsWith('/') ? next : `/${next}`;
			throw redirect(303, redirect_path);
		}
	}

	// If no code, let the client-side page handle hash-based tokens
	return new Response(null, { status: 200 });
};

