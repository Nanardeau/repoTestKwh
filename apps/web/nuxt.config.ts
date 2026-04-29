// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  css: ['~/assets/css/main.css'],
  devtools: {
    enabled: false,
    timeline: {
      enabled: true,
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE,
      SMPLR_CLIENT_TOKEN: process.env.NUXT_SMPLR_CLIENT_TOKEN,
      SMPLR_ORGANIZATION_ID: process.env.NUXT_SMPLR_ORGANIZATION_ID
    }
  },
  icon:{
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
    },
    serverBundle: 'remote',
  },
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxt/icon'],
  nitro: {
  devProxy: {
    "/api": {
      target: "http://localhost:3030",
      changeOrigin: true,
    },
    },
  },
  vite:{
    optimizeDeps:{
      include : [
        '@smplrspace/smplr-loader',
      ]
    }
  }
})