const STATUSES = ['new', 'contacted', 'done']

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = idParam(event)
  const { status } = await readBody<{ status?: string }>(event)
  if (!status || !STATUSES.includes(status)) throw createError({ statusCode: 400, statusMessage: 'Bad status.' })
  const db = await useDb()
  const r = await db.execute({ sql: 'UPDATE enquiries SET status = ? WHERE id = ?', args: [status, id] })
  if (!r.rowsAffected) throw createError({ statusCode: 404, statusMessage: 'That message no longer exists.' })
  return { ok: true }
})
