/**
 * Things visitors send us from the site — reviews and custom-order requests.
 * Both are stored in the database and handled in /admin.
 */

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

/** A review as the public site sees it (only approved ones are served). */
export interface Testimonial {
  id: number
  name: string
  city: string
  /** product slug, or '' when the review isn't about one flavour */
  product: string
  rating: number
  message: string
  createdAt: number
}

/** Admin view adds moderation fields. `demo` marks the sample reviews seeded on first run. */
export interface AdminTestimonial extends Testimonial {
  status: ReviewStatus
  demo: boolean
}

export const ENQUIRY_KINDS = {
  chutney: 'Custom chutney',
  achaar: 'Achaar',
  bulk: 'Bulk / event order',
  other: 'Something else',
} as const
export type EnquiryKind = keyof typeof ENQUIRY_KINDS

export type EnquiryStatus = 'new' | 'contacted' | 'done'

export interface Enquiry {
  id: number
  name: string
  phone: string
  email: string
  kind: EnquiryKind
  quantity: string
  message: string
  status: EnquiryStatus
  createdAt: number
}

/** Field limits, shared by the forms (maxlength) and the server (validation). */
export const LIMITS = {
  name: 60,
  city: 40,
  phone: 20,
  email: 120,
  quantity: 60,
  review: 600,
  enquiry: 1500,
} as const
