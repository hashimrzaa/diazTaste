import type { SQLInputValue } from 'node:sqlite'
import { WHATSAPP_URL, type Catalog } from '~~/app/data/products'
import type { Socials } from '~~/app/data/socials'

/** Footer links before anything is set in /admin. */
export const DEFAULT_SOCIALS: Socials = { whatsapp: WHATSAPP_URL }

/* ------------------------------------------------------------------ config
 * SQLite via libSQL. On Vercel use a Turso database (hosted SQLite) — set in
 * Vercel → Project → Settings → Environment Variables:
 *   TURSO_DATABASE_URL   libsql://<db>-<org>.turso.io
 *   TURSO_AUTH_TOKEN     from `turso db tokens create <db>`
 * `nuxt dev` without them uses a local file, .data/dias.db.
 */
const LOCAL_DB = 'file:.data/dias.db'
const dbUrl = () => process.env.TURSO_DATABASE_URL || (import.meta.dev ? LOCAL_DB : '')
export const dbConfigured = () => !!dbUrl()
export const dbMode = () => (process.env.TURSO_DATABASE_URL ? 'turso' : import.meta.dev ? 'local' : 'none')

const SCHEMA = `
CREATE TABLE IF NOT EXISTS kv (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS media (
  name TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  data BLOB NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  product TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  demo INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS testimonials_status ON testimonials (status, created_at);
CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL,
  quantity TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS enquiries_status ON enquiries (status, created_at);
`

/** Sample reviews shown until real ones come in. Seeded once; deleting them in /admin is permanent. */
const DEMO_REVIEWS = [
  ['Ayesha K.', 'Lahore', 'aloo-bukhara', 5, 'Tastes exactly like my nani’s aloo bukhara chutney. We finished the 500 g jar in a week — biryani nights will never be the same.'],
  ['Hamza R.', 'Karachi', 'garlic', 5, 'Properly fiery. I put it on everything — parathas, fries, even eggs. Ordering two jars next time.'],
  ['Sana M.', 'Islamabad', 'imli', 5, 'The imli chutney with samosas at our iftar was a hit. Everyone asked where it was from.'],
  ['Usman T.', 'Rawalpindi', 'green', 4, 'Fresh and tangy, you can really taste the mint. Only wish the jar was bigger!'],
  ['Mehwish A.', 'Lahore', 'khajoor', 5, 'Sweet but not sugary — perfect with chaat. Packed nicely and delivered on time.'],
] as const

async function connect(): Promise<Db> {
  const url = dbUrl()
  if (!url) throw createError({ statusCode: 503, statusMessage: 'The database is not set up: add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel.' })
  const client: Db = url.startsWith('file:')
    ? await localDb(url.slice('file:'.length))
    // HTTP-only libSQL client: no native SQLite binary in the serverless bundle
    : ((await import('@libsql/client/web')).createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN }) as unknown as Db)
  await client.executeMultiple(SCHEMA)
  await seed(client)
  return client
}

/** The slice of the libSQL client this app uses. */
export type DbRow = Record<string, unknown>
type Stmt = string | { sql: string; args?: SQLInputValue[] }
export interface Db {
  execute(stmt: Stmt): Promise<{ rows: DbRow[]; rowsAffected: number }>
  batch(stmts: Stmt[], mode?: 'write'): Promise<unknown>
  executeMultiple(sql: string): Promise<void>
}

/** Local dev: the same API over Node's built-in SQLite. (The native libSQL
 *  binary crashes the dev server when Nitro reloads on Windows.) */
async function localDb(path: string): Promise<Db> {
  const { mkdir } = await import('node:fs/promises')
  const { dirname } = await import('node:path')
  // getBuiltinModule keeps the bundler from trying to resolve node:sqlite, and
  // the one-off “SQLite is experimental” warning is muted so dev logs stay clean
  const emitWarning = process.emitWarning
  process.emitWarning = ((w: string | Error, ...rest: unknown[]) => {
    if (!String(w).includes('SQLite is an experimental feature')) (emitWarning as (...a: unknown[]) => void).call(process, w, ...rest)
  }) as typeof process.emitWarning
  const { DatabaseSync } = process.getBuiltinModule('node:sqlite')
  process.emitWarning = emitWarning
  await mkdir(dirname(path), { recursive: true })
  const db = new DatabaseSync(path)
  const run = (s: Stmt) => {
    const { sql, args = [] } = typeof s === 'string' ? { sql: s } : s
    const st = db.prepare(sql)
    if (st.columns().length) return { rows: st.all(...args) as DbRow[], rowsAffected: 0 }
    return { rows: [], rowsAffected: Number(st.run(...args).changes) }
  }
  return {
    execute: async (s) => run(s),
    executeMultiple: async (sql) => db.exec(sql),
    batch: async (stmts) => {
      db.exec('BEGIN')
      try {
        const out = stmts.map(run)
        db.exec('COMMIT')
        return out
      } catch (e) {
        db.exec('ROLLBACK')
        throw e
      }
    },
  }
}

/** First run only: copy the bundled catalogue in and add the sample reviews. */
async function seed(client: Db) {
  const now = Date.now()
  const catalog = (await import('~~/app/data/catalog.json')).default
  const stmts: Stmt[] = [
    { sql: 'INSERT OR IGNORE INTO kv (key, value, updated_at) VALUES (?, ?, ?)', args: ['catalog', JSON.stringify(catalog), now] },
    { sql: 'INSERT OR IGNORE INTO kv (key, value, updated_at) VALUES (?, ?, ?)', args: ['socials', JSON.stringify(DEFAULT_SOCIALS), now] },
  ]
  const seeded = await client.execute({ sql: 'SELECT 1 FROM kv WHERE key = ?', args: ['seeded:reviews'] })
  if (!seeded.rows.length) {
    stmts.push({ sql: 'INSERT INTO kv (key, value, updated_at) VALUES (?, ?, ?)', args: ['seeded:reviews', '1', now] })
    DEMO_REVIEWS.forEach(([name, city, product, rating, message], i) => stmts.push({
      sql: `INSERT INTO testimonials (name, city, product, rating, message, status, demo, created_at) VALUES (?, ?, ?, ?, ?, 'approved', 1, ?)`,
      args: [name, city, product, rating, message, now - (i + 1) * 86_400_000],
    }))
  }
  await client.batch(stmts, 'write')
}

let pending: Promise<Db> | undefined
/** Shared client for this server instance; the schema is created on first use. */
export function useDb() {
  pending ??= connect().catch((e) => {
    pending = undefined // retry on the next request
    throw e
  })
  return pending
}

/* ------------------------------------------------------------------ catalogue */
export async function readCatalogRow(): Promise<{ catalog: Catalog; version: number }> {
  const db = await useDb()
  const r = await db.execute({ sql: 'SELECT value, version FROM kv WHERE key = ?', args: ['catalog'] })
  const row = r.rows[0]!
  return { catalog: JSON.parse(String(row.value)), version: Number(row.version) }
}

/** Saves only if nobody else saved since `version` was read; returns the new version. */
export async function writeCatalogRow(catalog: Catalog, version: number) {
  const db = await useDb()
  const r = await db.execute({
    sql: 'UPDATE kv SET value = ?, version = version + 1, updated_at = ? WHERE key = ? AND version = ?',
    args: [JSON.stringify(catalog), Date.now(), 'catalog', version],
  })
  if (!r.rowsAffected) throw createError({ statusCode: 409, statusMessage: 'The catalogue changed since you opened it. Reload and try again.' })
  return version + 1
}
