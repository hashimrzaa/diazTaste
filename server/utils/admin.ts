import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import type { Catalog, CatalogProduct } from '~~/app/data/products'

/* ------------------------------------------------------------------ config
 * Set these in Vercel → Project → Settings → Environment Variables:
 *   ADMIN_PASSWORD   password for /admin (required)
 *   GITHUB_TOKEN     fine-grained token, this repo only, “Contents: read & write”
 *   GITHUB_REPO      optional, default hashimrzaa/diazTaste
 *   GITHUB_BRANCH    optional, default main
 * Without GITHUB_TOKEN, `nuxt dev` writes the files to disk instead.
 */
export const CATALOG_PATH = 'app/data/catalog.json'
const cfg = () => ({
  password: process.env.ADMIN_PASSWORD || '',
  token: process.env.GITHUB_TOKEN || '',
  repo: process.env.GITHUB_REPO || 'hashimrzaa/diazTaste',
  branch: process.env.GITHUB_BRANCH || 'main',
})
const localMode = () => !cfg().token && import.meta.dev

/* ------------------------------------------------------------------ session */
const COOKIE = 'dt_admin'
const TTL = 12 * 60 * 60 * 1000
const sign = (v: string) => createHmac('sha256', `dias-admin:${cfg().password}`).update(v).digest('base64url')
const safeEq = (a: string, b: string) => {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export const passwordOk = (pw: string) => !!cfg().password && safeEq(sign(pw), sign(cfg().password))

export function startSession(event: H3Event) {
  const exp = String(Date.now() + TTL)
  setCookie(event, COOKIE, `${exp}.${sign(exp)}`, { httpOnly: true, secure: !import.meta.dev, sameSite: 'strict', path: '/', maxAge: TTL / 1000 })
}
export const endSession = (event: H3Event) => deleteCookie(event, COOKIE, { path: '/' })

export function isAdmin(event: H3Event) {
  if (!cfg().password) return false
  const [exp, sig] = (getCookie(event, COOKIE) || '').split('.')
  return !!exp && !!sig && Number(exp) > Date.now() && safeEq(sig, sign(exp))
}
export function requireAdmin(event: H3Event) {
  if (!isAdmin(event)) throw createError({ statusCode: 401, statusMessage: 'Please log in again.' })
}

export const adminStatus = () => ({
  configured: !!cfg().password,
  canPublish: !!cfg().token || localMode(),
  mode: cfg().token ? 'github' : localMode() ? 'local' : 'none',
})

/* ------------------------------------------------------------------ storage (GitHub contents API, or disk in dev) */
async function gh<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const { token, repo } = cfg()
  return (await ($fetch as (u: string, o: object) => Promise<unknown>)(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: (init.method as 'GET' | 'PUT') || 'GET',
    body: init.body as Record<string, unknown> | undefined,
    query: init.method ? undefined : { ref: cfg().branch },
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'dias-taste-admin' },
  }).catch((e: { status?: number; data?: { message?: string } }) => {
    throw createError({ statusCode: e?.status === 404 ? 404 : 502, statusMessage: `GitHub: ${e?.data?.message || e?.status || 'request failed'}` })
  })) as T
}

/** Current catalogue: the latest commit on GitHub (so the panel shows saved
 *  edits even before the redeploy finishes), else the bundled copy. */
export async function readCatalog(): Promise<{ catalog: Catalog; sha?: string }> {
  if (cfg().token) {
    try {
      const f = await gh<{ content: string; sha: string }>(CATALOG_PATH)
      return { catalog: JSON.parse(Buffer.from(f.content, 'base64').toString('utf8')), sha: f.sha }
    } catch (e) {
      // not on GitHub yet (never pushed): start from this build's copy; the first save creates it
      if ((e as { statusCode?: number }).statusCode !== 404) throw e
      return { catalog: (await import('~~/app/data/catalog.json')).default as Catalog }
    }
  }
  if (localMode()) {
    const { readFile } = await import('node:fs/promises')
    return { catalog: JSON.parse(await readFile(CATALOG_PATH, 'utf8')) }
  }
  return { catalog: (await import('~~/app/data/catalog.json')).default as Catalog }
}

async function writeFile(path: string, content: Buffer, message: string, sha?: string) {
  if (cfg().token) {
    let current = sha
    if (current === undefined) current = await gh<{ sha: string }>(path).then((f) => f.sha, () => undefined)
    const res = await gh<{ commit: { sha: string; html_url: string } }>(path, {
      method: 'PUT',
      body: { message, content: content.toString('base64'), branch: cfg().branch, ...(current && { sha: current }) },
    })
    return { commit: res.commit.sha.slice(0, 7), url: res.commit.html_url }
  }
  if (localMode()) {
    const fs = await import('node:fs/promises')
    const { dirname } = await import('node:path')
    await fs.mkdir(dirname(path), { recursive: true })
    await fs.writeFile(path, content)
    return { commit: 'local', url: '' }
  }
  throw createError({ statusCode: 503, statusMessage: 'Publishing is not set up: add GITHUB_TOKEN in Vercel.' })
}

