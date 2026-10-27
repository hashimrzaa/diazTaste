export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const socials = cleanSocials(await readBody(event))
  await writeSocials(socials)
  return socials
})
