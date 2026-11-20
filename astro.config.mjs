// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
    site: "https://onnasoft.us",
    vite: {
        plugins: [tailwindcss()],
    },

    redirects: {
        "/": "/en",
    },

    integrations: [react(), sitemap({
        filenameBase: "sitemap",
    })],
    adapter: cloudflare(),
});