// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
    },

    redirects: {
        "/": "/en",
    },

    integrations: [react(), sitemap({
        filenameBase: "sitemap.xml",
    })],
    adapter: cloudflare(),
});