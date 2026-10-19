export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody<{ catalog: unknown; sha?: string; note?: string }>(event)
  const { catalog: current, sha } = await readCatalog()
  // someone else saved in the meantime → don't silently overwrite their edits
  if (body.sha && sha && body.sha !== sha) throw createError({ statusCode: 409, statusMessage: 'The catalogue changed since you opened it. Reload and try again.' })
  const next = sanitizeCatalog(body.catalog, current)
  const note = typeof body.note === 'string' && body.note.trim() ? body.note.trim().slice(0, 80) : 'update products'
  const res = await writeCatalog(next, sha, `admin: ${note}`)
  const fresh = await readCatalog()
  return { ...res, sha: fresh.sha, catalog: next }
})
