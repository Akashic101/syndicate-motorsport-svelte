import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';

export const handle: Handle = async ({ event, resolve }) => {
	const method = event.request.method;

	// Block unsupported HTTP methods early
	if (method === 'TRACE' || method === 'TRACK') {
		return new Response('Method Not Allowed', { status: 405 });
	}

	return paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});
};
