import { SOCIALS, type Socials } from '~~/app/data/socials'

/** Footer social links. Falls back to the defaults when the database isn't set up or can't be reached. */
export async function readSocials(): Promise<Socials> {
  if (!dbConfigured()) return DEFAULT_SOCIALS
  try {
    const db = await useDb()
    const r = await db.execute({ sql: 'SELECT value FROM kv WHERE key = ?', args: ['socials'] })
    return r.rows[0] ? JSON.parse(String(r.rows[0].value)) : DEFAULT_SOCIALS
  } catch (e) {
    console.error('[socials] database read failed, serving the defaults:', e)
    return DEFAULT_SOCIALS
  }
}

/** Known networks only; links must be https, email must look like an address. Empty = hidden. */
export function cleanSocials(input: unknown): Socials {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const out: Socials = {}
  for (const { key, label } of SOCIALS) {
    const v = typeof raw[key] === 'string' ? (raw[key] as string).trim() : ''
    if (!v) continue
    if (v.length > 200) throw createError({ statusCode: 400, statusMessage: `${label}: that link is too long.` })
    if (key === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw createError({ statusCode: 400, statusMessage: 'Email: that address doesn’t look right.' })
    } else {
      let url: URL | undefined
      try { url = new URL(v) } catch { /* handled below */ }
      if (url?.protocol !== 'https:') throw createError({ statusCode: 400, statusMessage: `${label}: paste the full link, starting with https://` })
    }
    out[key] = v
  }
  return out
}

export async function writeSocials(s: Socials) {
  const db = await useDb()
  await db.execute({
    sql: 'INSERT INTO kv (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value, version = version + 1, updated_at = excluded.updated_at',
    args: ['socials', JSON.stringify(s), Date.now()],
  })
}
