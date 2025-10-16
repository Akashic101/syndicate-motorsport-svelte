import type { PageServerLoad } from './$types';

type EventItem = {
	title: string;
	href: string;
	time: string;
};

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

function parseCsvToEvents(csv: string): EventItem[] {
	const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
	if (lines.length <= 1) return [];

	const items: EventItem[] = [];

	// skip header
	for (let i = 1; i < lines.length; i++) {
		const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));

		const eventHtml = cols[0] ?? '';
		const time = cols[1] ?? '';

		if (!eventHtml || !time) continue;

		const { title, href } = extractAnchor(eventHtml);
		if (!title && !href) continue;

		items.push({ title, href, time });
	}

	return items;
}

function normalizeUrl(url: string): string {
	if (!url) return '';
	const trimmed = url.trim();
	if (/^\{.*\}$/.test(trimmed) || trimmed.includes('{')) return trimmed;
	if (/^https?:\/\//i.test(trimmed)) return trimmed;
	return `https://${trimmed.replace(/^\/+/, '')}`;
}

export const load: PageServerLoad = async () => {
	const url =
		'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPXEpA0_3WvJmtxJTKZ97Bi8tbZWsjCZT892N4mNgdaMJyhO-Syh1Xn-Yf4KaGw9SAZjGRwjtCpjZb/pub?gid=1933046167&single=true&output=csv';

	const res = await fetch(url, { cache: 'no-store' });
	if (!res.ok) {
		return { events: [] };
	}

	const csv = await res.text();
	const events = parseCsvToEvents(csv);
	return { events };
};
