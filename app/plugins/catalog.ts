import { setCatalog, type Catalog } from '~/data/products'

/* Loads the live catalogue (database, via /api/catalog) before any page
   renders. Fetched once on the server and carried to the browser in the
   payload, so both sides render the same products. */
export default defineNuxtPlugin({
  name: 'catalog',
  async setup() {
    const catalog = useState<Catalog | null>('catalog', () => null)
    if (!catalog.value) catalog.value = await $fetch<Catalog>('/api/catalog').catch(() => null)
    if (catalog.value) setCatalog(catalog.value)
  },
})
