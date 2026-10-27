export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const db = await useDb()
  const r = await db.execute(`SELECT * FROM enquiries ORDER BY status = 'done', status = 'contacted', created_at DESC`)
  return r.rows.map(toEnquiry)
})
