import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export function validatePassword(value: unknown): string {
  if (typeof value !== 'string' || value.length < 12 || value.length > 128) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Le mot de passe doit contenir entre 12 et 128 caractères.',
    })
  }

  return value
}

export async function findUserByEmail(email: string) {
  const rows = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      passwordHash: schema.users.passwordHash,
      role: schema.users.role,
    })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1)

  return rows[0] ?? null
}

export async function requireEditor(event: Parameters<typeof requireUserSession>[0]) {
  const session = await requireUserSession(event)
  if (session.user?.role !== 'admin' && session.user?.role !== 'editor') {
    throw createError({ statusCode: 403, statusMessage: 'Droits insuffisants.' })
  }
  return session
}
