import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const dev = process.argv.includes('dev');

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      // output directory (default 'build')
      pages: 'build',
      assets: 'build',
      fallback: 'index.html' // ensures client routing works
    }),
    paths: {
      base: '',
      assets: ''
    },
    alias: {
      $components: './src/components',
    },
    prerender: {
      handleHttpError: 'warn'
    }
  }
};
