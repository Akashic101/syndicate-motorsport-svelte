import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		})
	],
	build: {
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// Split ApexCharts into its own chunk (used by chart plugin)
					if (id.includes('apexcharts')) {
						return 'apexcharts';
					}
					// Split Flowbite Svelte plugins into separate chunks
					if (id.includes('@flowbite-svelte-plugins/chart')) {
						return 'flowbite-chart';
					}
					if (id.includes('@flowbite-svelte-plugins/datatable')) {
						return 'flowbite-datatable';
					}
					// Split Flowbite Svelte components
					if (
						id.includes('flowbite-svelte') &&
						!id.includes('node_modules/flowbite-svelte-icons')
					) {
						return 'flowbite-svelte';
					}
					// Split Supabase client
					if (id.includes('@supabase/supabase-js')) {
						return 'supabase';
					}
					// Split large node_modules into vendor chunk
					if (id.includes('node_modules')) {
						// Keep small utilities together
						if (id.includes('svelte') || id.includes('@sveltejs') || id.includes('@inlang')) {
							return 'svelte-vendor';
						}
						// Everything else goes into vendor
						return 'vendor';
					}
				}
			}
		},
		chunkSizeWarningLimit: 600
	}
});
