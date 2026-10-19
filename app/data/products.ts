/**
 * Product catalogue. The data lives in `catalog.json` (edited from /admin,
 * which commits it to the repo and triggers a redeploy); this file types it
 * and derives what the pages need.
 *
 * Only products with `hidden: false` reach the site. Indexes used across the
 * site (hero flavour, 3D stage, shelf) are indexes into the visible list.
 */
import catalog from './catalog.json'

export interface Size {
  label: string
  /** PKR. `null` shows “Price on WhatsApp”. */
  price: number | null
}

/** Shape stored in catalog.json (and edited in /admin). */
export interface CatalogProduct {
  slug: string
  hidden: boolean
  name: string
  short: string
  urdu: string
  tagline: string
  description: string
  sizes: Size[]
  ingredients: string[]
  allergens: string[]
  pairs: string[]
  taste: { sweet: number; tangy: number; heat: number }
  recipe: { title: string; steps: string[] }
  image: string
  model: string
  color: { accent: string; deep: string; tint: string; ink: string }
}

export interface Catalog {
  products: CatalogProduct[]
}

export interface Product extends CatalogProduct {
  /** e.g. “250 g · 500 g” */
  weight: string
  /** lowest listed price, or null when none is set */
  price: number | null
}

/** WhatsApp Business chat link (from the brand’s official WhatsApp QR). */
export const WHATSAPP_URL = 'https://wa.me/message/UIZXZAIIGBVYF1'

/** Phone contact. NUMBER is digits only in international format (92 + mobile,
 *  no leading 0); DISPLAY is how it reads on screen; TEL opens a direct chat. */
export const WHATSAPP_NUMBER = '923243560784'
export const WHATSAPP_DISPLAY = '0324 3560784'
export const WHATSAPP_TEL = `https://wa.me/${WHATSAPP_NUMBER}`

const derive = (p: CatalogProduct): Product => {
  const priced = p.sizes.map((s) => s.price).filter((x): x is number => typeof x === 'number')
  return { ...p, weight: p.sizes.map((s) => s.label).join(' · '), price: priced.length ? Math.min(...priced) : null }
}

export const allProducts: Product[] = (catalog as Catalog).products.map(derive)
export const products: Product[] = allProducts.filter((p) => !p.hidden)

/** Hero opens on Aloo Bukhara when it is visible, otherwise the first flavour. */
export const DEFAULT_FLAVOUR = Math.max(0, products.findIndex((p) => p.slug === 'aloo-bukhara'))

export const getProduct = (slug: string) => products.find((p) => p.slug === slug)

export const rs = (n: number) => `Rs ${n.toLocaleString('en-PK')}`

/** Short price line for cards: “From Rs 400”, or “Price on WhatsApp”. */
export const formatPrice = (p: Product) =>
  p.price == null ? 'Price on WhatsApp' : p.sizes.filter((s) => s.price != null).length > 1 ? `From ${rs(p.price)}` : rs(p.price)

/** “Four”, “Five”… for copy like “Five jars. One kitchen.” */
const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']
export const countWord = (n = products.length) => WORDS[n] ?? String(n)

/** All jar sizes on sale, e.g. “250/500g”. */
export const sizesShort = () => {
  const grams = [...new Set(products.flatMap((p) => p.sizes.map((s) => parseInt(s.label, 10)).filter((n) => !Number.isNaN(n))))].sort((a, b) => a - b)
  return grams.length ? `${grams.join('/')}g` : ''
}
