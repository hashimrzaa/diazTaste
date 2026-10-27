import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import type { Catalog, CatalogProduct } from '~~/app/data/products'

/* ------------------------------------------------------------------ config
 * Set in Vercel → Project → Settings → Environment Variables:
 *   ADMIN_PASSWORD   password for /admin (required)
 * plus the database variables listed in server/utils/db.ts. Everything the
 * admin saves goes straight to the database — no commits, no redeploys.
 */
const cfg = () => ({ password: process.env.ADMIN_PASSWORD || '' })

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
  canPublish: dbConfigured(),
  mode: dbMode(),
})

/* ------------------------------------------------------------------ storage (database) */
const bundled = async () => (await import('~~/app/data/catalog.json')).default as Catalog

/** Admin's copy: every product (hidden ones too) plus the version for the “someone else saved” check. */
export const readCatalog = () => readCatalogRow()
export const writeCatalog = (c: Catalog, version: number) => writeCatalogRow(c, version)

/** What the public site renders. Falls back to the bundled copy if the
 *  database isn't set up or can't be reached, so the shop never goes blank. */
export async function readPublicCatalog(): Promise<Catalog> {
  let catalog: Catalog
  try {
    catalog = dbConfigured() ? (await readCatalogRow()).catalog : await bundled()
  } catch (e) {
    console.error('[catalog] database read failed, serving the bundled copy:', e)
    catalog = await bundled()
  }
  return { ...catalog, products: catalog.products.filter((p) => !p.hidden) }
}

const IMAGE_TYPES: Record<string, string> = { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg' }
export const MAX_IMAGE = 2 * 1024 * 1024
/** Product photos live in the database too and are served from /media/<name>. */
export async function writeImage(slug: string, type: string, data: Buffer) {
  const ext = IMAGE_TYPES[type]
  if (!ext) throw createError({ statusCode: 400, statusMessage: 'Use a WebP, PNG or JPG image.' })
  if (data.length > MAX_IMAGE) throw createError({ statusCode: 413, statusMessage: 'Image is over 2 MB.' })
  const name = `${slug}-${Date.now().toString(36)}.${ext}`
  const db = await useDb()
  await db.execute({ sql: 'INSERT INTO media (name, type, data, created_at) VALUES (?, ?, ?, ?)', args: [name, type, new Uint8Array(data), Date.now()] })
  return { path: `/media/${name}` }
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
    const image = typeof p.image === 'string' && /^\/(images|media)\/[\w./-]+\.(webp|png|jpe?g)$/i.test(p.image) && !p.image.includes('..') ? p.image : old.image
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
