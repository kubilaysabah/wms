import adapter from '@sveltejs/adapter-static';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROUTES_FILE = path.join(DIRNAME, 'unseen-routes.json');

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter({
            pages: 'build',
            assets: 'build',
            fallback: 'index.html',
            precompress: false,
            strict: false,
        }),
        alias: {
            $api: 'src/api',
            $comp: 'src/components',
            $custom: 'src/custom',
            $icons: 'src/icons',
            $icon: 'src/icons',
            $interface: 'src/interfaces',
            $pages: 'src/pages',
            $lang: 'src/lang',
            $src: 'src',
        },
        appDir: 'svelteapp'
    }
};

export default config;