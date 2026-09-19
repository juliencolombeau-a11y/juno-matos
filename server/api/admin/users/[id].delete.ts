import { and, count, eq, ne } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const session = await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant utilisateur invalide.' })
  }

  const [targetUser] = await db
    .select({
      id: schema.users.id,
      role: schema.users.role,
    })
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1)

  if (!targetUser) {
    throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable.' })
  }

  if (session.user?.id === id) {
    throw createError({ statusCode: 403, statusMessage: 'Vous ne pouvez pas supprimer votre propre compte.' })
  }

  if (targetUser.role === 'admin') {
    const [{ total } = { total: 0 }] = await db
      .select({ total: count() })
      .from(schema.users)
      .where(and(eq(schema.users.role, 'admin'), ne(schema.users.id, id)))

    if (total <= 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Impossible de supprimer le dernier administrateur.',
      })
    }
  }

  const [user] = await db
    .delete(schema.users)
    .where(eq(schema.users.id, id))
    .returning({ id: schema.users.id })

  return { success: !!user }
})
