/** A visitor's review. It waits as “pending” until approved in /admin. */
export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)
  guardForm(event, body)
  const t = await cleanReview(body)
  await guardBacklog('testimonials', 'pending')
  const db = await useDb()
  await db.execute({
    sql: 'INSERT INTO testimonials (name, city, product, rating, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [t.name, t.city, t.product, t.rating, t.message, 'pending', Date.now()],
  })
  return { ok: true }
})
