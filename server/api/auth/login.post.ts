import { findUserByEmail, normalizeEmail } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: unknown, password?: unknown }>(event)
  const email = normalizeEmail(body?.email)
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Adresse e-mail ou mot de passe invalide.',
    })
  }

  const user = await findUserByEmail(email)
  const passwordMatches = user ? await verifyPassword(user.passwordHash, password) : false

  if (!user || !passwordMatches) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Adresse e-mail ou mot de passe incorrect.',
    })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    loggedInAt: new Date(),
  })

  return { user: { id: user.id, email: user.email, role: user.role } }
})
