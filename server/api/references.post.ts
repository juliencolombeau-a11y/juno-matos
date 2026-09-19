import { asc, eq, sql } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { requireEditor } from '../utils/auth'

const referenceTables = {
  domaines: schema.domaines,
  types: schema.types,
  themes: schema.themes,
} as const

type ReferenceKind = keyof typeof referenceTables

function slugify(value: string) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'reference'
}

export default defineEventHandler(async (event) => {
  await requireEditor(event)

  const body = await readBody<{ kind?: unknown, nom?: unknown }>(event)
  const kind = body?.kind
  const nom = typeof body?.nom === 'string' ? body.nom.trim() : ''

  if (!kind || typeof kind !== 'string' || !(kind in referenceTables) || !nom) {
    throw createError({ statusCode: 422, statusMessage: 'Type ou nom de référence invalide.' })
  }

  const table = referenceTables[kind as ReferenceKind]
  const existing = await db
    .select({ id: table.id, nom: table.nom })
    .from(table)
    .where(eq(table.nom, nom))
    .limit(1)

  if (existing[0]) {
    return { item: existing[0], created: false }
  }

  const id = slugify(nom)
  const [item] = await db
    .insert(table)
    .values({ id, nom })
    .returning({ id: table.id, nom: table.nom })

  return { item, created: true }
})
