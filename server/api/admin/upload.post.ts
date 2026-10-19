export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const parts = await readMultipartFormData(event)
  const file = parts?.find((p) => p.name === 'file')
  const slug = parts?.find((p) => p.name === 'slug')?.data.toString('utf8') || ''
  if (!file?.data?.length) throw createError({ statusCode: 400, statusMessage: 'No image received.' })
  const { catalog } = await readCatalog()
  if (!catalog.products.some((p) => p.slug === slug)) throw createError({ statusCode: 400, statusMessage: 'Unknown product.' })
  return await writeImage(slug, file.type || '', file.data)
})
