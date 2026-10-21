/// <reference types="@cloudflare/workers-types" />

import { env } from 'cloudflare:workers'

export default defineNitroPlugin(() => {
  const workerEnv = env as typeof env & { NUXT_SESSION_PASSWORD?: string }
  const password = workerEnv.NUXT_SESSION_PASSWORD

  if (!password || password.length < 32) {
    throw new Error('The NUXT_SESSION_PASSWORD secret must contain at least 32 characters.')
  }

  useRuntimeConfig().session.password = password
})
