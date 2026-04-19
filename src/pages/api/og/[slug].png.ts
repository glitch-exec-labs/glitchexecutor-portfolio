/**
 * Dynamic Open Graph image endpoint.
 *
 * Prerendered at build time for every known slug. On the master portfolio we
 * only ship a handful: the home card, FAQ, and each sub-brand tile.
 * Runs under Node via Astro's build step, so @resvg/resvg-js (native) works.
 *
 * Fonts: fetched at build from fonts.bunny.net (free, GDPR-friendly,
 * no API key). Cached in-process across invocations.
 *
 * URL: /api/og/<slug>.png
 *   home                  → site card
 *   faq                   → FAQ card
 *   portfolio-<slug>      → per-sub-brand card
 */

import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { ogTemplate } from '~/lib/og';
import { site, subBrands } from '~/lib/site';

export const prerender = true;

export async function getStaticPaths() {
  return [
    { params: { slug: 'home' }, props: {
      title: 'AI systems that move money, prices, and signals.',
      subtitle: site.tagline,
      eyebrow: 'Glitch Executor',
    }},
    { params: { slug: 'faq' }, props: {
      title: 'Portfolio FAQ.',
      subtitle: 'What we sell, how the products share tech, how to reach us.',
      eyebrow: 'FAQ',
    }},
    ...subBrands.map((b) => ({
      params: { slug: `portfolio-${b.slug}` },
      props: {
        title: b.name,
        subtitle: b.tagline,
        eyebrow: 'Glitch Executor Portfolio',
      },
    })),
  ];
}

// One-time font load. Bunny Fonts (free, no key, GDPR-friendly).
let cachedFonts: { name: string; data: ArrayBuffer; weight: 400|500|800; style: 'normal' }[] | null = null;

async function fetchFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font fetch failed: ${url} → ${res.status}`);
  return await res.arrayBuffer();
}

async function getFonts() {
  if (cachedFonts) return cachedFonts;
  const [interRegular, interBold, geistMono] = await Promise.all([
    fetchFont('https://fonts.bunny.net/inter-tight/files/inter-tight-latin-400-normal.woff'),
    fetchFont('https://fonts.bunny.net/inter-tight/files/inter-tight-latin-800-normal.woff'),
    fetchFont('https://fonts.bunny.net/geist-mono/files/geist-mono-latin-500-normal.woff'),
  ]);
  cachedFonts = [
    { name: 'Inter Tight', data: interRegular, weight: 400, style: 'normal' },
    { name: 'Inter Tight', data: interBold,    weight: 800, style: 'normal' },
    { name: 'Geist Mono',  data: geistMono,    weight: 500, style: 'normal' },
  ];
  return cachedFonts;
}

interface Props {
  title: string;
  subtitle: string;
  eyebrow: string;
}

export const GET: APIRoute<Props> = async ({ props }) => {
  const fonts = await getFonts();

  const svg = await satori(
    // satori-html returns a vnode; cast is safe at runtime.
    ogTemplate({
      title: props.title,
      subtitle: props.subtitle,
      eyebrow: props.eyebrow,
    }) as Parameters<typeof satori>[0],
    { width: 1200, height: 630, fonts }
  );

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();

  return new Response(new Uint8Array(png), {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
};
