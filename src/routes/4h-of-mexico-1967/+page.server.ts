import { marked } from 'marked';
import markdown_raw from '$lib/content/4h-of-mexico-1967.md?raw';

export function load() {
	const html = marked.parse(markdown_raw, { gfm: true }) as string;
	return { html };
}
