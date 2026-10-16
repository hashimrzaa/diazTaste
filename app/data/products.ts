/**
 * Product catalogue — the single source of truth for the menu, product pages,
 * 3D stage and structured data.
 *
 * Before launch, please confirm with the kitchen:
 *  - `price`  (PKR). Leave `null` to show “Price on WhatsApp”.
 *  - `ingredients` + `allergens` must match the printed jar label exactly.
 *  - `taste` scores are 1–5 and purely descriptive.
 */
export interface Product {
  slug: string
  name: string
  short: string
  urdu: string
  tagline: string
  description: string
  ingredients: string[]
  allergens: string[]
  pairs: string[]
  taste: { sweet: number; tangy: number; heat: number }
  recipe: { title: string; steps: string[] }
  weight: string
  price: number | null
  model: string
  image: string
  color: { accent: string; deep: string; tint: string; ink: string }
}

/** WhatsApp Business chat link (from the brand’s official WhatsApp QR). */
export const WHATSAPP_URL = 'https://wa.me/message/UIZXZAIIGBVYF1'

/** Phone contact. NUMBER is digits only in international format (92 + mobile,
 *  no leading 0); DISPLAY is how it reads on screen; TEL opens a direct chat. */
export const WHATSAPP_NUMBER = '923243560784'
export const WHATSAPP_DISPLAY = '0324 3560784'
export const WHATSAPP_TEL = `https://wa.me/${WHATSAPP_NUMBER}`

export const products: Product[] = [
  {
    slug: 'green',
    name: 'Green Chutney',
    short: 'Green',
    urdu: 'Hari',
    tagline: 'Mint-bright. Chilli-sharp.',
    description:
      'Fresh mint and coriander ground with green chillies, garlic and a squeeze of lemon. Cool on the first bite, a slow green heat on the second — the one that disappears first at every dastarkhwan.',
    ingredients: ['Fresh mint', 'Coriander leaves', 'Green chillies', 'Garlic', 'Lemon', 'Cumin', 'Salt'],
    allergens: [],
    pairs: ['Samosa & pakora', 'Seekh kebab', 'Chaat', 'Club sandwiches'],
    taste: { sweet: 1, tangy: 4, heat: 3 },
    recipe: { title: 'Chutney club sandwich', steps: ['Butter two slices of bread', 'Spread a thick layer of Green Chutney', 'Add cucumber, tomato & a pinch of salt'] },
    weight: '500 g',
    price: null,
    model: '/models/green.r3.glb',
    image: '/images/green.webp',
    color: { accent: '#4E9A1E', deep: '#1F3D0C', tint: '#E4EFD2', ink: '#16260A' },
  },
  {
    slug: 'garlic',
    name: 'Garlic Chutney',
    short: 'Garlic',
    urdu: 'Lehsan',
    tagline: 'Fiery, garlicky, unapologetic.',
    description:
      'Whole garlic pounded with sun-dried red chillies and crushed chilli flakes into a coarse, glossy paste. Bold enough for parathas at breakfast, brave enough for anything grilled.',
    ingredients: ['Garlic', 'Dried red chillies', 'Chilli flakes', 'Vinegar', 'Oil', 'Salt'],
    allergens: [],
    pairs: ['Aloo paratha', 'Grilled chicken', 'Fries', 'Daal chawal'],
    taste: { sweet: 1, tangy: 2, heat: 5 },
    recipe: { title: 'Garlic chutney paratha', steps: ['Roll out a paratha', 'Brush with Garlic Chutney & ghee', 'Fold, roast golden, serve with dahi'] },
    weight: '500 g',
    price: null,
    model: '/models/garlic.r3.glb',
    image: '/images/garlic.webp',
    color: { accent: '#D9381E', deep: '#5C1208', tint: '#FADCCD', ink: '#3A0C05' },
  },
  {
    slug: 'aloo-bukhara',
    name: 'Aloo Bukhara Chutney',
    short: 'Aloo Bukhara',
    urdu: 'Aloo Bukhara',
    tagline: 'Plum-sweet with a sour wink.',
    description:
      'Dried plums slow-simmered until jammy, then lifted with red chilli and toasted spices. Sweet, tart and deeply fruity — the classic partner to a plate of biryani.',
    ingredients: ['Aloo bukhara (dried plums)', 'Sugar', 'Red chillies', 'Cumin', 'Fennel', 'Salt'],
    allergens: [],
    pairs: ['Biryani', 'Pulao', 'Shami kebab', 'Cheese boards'],
    taste: { sweet: 4, tangy: 4, heat: 2 },
    recipe: { title: 'Biryani’s best friend', steps: ['Plate your biryani or pulao', 'Spoon Aloo Bukhara on the side', 'Add raita — sweet, sour, done'] },
    weight: '500 g',
    price: null,
    model: '/models/aloo-bukhara.r3.glb',
    image: '/images/aloo-bukhara.webp',
    color: { accent: '#B0215F', deep: '#4A0A26', tint: '#F6D9E5', ink: '#33061A' },
  },
  {
    slug: 'imli',
    name: 'Imli Chutney',
    short: 'Imli',
    urdu: 'Imli',
    tagline: 'Tamarind tang, slow-cooked.',
    description:
      'Ripe tamarind pulp cooked down with jaggery, dried chillies and roasted cumin until thick and glossy. The sweet-sour backbone of every great chaat.',
    ingredients: ['Tamarind', 'Jaggery', 'Dried red chillies', 'Garlic', 'Roasted cumin', 'Salt'],
    allergens: [],
    pairs: ['Dahi bhalla', 'Gol gappay', 'Fruit chaat', 'Pakoras'],
    taste: { sweet: 3, tangy: 5, heat: 2 },
    recipe: { title: 'Quick dahi bhalla', steps: ['Soak bhallay, top with whisked dahi', 'Drizzle Imli Chutney generously', 'Finish with chaat masala & zeera'] },
    weight: '500 g',
    price: null,
    model: '/models/imli.r3.glb',
    image: '/images/imli.webp',
    color: { accent: '#C2621C', deep: '#4D2108', tint: '#F6DFC7', ink: '#331504' },
  },
  {
    slug: 'khajoor',
    name: 'Khajoor Chutney',
    short: 'Khajoor',
    urdu: 'Khajoor',
    tagline: 'Date-rich and velvety.',
    description:
      'Soft dates blended with a whisper of chilli and toasted seeds for a dark, caramel-sweet chutney. Mellow enough for the kids, interesting enough for everyone else.',
    ingredients: ['Dates', 'Tamarind', 'Red chilli flakes', 'Coriander seeds', 'Fennel', 'Salt'],
    allergens: [],
    pairs: ['Samosa', 'Iftar platters', 'Roast lamb', 'Toast & cream cheese'],
    taste: { sweet: 5, tangy: 2, heat: 1 },
    recipe: { title: 'Iftar samosa dip', steps: ['Warm a few samosas', 'Loosen Khajoor Chutney with a little water', 'Dip, sprinkle chilli flakes, enjoy'] },
    weight: '500 g',
    price: null,
    model: '/models/khajoor.r3.glb',
    image: '/images/khajoor.webp',
    color: { accent: '#9A5418', deep: '#3D1C06', tint: '#F1DFC2', ink: '#2A1203' },
  },
]

export const getProduct = (slug: string) => products.find((p) => p.slug === slug)

export const formatPrice = (p: Product) =>
  p.price == null ? 'Price on WhatsApp' : `Rs ${p.price.toLocaleString('en-PK')}`
