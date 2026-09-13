export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxthub/core',
    '@nuxtjs/cloudinary',
    'nuxt-auth-utils',
    'vuetify-nuxt-module',
  ],
  hub: {
    db: 'sqlite',
    blob: false,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME
  },
  vuetify: {
    moduleOptions: {
      prefixComposables: ['useLayout'],
    },
  },
  runtimeConfig: {
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    bootstrapSecret: process.env.NUXT_BOOTSTRAP_SECRET,
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || '',
    },
    public: {
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    },
  },
})