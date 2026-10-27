/** Approved reviews for the home page, newest first. */
export default defineEventHandler(async () => {
  if (!dbConfigured()) return []
  const db = await useDb()
  const r = await db.execute(`SELECT * FROM testimonials WHERE status = 'approved' ORDER BY created_at DESC LIMIT 24`)
  return r.rows.map(toTestimonial)
})
