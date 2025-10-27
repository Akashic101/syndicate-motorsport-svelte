import { vitePreprocess } from '@sveltejs/kit/vite'
import IISAdapter from 'sveltekit-adapter-iis'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    version: {
      pollInterval: 300000,
    },
    adapter: IISAdapter({
      // the hostname/port that the site will be hosted on in IIS.
      // can be changed later in web.config
      origin: 'http://localhost',
      // ... other options
    }),
  },
}

export default config