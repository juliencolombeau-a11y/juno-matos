<script setup lang="ts">
useHead({
  titleTemplate: '%s | Juno-Matos',
  link: [
    { rel: 'icon', type: 'image/png', href: '/matos.png' },
    { rel: 'apple-touch-icon', href: '/matos.png' },
  ],
  meta: [
    { name: 'theme-color', content: '#0f172a' },
    { name: 'msapplication-TileColor', content: '#0f172a' },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>