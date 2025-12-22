import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const handle: Handle = async ({ event, resolve }) => {
	const method = event.request.method;

	// Block unsupported HTTP methods early
	if (method === 'TRACE' || method === 'TRACK') {
		return new Response('Method Not Allowed', { status: 405 });
	}

	// Create Supabase client for server-side use with cookie handling
	event.locals.supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => {
				return event.cookies.getAll().map((cookie) => ({
					name: cookie.name,
					value: cookie.value
				}));
			},
			setAll: (cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, {
						path: '/',
						...(options as Record<string, unknown>)
					});
				});
			}
		}
	} as Parameters<typeof createClient>[2]);

	return paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});
};
