/** Photos uploaded from /admin. Names are unique per upload, so they cache forever. */
export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name') || ''
  if (!/^[\w-]+\.(webp|png|jpg)$/.test(name)) throw createError({ statusCode: 404 })
  const db = await useDb()
  const r = await db.execute({ sql: 'SELECT type, data FROM media WHERE name = ?', args: [name] })
  const row = r.rows[0]
  if (!row) throw createError({ statusCode: 404 })
  setHeader(event, 'Content-Type', String(row.type))
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable')
  return Buffer.from(new Uint8Array(row.data as ArrayBuffer))
})
