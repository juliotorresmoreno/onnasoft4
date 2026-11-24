// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

import sitemap from "@astrojs/sitemap";

import emdash from "emdash/astro";
import { d1, r2 } from "@emdash-cms/cloudflare";

// https://astro.build/config
export default defineConfig({
    site: "https://onnasoft.us",
    // EmDash needs server output. Static pages opt in with `export const prerender = true`.
    output: "server",
    vite: {
        plugins: [tailwindcss()],
    },

    redirects: {
        "/": "/en",
    },

    integrations: [react(), sitemap({
        filenameBase: "sitemap",
        // Exclude the content fragments under /locales/; they are not real pages.
        filter: (page) => !page.includes("/locales/"),
    }), emdash({
        database: d1({ binding: "DB", session: "auto", coalesce: true }),
        storage: r2({ binding: "MEDIA" }),
    })],
    adapter: cloudflare(),
    i18n: {
        defaultLocale: "es",
        locales: ["es", "en", "fr", "ja", "zh"],
        routing: {
            prefixDefaultLocale: true,
        },
    },
});
