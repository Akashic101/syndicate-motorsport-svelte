import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: 'build',     // folder for final HTML output
			assets: 'build',    // static assets folder
			fallback: 'index.html' // SPA fallback for client-side routing
		}),
		paths: {
			base: '',           // keep this empty unless you deploy in a subdirectory
		}
	}
};

export default config;
