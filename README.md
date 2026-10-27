# Dia’s Taste

A 3D, scroll-driven marketing site for **Dia’s Taste** — five homemade chutneys
(Green, Garlic, Aloo Bukhara, Imli, Khajoor). Built with Nuxt 4, Three.js, GSAP
ScrollTrigger and Lenis, with real-time 3D jars, native AR, and a live-camera
fallback that works on any device with a webcam.

## Stack

- **Nuxt 4** (Vue 3, SSR → fully static via `nuxi generate`)
- **Three.js** — the scroll-synced hero/flavour/lineup WebGL stage (`app/three/`)
- **@google/model-viewer** — product-page viewer + native AR (`ar`, Quick Look / Scene Viewer)
- **GSAP + ScrollTrigger + SplitText** and **Lenis** smooth scroll
- Self-hosted fonts (Fraunces, Inter Tight) and Draco decoders — **no third-party requests, no cookies, no analytics**

## Commands

```bash
npm install
npm run dev         # dev server (uses a local SQLite file, .data/dias.db)
npm run build       # server build (Vercel)
npx nuxi typecheck  # type check
```

## Database & admin

Products, product photos, reviews, custom-order enquiries and footer social
links live in SQLite — a [Turso](https://turso.tech) database in production, a
local file in dev. `/admin` edits them and the site shows changes at once: no
commits, no redeploys. On first run the database is filled from
`app/data/catalog.json` plus five sample reviews (marked “Sample” in admin).

Vercel → Project → Settings → Environment Variables:

| Variable | What |
| --- | --- |
| `ADMIN_PASSWORD` | Password for `/admin` |
| `TURSO_DATABASE_URL` | `libsql://<db>-<org>.turso.io` |
| `TURSO_AUTH_TOKEN` | `turso db tokens create <db>` |
| `NUXT_PUBLIC_SITE_URL` | Canonical URL, e.g. `https://diastaste.com` |

Without the Turso variables the site still runs on the bundled catalogue, but
saving, reviews and enquiries are off.

## Where things live

| Path | What |
| --- | --- |
| `app/data/products.ts` | Product types and helpers; live data comes from the database (edit in `/admin`). `catalog.json` is the first-run seed and fallback. |
| `server/utils/db.ts` | Database connection, schema, first-run seed. |
| `server/api/` | Public (`catalog`, `testimonials`, `enquiries`, `socials`) and `admin/` endpoints. |
| `app/three/Stage.ts` | WebGL engine: renderer, jar prep, cap animation, flavour carousel, lineup, DOM anchors. |
| `app/three/ingredients.ts` | Procedural ingredients (chillies, mint, garlic, plums, dates, tamarind pods…) per flavour. |
| `app/three/state.ts` | The shared `StageState` the scroll timelines tween. |
| `app/components/home/*` | One component per scroll section of the home page. |
| `app/components/ArViewer.vue` / `CameraMode.vue` | 3D/AR modal and the live-camera placement fallback. |
| `app/pages/` | `index`, `menu`, `chutney/[slug]`, legal pages. |
| `public/models/*.glb` | Draco-compressed jars (~310 KB each). Regenerate from the source GLBs with the gltf-transform pipeline. |
| `public/brand/`, `public/favicon.svg` | Generated Dia’s Taste logo (jar + heart-steam mark) and icons. |

## Content to confirm before launch

- **Prices** in `app/data/products.ts` (`price: null` shows “Price on WhatsApp”).
- **Ingredients & allergens** must match the printed jar labels exactly.
- The WhatsApp link (`WHATSAPP_URL`) is the brand’s real `wa.me` business link,
  read from the jar’s own QR code.

## Accessibility & motion

Respects `prefers-reduced-motion` (disables Lenis and large animations), traps
focus in dialogs, keyboard-navigable, and every 3D/AR detail is also present as
text. See `/accessibility`.
