export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody<{ catalog: unknown; version?: number }>(event)
  const { catalog: current, version } = await readCatalog()
  // someone else saved in the meantime → don't silently overwrite their edits
  if (body.version !== undefined && body.version !== version) throw createError({ statusCode: 409, statusMessage: 'The catalogue changed since you opened it. Reload and try again.' })
  const next = sanitizeCatalog(body.catalog, current)
  return { version: await writeCatalog(next, version), catalog: next }
})
