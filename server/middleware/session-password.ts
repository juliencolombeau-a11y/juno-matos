export default defineEventHandler(async (event) => {
  const sessionConfig = useRuntimeConfig(event).session
  let password = sessionConfig.password

  if (!password) {
    const { env } = await import('cloudflare:workers')
    password = (env as typeof env & { NUXT_SESSION_PASSWORD?: string }).NUXT_SESSION_PASSWORD || ''
  }

  if (!password) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Le secret de session n’est pas configuré sur ce Worker.',
    })
  }

  sessionConfig.password = password
})
