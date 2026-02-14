import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const handle: Handle = async ({ event, resolve }) => {
	const method = event.request.method;

	// Block unsupported HTTP methods early
	if (method === 'TRACE' || method === 'TRACK') {
		return new Response('Method Not Allowed', { status: 405 });
	}

	// Create Supabase client for server-side use with cookie handling
	// Following official Supabase SvelteKit SSR pattern
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return event.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, {
						path: '/',
						...options
					});
				});
			}
		}
	});

	return paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			filterSerializedResponseHeaders(name) {
				return name === 'content-range' || name === 'x-supabase-api-version';
			},
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});
};
