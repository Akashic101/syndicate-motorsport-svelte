import type { PageServerLoad } from './$types';
import { getEvents } from '$lib/db';

type EventItem = {
	title: string;
	href: string;
	time: number; // timestamp in milliseconds
};

import { supabase } from "$lib/supabaseClient";

function extractAnchor(html: string): { title: string; href: string } {
	if (!html) return { title: '', href: '' };

	// Match href="..." or href='...' or href={...}
	const hrefMatch = html.match(/href\s*=\s*"([^"]+)"|href\s*=\s*'([^']+)'|href\s*=\s*{([^}]+)}/i);

	// Get whichever group matched
	const rawHref = hrefMatch?.[1] || hrefMatch?.[2] || hrefMatch?.[3] || '';

	// Preserve JSX-style curly braces exactly if they exist
	const href =
		rawHref.includes('{') || rawHref.startsWith('item.')
			? `{${rawHref.replace(/^{|}$/g, '').trim()}}`
			: normalizeUrl(rawHref);

	// Extract link text (innerHTML)
	const textMatch = html.match(/>([^<]+)<\/a>/i);
	const title = (textMatch?.[1] ?? '').trim();

	return { title, href };
}

function normalizeUrl(url: string): string {
	if (!url) return '';
	const trimmed = url.trim();
	if (/^\{.*\}$/.test(trimmed) || trimmed.includes('{')) return trimmed;
	if (/^https?:\/\//i.test(trimmed)) return trimmed;
	return `https://${trimmed.replace(/^\/+/, '')}`;
}

export const load: PageServerLoad = async () => {
	
	try {
		const dbEvents = await getEvents();
		
		const events: EventItem[] = dbEvents.map(dbEvent => {
			const { title, href } = extractAnchor(dbEvent.event);
			return {
				title,
				href,
				time: dbEvent.time
			};
		}).filter(event => event.title || event.href);

		return { events };
	} catch (error) {
		console.error('Error loading events:', error);
		return { events: [] };
	}
};
