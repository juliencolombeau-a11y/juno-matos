// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxthub/core',
  '@nuxtjs/cloudinary'
],
// Configuration NuxtHub
  hub: {
    db: 'sqlite', // Active la base de données SQL
    blob: false,  // Inutile ici car tu utilises Cloudinary pour les fichiers
  },

  // Configuration Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME
  }
})