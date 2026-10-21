export default defineEventHandler(async (event) => {
  const path = event.path
  const isSessionRoute = path.startsWith('/api/auth/')
    || path.startsWith('/api/_auth/')
    || path.startsWith('/api/admin/')
  const isApiWrite = path.startsWith('/api/') && event.method !== 'GET'

  if (!isSessionRoute && !isApiWrite) {
    return
  }

  const sessionConfig = useRuntimeConfig(event).session
  let password = sessionConfig.password

  if (!password) {
    const { env } = await import('cloudflare:workers')
    password = (env as typeof env & { NUXT_SESSION_PASSWORD?: string }).NUXT_SESSION_PASSWORD || ''
  }

  if (password) {
    sessionConfig.password = password
  }
})
