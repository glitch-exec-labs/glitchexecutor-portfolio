# Handoff prompt — glitchexecutor-portfolio

Copy everything below the `---` into the next session.

---

You are taking over the `glitchexecutor-portfolio` Astro rebuild at
`/home/support/glitchexecutor-portfolio/`. The previous session replaced the
legacy static HTML + CDN Tailwind site with a production-grade Astro build
lifted from the `glitch-grow-site` template and adapted for the **master
portfolio** (not a product pitch page). It compiles, typechecks clean, and all
7 Playwright smoke tests pass.

## What's already shipped

**Stack (identical to grow / edge sister sites — same template):**
- Astro 4.16 `output: 'static'` (no SSR adapter — runtime endpoints use CF Pages Functions)
- Compiled Tailwind (no CDN) with semantic tokens in `src/styles/tokens.css`
- TypeScript strict (`~/*` alias → `src/*`)
- Motion One + Lenis smooth scroll (both respect `prefers-reduced-motion`)
- Astro `<Image>` → sharp → AVIF
- Satori + `@resvg/resvg-js` — 5 OG PNGs prerendered at build (`home`, `faq`, `portfolio-trade/edge/grow`)
- Fonts: Inter Tight Variable + Geist Mono via Fontsource (self-hosted)
- View Transitions, skip-to-content, `:focus-visible`, JSON-LD (Org + WebSite + per-page)

**Pages:** `/`, `/legal/privacy`, `/legal/terms`, `/thanks`.
Case studies intentionally omitted — no honest cross-product case exists yet;
each sub-brand site holds its own.

**Sections on home:** `Hero` → `Portfolio` (3-card sub-brand grid, the most
important section) → `How` (cross-domain patterns) → `Milestones` (timeline) →
`FAQ` → `Contact`. Pilot / Outcomes / Services / CaseSpotlight / Stack were
deliberately dropped — they're sub-brand concerns.

**Portfolio grid content** lives in `src/lib/site.ts` under `subBrands`. That
same array drives the Nav, Footer, and per-brand OG cards — single source of
truth, link out to `trade./edge./grow.glitchexecutor.com`.

**Infra files:**
- `functions/api/contact.ts` — CF Pages Function, Turnstile verify + honeypot + Slack/webhook forward
- `public/_headers` — security headers + long-cache
- `public/robots.txt`, sitemap-index (@astrojs/sitemap **pinned to 3.2.1**)
- `.github/workflows/ci.yml` — build → typecheck → playwright → Lighthouse
- `lighthouserc.json`, `playwright.config.ts`, `.env.example`, `README.md`

**Brand assets:** `public/assets/brand/` (favicons, mascot, og-image) — shared
cyber-cobra mascot, identical bytes to grow / edge. `src/assets/mascot-512.png`
piped through `<Image>`.

## Important constraints to keep honoring
- **Free/OSS-first.** No paid fonts, no paid SaaS.
- **No emoji as UI.** Icons live in `src/components/Icon.astro` as hand-authored SVG.
- **`output: 'static'`** — don't switch to hybrid.
- **Sitemap pinned to 3.2.1** — newer versions crash under Astro 4.
- **Contact form uses `/functions/api/contact.ts`**, not `src/pages/api/`.
- **WCAG-AA bumped tokens** in `src/styles/tokens.css` (muted = `203 213 225`, subtle = `156 163 175`) — don't revert.
- **BSL 1.1 → Apache 2.0 on 2030-04-18.**

## Likely next tasks

1. **Deploy to Cloudflare Pages.** Build command `npm run build`, output dir `dist`, functions dir auto-detected from `functions/`. Domain: `glitchexecutor.com`. Set `PUBLIC_SITE_URL=https://glitchexecutor.com` in CF Pages env.
2. **Wire Turnstile.** Same playbook as grow / edge. Add `PUBLIC_TURNSTILE_SITE_KEY` in `.env` / CF Pages env, and `TURNSTILE_SECRET` + `SLACK_WEBHOOK_URL` (or `CONTACT_FORWARD_URL`) in CF dashboard.
3. **Pick analytics.** `PUBLIC_ANALYTICS_PROVIDER=plausible|umami` + matching domain / ID. Defaults to rendering nothing.
4. **Land imagery where `<ImageSlot>` still appears.** The hero uses the raw mascot; no ImageSlots currently exist in the portfolio layout, but sub-brand cards could take brand lockup images later.
5. **Cross-product case study (optional).** If an honest cross-cut ever exists (e.g. Ayurpet attribution fix informing Trade's signal filter), restore `src/pages/case-studies/` + `src/content/case-studies/` + nav entry.

## Commands
```bash
cd /home/support/glitchexecutor-portfolio
npm install
npm run dev                # http://localhost:4321
npm run build              # → dist/
npx astro check            # 0 errors expected
npx playwright test        # 7 passing
```

## Gotchas worth knowing
- `src/pages/api/og/[slug].png.ts` prerenders per-slug OG cards. If you add new slugs, update `getStaticPaths` there or add them to `subBrands` in `site.ts`.
- `src/content/config.ts` exports an empty `collections = {}` so `astro:content` stays callable without requiring the case-studies collection.
- Nav uses hash anchors (`/#portfolio`, `/#how`, etc.) — all sections must keep their `id` attributes matching.
- Auto-memory lives at `/home/support/.claude/projects/-home-support/memory/`. `project_glitch_brand.md` is the canonical brand architecture source.

## Current state proof
- `npx astro check` → 0 errors, 0 warnings, 0 hints
- `npm run build` → 4 pages + 5 OG PNGs
- `npx playwright test` → 7 passed
- Last session ended 2026-04-19.
