import { parse_markdown_with_toc } from '$lib/markdown-toc';
import markdown_raw from '$lib/content/4h-of-mexico-1967.md?raw';

export function load() {
	const { html, toc } = parse_markdown_with_toc(markdown_raw);
	return { html, toc };
}
