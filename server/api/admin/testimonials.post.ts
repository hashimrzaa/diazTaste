/** Admin adds a review by hand (e.g. one sent on WhatsApp) — published straight away. */
export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const t = await cleanReview(await readBody<Record<string, unknown>>(event))
  const db = await useDb()
  await db.execute({
    sql: 'INSERT INTO testimonials (name, city, product, rating, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [t.name, t.city, t.product, t.rating, t.message, 'approved', Date.now()],
  })
  return { ok: true }
})
