<script lang="ts">
	let { data } = $props<{ data: { html: string; toc: unknown[] } }>();
</script>

<svelte:head>
	<title>4h of Mexico 1967 | Syndicate Motorsport</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-8">
	<article class="prose max-w-none prose-slate dark:prose-invert">
		{@html data.html}
	</article>
</div>
