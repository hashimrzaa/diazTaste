import type { H3Event } from 'h3'
import type { DbRow } from './db'
import { ENQUIRY_KINDS, LIMITS, type AdminTestimonial, type Enquiry, type EnquiryKind, type Testimonial } from '~~/app/data/inbox'

/* ------------------------------------------------------------------ spam guard
 * Public forms carry a hidden “website” field that people never see (bots fill
 * it), and each visitor gets a few submissions per 10 minutes. The limit is per
 * server instance — a speed bump, not a wall — and a cap on unread items keeps
 * a flood from filling the database.
 */
const WINDOW = 10 * 60 * 1000
const PER_WINDOW = 5
const hits = new Map<string, number[]>()

export function guardForm(event: H3Event, body: { website?: unknown }) {
  if (body?.website) throw createError({ statusCode: 400, statusMessage: 'Something went wrong.' })
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW)
  if (recent.length >= PER_WINDOW) throw createError({ statusCode: 429, statusMessage: 'Too many messages — please try again in a few minutes.' })
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
}

const MAX_UNREAD = 500
export async function guardBacklog(table: 'testimonials' | 'enquiries', status: string) {
  const db = await useDb()
  const r = await db.execute({ sql: `SELECT COUNT(*) AS n FROM ${table} WHERE status = ?`, args: [status] })
  if (Number(r.rows[0]?.n) >= MAX_UNREAD) throw createError({ statusCode: 503, statusMessage: 'We can’t take new messages right now — please reach us on WhatsApp.' })
}

/* ------------------------------------------------------------------ validation */
const text = (v: unknown, max: number, field: string, required = true) => {
  const s = typeof v === 'string' ? v.replace(/\s+\n/g, '\n').trim() : ''
  if (required && !s) throw createError({ statusCode: 400, statusMessage: `Please fill in “${field}”.` })
  if (s.length > max) throw createError({ statusCode: 400, statusMessage: `“${field}” is too long (max ${max} characters).` })
  return s
}

export async function cleanReview(input: Record<string, unknown>) {
  const { products } = await readPublicCatalog()
  const product = typeof input.product === 'string' && products.some((p) => p.slug === input.product) ? input.product : ''
  const rating = Math.round(Number(input.rating))
  if (!(rating >= 1 && rating <= 5)) throw createError({ statusCode: 400, statusMessage: 'Please pick a star rating.' })
  const message = text(input.message, LIMITS.review, 'Your review')
  if (message.length < 10) throw createError({ statusCode: 400, statusMessage: 'Please write a little more in your review.' })
  return {
    name: text(input.name, LIMITS.name, 'Name'),
    city: text(input.city, LIMITS.city, 'City', false),
    product,
    rating,
    message,
  }
}

export function cleanEnquiry(input: Record<string, unknown>) {
  const kind = String(input.kind) in ENQUIRY_KINDS ? (input.kind as EnquiryKind) : 'other'
  const phone = text(input.phone, LIMITS.phone, 'Phone / WhatsApp')
  if (phone.replace(/\D/g, '').length < 10) throw createError({ statusCode: 400, statusMessage: 'Please enter a full phone number, e.g. 0300 1234567.' })
  const email = text(input.email, LIMITS.email, 'Email', false)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw createError({ statusCode: 400, statusMessage: 'That email address doesn’t look right.' })
  return {
    name: text(input.name, LIMITS.name, 'Name'),
    phone,
    email,
    kind,
    quantity: text(input.quantity, LIMITS.quantity, 'Quantity', false),
    message: text(input.message, LIMITS.enquiry, 'What you’d like'),
  }
}

/** Route param → positive integer id, or 404. */
export function idParam(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 404 })
  return id
}

/* ------------------------------------------------------------------ rows → objects */
export const toTestimonial = (r: DbRow): Testimonial => ({
  id: Number(r.id),
  name: String(r.name),
  city: String(r.city),
  product: String(r.product),
  rating: Number(r.rating),
  message: String(r.message),
  createdAt: Number(r.created_at),
})
export const toAdminTestimonial = (r: DbRow): AdminTestimonial => ({
  ...toTestimonial(r),
  status: String(r.status) as AdminTestimonial['status'],
  demo: !!Number(r.demo),
})
export const toEnquiry = (r: DbRow): Enquiry => ({
  id: Number(r.id),
  name: String(r.name),
  phone: String(r.phone),
  email: String(r.email),
  kind: String(r.kind) as EnquiryKind,
  quantity: String(r.quantity),
  message: String(r.message),
  status: String(r.status) as Enquiry['status'],
  createdAt: Number(r.created_at),
})
