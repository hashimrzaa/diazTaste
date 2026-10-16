<script setup lang="ts">
import { WHATSAPP_URL } from '~/data/products'
</script>

<template>
  <LegalPage
    title="Terms of sale"
    description="The terms that apply when you order homemade chutney from Dia’s Taste."
    updated="15 October 2026"
    path="/terms"
  >
    <p>
      These terms apply to orders placed with Dia’s Taste. By placing an order you agree to them. If anything is unclear,
      please ask us on <a :href="WHATSAPP_URL" target="_blank" rel="noopener">WhatsApp</a> before ordering.
    </p>

    <h2>Placing an order</h2>
    <p>
      Orders are placed by message on WhatsApp. An order is confirmed only once we have replied with the final price,
      delivery charge (if any) and expected delivery time, and you have accepted them.
    </p>

    <h2>Prices and payment</h2>
    <p>
      Prices are confirmed in writing for each order. Accepted payment methods are confirmed in the same conversation. We
      may update prices from time to time, but a confirmed order will not change in price.
    </p>

    <h2>Delivery</h2>
    <p>
      Our chutneys are made fresh in small batches, so delivery times are estimates. Please make sure someone is available
      to receive the order and refrigerate it promptly.
    </p>

    <h2>Food safety, storage and allergens</h2>
    <ul>
      <li>Our chutneys contain no additives or artificial preservatives. Keep them refrigerated and use a clean, dry spoon.</li>
      <li>The ingredient list and allergen information are printed on each jar. Our kitchen also handles other ingredients, so we cannot guarantee that any product is free from traces of allergens.</li>
      <li>If you have a food allergy or intolerance, please tell us before ordering.</li>
      <li>Product photos and 3D models are for illustration. Colour and texture can vary slightly between batches because every jar is homemade.</li>
    </ul>

    <h2>Problems with an order</h2>
    <p>
      Because our products are perishable food, we cannot accept returns of opened jars or change-of-mind returns. If an
      item arrives damaged, leaking or incorrect, please message us within 24 hours of delivery with a photo and we will
      replace it or refund you. This does not affect any rights you have under applicable consumer protection law.
    </p>

    <h2>Website content</h2>
    <p>
      All text, images, 3D models, the Dia’s Taste name and logo are owned by Dia’s Taste and may not be reused without
      permission.
    </p>

    <h2>Governing law</h2>
    <p>These terms are governed by the laws of Pakistan.</p>
  </LegalPage>
</template>
