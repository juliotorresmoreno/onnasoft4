import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";

// Blog entries are rendered on the server, so they are listed in their own sitemap
// instead of the build-time sitemap. This file is generated on each request.
export const prerender = false;

// The blog is published in these languages only.
const BLOG_LANGS = ["en", "es"] as const;
type Lang = (typeof BLOG_LANGS)[number];

const escapeXml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

export const GET: APIRoute = async ({ site, url }) => {
    const origin = (site ?? url).toString().replace(/\/$/, "");

    type Item = { loc: string; lastmod?: string };
    const items: Item[] = [];

    // Blog listing pages, only for the languages the blog is published in.
    for (const lang of BLOG_LANGS) {
        items.push({ loc: `${origin}/${lang}/blog` });
    }

    // Published posts, one language at a time: a query without a locale returns only the default one.
    for (const lang of BLOG_LANGS) {
    let cursor: string | undefined;
    do {
        const result = await getEmDashCollection("posts", {
            status: "published",
            locale: lang,
            limit: 100,
            ...(cursor ? { cursor } : {}),
        });

        for (const entry of result.entries) {
            const data = entry.data as {
                slug?: string | null;
                locale?: string;
                updatedAt?: Date | string;
            };
            const locale = data.locale as Lang | undefined;
            if (!data.slug || !locale || !(BLOG_LANGS as readonly string[]).includes(locale)) continue;

            const updated = data.updatedAt ? new Date(data.updatedAt) : undefined;
            items.push({
                loc: `${origin}/${locale}/blog/${encodeURIComponent(data.slug)}`,
                lastmod: updated && !Number.isNaN(updated.getTime()) ? updated.toISOString() : undefined,
            });
        }

        cursor = result.nextCursor;
    } while (cursor);
    }

    const body = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...items.map(
            (item) =>
                `  <url><loc>${escapeXml(item.loc)}</loc>${
                    item.lastmod ? `<lastmod>${escapeXml(item.lastmod)}</lastmod>` : ""
                }</url>`,
        ),
        "</urlset>",
    ].join("\n");

    return new Response(body, {
        headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
};
