import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { validatePassword } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = session.user?.id

  if (typeof userId !== 'number' || !Number.isInteger(userId) || userId <= 0) {
    throw createError({ statusCode: 401, statusMessage: 'Session utilisateur invalide.' })
  }

  const body = await readBody<{ currentPassword?: unknown, newPassword?: unknown }>(event)
  const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : ''

  if (!currentPassword) {
    throw createError({ statusCode: 422, statusMessage: 'Le mot de passe actuel est requis.' })
  }

  const newPassword = validatePassword(body?.newPassword)
  if (currentPassword === newPassword) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Le nouveau mot de passe doit être différent du mot de passe actuel.',
    })
  }

  const [user] = await db
    .select({ passwordHash: schema.users.passwordHash })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1)

  if (!user || !(await verifyPassword(user.passwordHash, currentPassword))) {
    throw createError({ statusCode: 401, statusMessage: 'Le mot de passe actuel est incorrect.' })
  }

  await db
    .update(schema.users)
    .set({ passwordHash: await hashPassword(newPassword), updatedAt: new Date() })
    .where(eq(schema.users.id, userId))

  return { success: true }
})
