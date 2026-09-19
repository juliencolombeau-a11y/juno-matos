import { asc } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const users = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      role: schema.users.role,
      createdAt: schema.users.createdAt,
      updatedAt: schema.users.updatedAt,
    })
    .from(schema.users)
    .orderBy(asc(schema.users.email))

  return { users }
})
