export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const db = await useDb()
  const r = await db.execute(`SELECT * FROM testimonials ORDER BY status = 'pending' DESC, created_at DESC`)
  return r.rows.map(toAdminTestimonial)
})
