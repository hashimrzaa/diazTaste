/**
 * Social / contact links shown in the footer. Set in /admin → Social links;
 * empty ones are hidden on the site.
 */
export const SOCIALS = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/diastaste' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/diastaste' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/923001234567' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@diastaste' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@diastaste' },
  { key: 'x', label: 'X (Twitter)', placeholder: 'https://x.com/diastaste' },
  { key: 'snapchat', label: 'Snapchat', placeholder: 'https://snapchat.com/add/diastaste' },
  { key: 'pinterest', label: 'Pinterest', placeholder: 'https://pinterest.com/diastaste' },
  { key: 'email', label: 'Email', placeholder: 'hello@diastaste.com' },
] as const

export type SocialKey = (typeof SOCIALS)[number]['key']
export type Socials = Partial<Record<SocialKey, string>>

/** Link target for a saved value (email addresses become mailto:). */
export const socialHref = (key: SocialKey, value: string) => (key === 'email' ? `mailto:${value}` : value)
