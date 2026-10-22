/** “Make me something” request from the contact form; read in /admin. */
export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)
  guardForm(event, body)
  const q = cleanEnquiry(body)
  await guardBacklog('enquiries', 'new')
  const db = await useDb()
  await db.execute({
    sql: 'INSERT INTO enquiries (name, phone, email, kind, quantity, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: [q.name, q.phone, q.email, q.kind, q.quantity, q.message, 'new', Date.now()],
  })
  return { ok: true }
})