export const writeCatalog = (c: Catalog, sha: string | undefined, message: string) =>
  writeFile(CATALOG_PATH, Buffer.from(JSON.stringify(c, null, 2) + '\n', 'utf8'), message, sha)

const IMAGE_TYPES: Record<string, string> = { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg' }
export const MAX_IMAGE = 3 * 1024 * 1024
export async function writeImage(slug: string, type: string, data: Buffer) {
  const ext = IMAGE_TYPES[type]
  if (!ext) throw createError({ statusCode: 400, statusMessage: 'Use a WebP, PNG or JPG image.' })
  if (data.length > MAX_IMAGE) throw createError({ statusCode: 413, statusMessage: 'Image is over 3 MB.' })
  const name = `${slug}-${Date.now().toString(36)}.${ext}`
  const r = await writeFile(`public/images/uploads/${name}`, data, `admin: new photo for ${slug}`)
  return { path: `/images/uploads/${name}`, ...r }
}

/* ------------------------------------------------------------------ validation
 * Only known products, only known fields, sane types and lengths. Slugs and
 * 3D model paths are never taken from the client.
 */
const str = (v: unknown, max: number, field: string, allowEmpty = false) => {
  const s = typeof v === 'string' ? v.trim() : ''
  if (!allowEmpty && !s) throw createError({ statusCode: 400, statusMessage: `“${field}” can’t be empty.` })
  return s.slice(0, max)
}
const list = (v: unknown, maxItems: number, maxLen: number) =>
  (Array.isArray(v) ? v : []).map((x) => (typeof x === 'string' ? x.trim().slice(0, maxLen) : '')).filter(Boolean).slice(0, maxItems)
const score = (v: unknown) => Math.min(5, Math.max(1, Math.round(Number(v) || 1)))
const HEX = /^#[0-9a-f]{6}$/i
const hex = (v: unknown, fallback: string) => (typeof v === 'string' && HEX.test(v) ? v : fallback)

export function sanitizeCatalog(input: unknown, current: Catalog): Catalog {
  const incoming = (input as Catalog)?.products
  if (!Array.isArray(incoming)) throw createError({ statusCode: 400, statusMessage: 'Bad data.' })
  const bySlug = new Map(incoming.map((p) => [p?.slug, p]))
  // keep the order the admin chose; any product missing from the request stays, at the end
  const known = new Map(current.products.map((p) => [p.slug, p]))
  const order = [...new Set(incoming.map((p) => p?.slug).filter((s): s is string => known.has(s)))]
  for (const p of current.products) if (!order.includes(p.slug)) order.push(p.slug)
  const products = order.map((slug): CatalogProduct => {
    const old = known.get(slug)!
    const p = bySlug.get(old.slug) as Partial<CatalogProduct> | undefined
    if (!p) return old
    const label = p.name ? String(p.name) : old.name
    const sizes = (Array.isArray(p.sizes) ? p.sizes : [])
      .map((s) => ({
        label: str(s?.label, 20, `${label} size`),
        price: s?.price === null || s?.price === undefined || (s.price as unknown) === '' ? null : Math.max(0, Math.round(Number(s.price))),
      }))
      .filter((s) => s.price === null || Number.isFinite(s.price))
      .slice(0, 4)
    if (!sizes.length) throw createError({ statusCode: 400, statusMessage: `${label}: add at least one size.` })
    const image = typeof p.image === 'string' && /^\/images\/[\w./-]+\.(webp|png|jpe?g)$/i.test(p.image) && !p.image.includes('..') ? p.image : old.image
    return {
      slug: old.slug,
      hidden: !!p.hidden,
      name: str(p.name, 60, 'Name'),
      short: str(p.short, 24, `${label} short name`),
      urdu: str(p.urdu, 40, `${label} Urdu name`, true),
      tagline: str(p.tagline, 90, `${label} tagline`, true),
      description: str(p.description, 900, `${label} description`),
      sizes,
      ingredients: list(p.ingredients, 20, 60),
      allergens: list(p.allergens, 12, 40),
      pairs: list(p.pairs, 10, 50),
      taste: { sweet: score(p.taste?.sweet), tangy: score(p.taste?.tangy), heat: score(p.taste?.heat) },
      recipe: { title: str(p.recipe?.title, 60, `${label} recipe title`, true), steps: list(p.recipe?.steps, 6, 120) },
      image,
      model: old.model,
      color: {
        accent: hex(p.color?.accent, old.color.accent),
        deep: hex(p.color?.deep, old.color.deep),
        tint: hex(p.color?.tint, old.color.tint),
        ink: hex(p.color?.ink, old.color.ink),
      },
    }
  })
  if (products.every((p) => p.hidden)) throw createError({ statusCode: 400, statusMessage: 'At least one product must stay visible.' })
  const want = (input as Catalog).defaultSlug ?? current.defaultSlug ?? 'aloo-bukhara'
  const defaultSlug = products.find((p) => p.slug === want && !p.hidden)?.slug ?? products.find((p) => !p.hidden)!.slug
  return { defaultSlug, products }
}
