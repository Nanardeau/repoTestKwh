// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: {
    enabled: true,
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
  modules: ['@nuxt/eslint', '@nuxt/ui'],
  nitro: {
  devProxy: {
    "/api": {
      target: "http://localhost:3030",
      changeOrigin: true,
    },
    },
  },
})