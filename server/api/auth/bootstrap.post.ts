import { count } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { normalizeEmail, validatePassword } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const providedSecret = getHeader(event, 'x-bootstrap-secret')

  if (!config.bootstrapSecret || providedSecret !== config.bootstrapSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Secret de création invalide.' })
  }

  const body = await readBody<{ email?: unknown, password?: unknown }>(event)
  const email = normalizeEmail(body?.email)
  const password = validatePassword(body?.password)

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Une adresse e-mail valide est requise.',
    })
  }

  const [{ total } = { total: 0 }] = await db.select({ total: count() }).from(schema.users)
  if (total > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Le premier administrateur a déjà été créé.',
    })
  }

  const now = new Date()
  const [user] = await db
    .insert(schema.users)
    .values({
      email,
      passwordHash: await hashPassword(password),
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    })
    .returning({
      id: schema.users.id,
      email: schema.users.email,
      role: schema.users.role,
    })

  return { user }
})
