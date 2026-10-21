/// <reference types="@cloudflare/workers-types" />

import { eq } from 'drizzle-orm'
import { env } from 'cloudflare:workers'
import { db, schema } from 'hub:db'
import { normalizeEmail, validatePassword } from '../../utils/auth'

const adminEmail = 'julien.colombeau@gmail.com'

export default defineEventHandler(async (event) => {
  const workerEnv = env as typeof env & { NUXT_ADMIN_PASSWORD_RESET_SECRET?: string }
  const resetSecret = workerEnv.NUXT_ADMIN_PASSWORD_RESET_SECRET
  const providedSecret = getHeader(event, 'x-admin-password-reset-secret')

  if (!resetSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Le secret de récupération n’est pas configuré sur ce Worker.',
    })
  }

  if (providedSecret !== resetSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Autorisation de récupération invalide.' })
  }

  const body = await readBody<{ email?: unknown, newPassword?: unknown }>(event)
  if (normalizeEmail(body?.email) !== adminEmail) {
    throw createError({ statusCode: 404, statusMessage: 'Compte administrateur introuvable.' })
  }

  const newPassword = validatePassword(body?.newPassword)
  const [user] = await db
    .select({ id: schema.users.id, role: schema.users.role })
    .from(schema.users)
    .where(eq(schema.users.email, adminEmail))
    .limit(1)

  if (!user || user.role !== 'admin') {
    throw createError({ statusCode: 404, statusMessage: 'Compte administrateur introuvable.' })
  }

  await db
    .update(schema.users)
    .set({ passwordHash: await hashPassword(newPassword), updatedAt: new Date() })
    .where(eq(schema.users.id, user.id))

  return { success: true }
})
