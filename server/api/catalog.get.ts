/** Visible products, read by the site on every page load (see app/plugins/catalog.ts). */
export default defineEventHandler(() => readPublicCatalog())
