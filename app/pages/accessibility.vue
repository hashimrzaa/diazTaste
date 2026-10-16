<script setup lang="ts">
import { WHATSAPP_URL } from '~/data/products'
</script>

<template>
  <LegalPage
    title="Accessibility"
    description="Our commitment to making the Dia’s Taste website usable by everyone."
    updated="15 October 2026"
    path="/accessibility"
  >
    <p>
      We want everyone to be able to explore our chutneys and order with ease. This website aims to meet the Web Content
      Accessibility Guidelines (WCAG) 2.2 at level AA.
    </p>

    <h2>What we’ve done</h2>
    <ul>
      <li>Every page can be used with a keyboard, with visible focus and a “Skip to content” link.</li>
      <li>If your device is set to reduce motion, smooth scrolling and large animations are turned off.</li>
      <li>All information shown in 3D and AR is also available as text, so nothing depends on the 3D experience.</li>
      <li>Images have text alternatives, and decorative images are hidden from screen readers.</li>
      <li>Text and controls are designed to meet contrast requirements, and layouts work at 200% zoom.</li>
      <li>Dialogs (such as the 3D viewer) trap focus, close with Escape and return focus when closed.</li>
    </ul>

    <h2>Known limitations</h2>
    <ul>
      <li>Augmented reality depends on your device and browser, and may not be available on every phone.</li>
      <li>The interactive 3D jar is a visual experience; its content is described in the text around it.</li>
    </ul>

    <h2>Feedback</h2>
    <p>
      If something on this site is hard to use, please tell us on
      <a :href="WHATSAPP_URL" target="_blank" rel="noopener">WhatsApp</a> and we’ll do our best to fix it and help you order
      in the meantime.
    </p>
  </LegalPage>
</template>
