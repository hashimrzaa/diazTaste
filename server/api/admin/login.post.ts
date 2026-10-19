export default defineEventHandler(async (event) => {
  const { password } = await readBody<{ password?: string }>(event)
  if (!adminStatus().configured) throw createError({ statusCode: 503, statusMessage: 'Admin is not set up: add ADMIN_PASSWORD in Vercel.' })
  if (!passwordOk(String(password || ''))) {
    await new Promise((r) => setTimeout(r, 800)) // slow down guessing
    throw createError({ statusCode: 401, statusMessage: 'Wrong password.' })
  }
  startSession(event)
  return { ok: true }
})
