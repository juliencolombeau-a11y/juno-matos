import { and, asc, count, desc, eq, like, or } from 'drizzle-orm'
import { db, schema } from 'hub:db'

const pageSize = 24

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const domaine = typeof query.domaine === 'string' ? query.domaine.trim() : ''
  const type = typeof query.type === 'string' ? query.type.trim() : ''
  const theme = typeof query.theme === 'string' ? query.theme.trim() : ''
  const lieu = typeof query.lieu === 'string' ? query.lieu.trim() : ''
  const parsedAge = Number(query.age)
  const age = Number.isInteger(parsedAge) && parsedAge >= 0 ? parsedAge : null
  const parsedPage = Number(query.page)
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const offset = (page - 1) * pageSize

  const filters = [
    search
      ? or(
          like(schema.materials.nom, `%${search}%`),
          like(schema.materials.description, `%${search}%`),
          like(schema.materials.commentaire, `%${search}%`),
        )
      : undefined,
    domaine ? eq(schema.materials.domaine, domaine) : undefined,
    type ? eq(schema.materials.type, type) : undefined,
    theme ? eq(schema.materials.theme, theme) : undefined,
    lieu ? eq(schema.materials.lieu, lieu) : undefined,
    age !== null ? eq(schema.materials.ageMin, age) : undefined,
  ].filter(Boolean)

  const where = filters.length > 0 ? and(...filters) : undefined
  const [materials, countRows] = await Promise.all([
    db
      .select({
        id: schema.materials.id,
        nom: schema.materials.nom,
        domaine: schema.materials.domaine,
        type: schema.materials.type,
        theme: schema.materials.theme,
        ageMin: schema.materials.ageMin,
        nbreMin: schema.materials.nbreMin,
        nbreMax: schema.materials.nbreMax,
        cloudinaryUrl: schema.materials.cloudinaryUrl,
        lieu: schema.materials.lieu,
        description: schema.materials.description,
      })
      .from(schema.materials)
      .where(where)
      .orderBy(asc(schema.materials.nom))
      .limit(pageSize)
      .offset(offset),
    db.select({ total: count() }).from(schema.materials).where(where),
  ])
  const total = countRows[0]?.total ?? 0

  return {
    data: materials,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
})
