/// <reference types="@cloudflare/workers-types" />

import { env } from 'cloudflare:workers'

export default defineNitroPlugin(() => {
  const workerEnv = env as typeof env & { NUXT_SESSION_PASSWORD?: string }
  const password = workerEnv.NUXT_SESSION_PASSWORD

  if (password) {
    useRuntimeConfig().session.password = password
  }
})
