<script setup lang="ts">
import { WHATSAPP_URL } from '~/data/products'
</script>

<template>
  <LegalPage
    title="Privacy policy"
    description="How Dia’s Taste handles your personal information — no tracking, no ads, camera stays on your device."
    updated="15 October 2026"
    path="/privacy"
  >
    <p>
      Dia’s Taste (“we”, “us”) is a home kitchen making chutneys. We respect your privacy and collect as little
      information as possible. This policy explains what we collect, why, and the choices you have.
    </p>

    <h2>The short version</h2>
    <ul>
      <li>This website has no user accounts, no forms, no analytics, no advertising and no tracking cookies.</li>
      <li>Fonts, 3D models and code are served from our own server — your visit is not shared with font or ad networks.</li>
      <li>The camera and AR features run on your device. We never receive, record or store your camera feed.</li>
      <li>When you order on WhatsApp, we use your details only to prepare and deliver your order.</li>
    </ul>

    <h2>Information we collect</h2>
    <p>
      <strong>Website visits.</strong> Like any website, our hosting provider automatically records basic technical
      information (such as IP address, browser type and the pages requested) in server logs. These logs are used only to
      keep the site secure and running, and are deleted on a rolling basis.
    </p>
    <p>
      <strong>Orders and messages.</strong> When you message us on WhatsApp we receive your name, phone number and
      whatever you choose to share — typically your order, delivery address and any notes. We use this information to
      confirm, prepare, deliver and, if needed, follow up on your order.
    </p>

    <h2>Camera and augmented reality</h2>
    <p>
      “View in your space” opens your device’s built-in AR viewer (Apple AR Quick Look on iPhone and iPad, Google Scene
      Viewer or WebXR on Android). These viewers are provided by Apple and Google and are covered by their own privacy
      policies; we only provide the 3D model of the jar.
    </p>
    <p>
      Our “camera view” asks for camera permission only when you press the start button. The video is shown on your
      screen and is never uploaded or recorded. Photos you capture are saved to your own device. The camera stops as soon
      as you close the view.
    </p>

    <h2>WhatsApp</h2>
    <p>
      WhatsApp is operated by WhatsApp LLC (Meta). Messages you send us are also processed by WhatsApp under its own terms
      and privacy policy.
    </p>

    <h2>How long we keep information</h2>
    <p>
      We keep order conversations for as long as needed to fulfil your order, handle any questions about it and meet our
      legal and tax record-keeping obligations. After that, we delete it.
    </p>

    <h2>Sharing</h2>
    <p>
      We do not sell or rent your information. We share delivery details only with the person or courier delivering your
      order, and only where necessary.
    </p>

    <h2>Your rights</h2>
    <p>
      You can ask us at any time what information we hold about you, ask us to correct it, or ask us to delete it. Depending
      on where you live, you may have additional rights under applicable data protection law. To make a request, message us
      on <a :href="WHATSAPP_URL" target="_blank" rel="noopener">WhatsApp</a>.
    </p>

    <h2>Children</h2>
    <p>This website is not directed at children, and we do not knowingly collect information from children.</p>

    <h2>Changes</h2>
    <p>If we change this policy, we will update the date at the top of this page.</p>
  </LegalPage>
</template>
