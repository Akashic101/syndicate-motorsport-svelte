import { marked } from 'marked';
import type { Token, Tokens } from 'marked';

export type TocEntry = {
	depth: number;
	text: string;
	slug: string;
};

/**
 * Slugify a heading string for use as an id/anchor (GitHub-style).
 */
function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^\w\u00C0-\u017F-]/g, '')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

/**
 * Ensure unique slugs by appending -1, -2, ... when duplicates exist.
 */
function unique_slugs(entries: TocEntry[]): TocEntry[] {
	const seen = new Map<string, number>();
	return entries.map((entry) => {
		let slug = entry.slug;
		if (slug === '') slug = 'heading';
		const count = seen.get(slug) ?? 0;
		seen.set(slug, count + 1);
		const final_slug = count === 0 ? slug : `${slug}-${count}`;
		return { ...entry, slug: final_slug };
	});
}

/**
 * Parse markdown and extract heading entries for a table of contents.
 * Uses marked's lexer; does not render full HTML.
 */
function extract_toc(markdown: string): TocEntry[] {
	const tokens = marked.lexer(markdown, { gfm: true });
	const entries: TocEntry[] = [];

	function walk(tok: Token[]) {
		for (const t of tok) {
			if (t.type === 'heading') {
				const h = t as Tokens.Heading;
				const text = get_heading_text(h);
				entries.push({
					depth: h.depth,
					text,
					slug: slugify(text)
				});
			}
			if ('tokens' in t && Array.isArray((t as Tokens.Generic).tokens)) {
				walk((t as Tokens.Generic).tokens as Token[]);
			}
		}
	}

	walk(tokens as Token[]);
	return unique_slugs(entries);
}

/**
 * Get plain text from a heading token (strip markdown).
 */
function get_heading_text(heading: Tokens.Heading): string {
	function text_from_tokens(tokens: Token[]): string {
		return tokens
			.map((t) => {
				if (t.type === 'text') return (t as Tokens.Text).text;
				if (t.type === 'strong' || t.type === 'em' || t.type === 'codespan' || t.type === 'del')
					return text_from_tokens((t as Tokens.Generic).tokens ?? []);
				if (t.type === 'link') return text_from_tokens((t as Tokens.Link).tokens ?? []);
				return '';
			})
			.join('');
	}
	return text_from_tokens(heading.tokens ?? []).trim() || heading.text.trim();
}

/** Placeholder in markdown to be replaced with the generated TOC. */
export const TOC_PLACEHOLDER = '<!-- toc -->';

/**
 * Render TOC entries to HTML (same classes as prose so it fits in the article).
 */
function render_toc_html(toc: TocEntry[]): string {
	if (toc.length === 0) return '';
	const items = toc
		.map(
			(entry) =>
				`<li style="padding-left: ${(entry.depth - 1) * 0.75}rem"><a href="#${entry.slug}" class="text-primary-600 hover:underline dark:text-primary-400">${escape_html(entry.text)}</a></li>`
		)
		.join('\n');
	return `<nav class="prose prose-slate dark:prose-invert max-w-none my-8 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50" aria-label="Table of contents">
<h2 class="mt-0 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">On this page</h2>
<ul class="list-none pl-0 space-y-1 text-sm">${items}</ul>
</nav>`;
}

function escape_html(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/**
 * Renders markdown to HTML with heading ids (for TOC links).
 * Replaces <!-- toc --> in the markdown with the generated TOC so you can place it freely.
 */
export function parse_markdown_with_toc(markdown: string): { html: string; toc: TocEntry[] } {
	const toc = extract_toc(markdown);
	let heading_index = 0;

	const renderer = new marked.Renderer();
	const default_heading = marked.Renderer.prototype.heading;

	renderer.heading = function (this: InstanceType<typeof marked.Renderer>, opts: Tokens.Heading) {
		const id = toc[heading_index]?.slug ?? slugify(get_heading_text(opts));
		heading_index += 1;
		const html = default_heading.call(this, opts);
		if (html.startsWith('<h')) {
			return html.replace(/^<h(\d)/, `<h$1 id="${id}"`);
		}
		return html;
	};

	marked.use({ renderer });
	let html = marked.parse(markdown, { gfm: true }) as string;
	marked.use({ renderer: new marked.Renderer() });

	const toc_html = render_toc_html(toc);
	html = html.replace(TOC_PLACEHOLDER, toc_html);

	return { html, toc };
}
