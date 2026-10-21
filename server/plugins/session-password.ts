/// <reference types="@cloudflare/workers-types" />

import { env } from 'cloudflare:workers'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const workerEnv = env as typeof env & { NUXT_SESSION_PASSWORD?: string }
    const password = workerEnv.NUXT_SESSION_PASSWORD

    if (!password) {
      return
    }

    process.env.NUXT_SESSION_PASSWORD = password
    useRuntimeConfig(event).session.password = password
  })
})
