import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { normalizeEmail, requireAdmin, validatePassword } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody<{ email?: unknown, password?: unknown, role?: unknown }>(event)
  const email = normalizeEmail(body?.email)
  const password = validatePassword(body?.password)
  const role = body?.role === 'admin' || body?.role === 'editor' ? body.role : 'editor'

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Une adresse e-mail valide est requise.',
    })
  }

  const existingUser = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1)

  if (existingUser[0]) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Un compte avec cette adresse e-mail existe déjà.',
    })
  }

  const now = new Date()
  const [user] = await db
    .insert(schema.users)
    .values({
      email,
      passwordHash: await hashPassword(password),
      role,
      createdAt: now,
      updatedAt: now,
    })
    .returning({
      id: schema.users.id,
      email: schema.users.email,
      role: schema.users.role,
      createdAt: schema.users.createdAt,
      updatedAt: schema.users.updatedAt,
    })

  return { user }
})
