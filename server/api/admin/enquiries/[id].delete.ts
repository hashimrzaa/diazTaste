export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const db = await useDb()
  await db.execute({ sql: 'DELETE FROM enquiries WHERE id = ?', args: [idParam(event)] })
  return { ok: true }
})
