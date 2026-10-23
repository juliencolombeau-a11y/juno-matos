import { and, asc, count, desc, eq, like, or, sql, type SQL, type SQLWrapper } from 'drizzle-orm'
import { db, schema } from 'hub:db'

const pageSize = 24
const accentReplacements: Array<[string, string]> = [
  ['À', 'a'], ['Á', 'a'], ['Â', 'a'], ['Ã', 'a'], ['Ä', 'a'], ['Å', 'a'],
  ['à', 'a'], ['á', 'a'], ['â', 'a'], ['ã', 'a'], ['ä', 'a'], ['å', 'a'],
  ['Ç', 'c'], ['ç', 'c'],
  ['È', 'e'], ['É', 'e'], ['Ê', 'e'], ['Ë', 'e'],
  ['è', 'e'], ['é', 'e'], ['ê', 'e'], ['ë', 'e'],
  ['Ì', 'i'], ['Í', 'i'], ['Î', 'i'], ['Ï', 'i'],
  ['ì', 'i'], ['í', 'i'], ['î', 'i'], ['ï', 'i'],
  ['Ñ', 'n'], ['ñ', 'n'],
  ['Ò', 'o'], ['Ó', 'o'], ['Ô', 'o'], ['Õ', 'o'], ['Ö', 'o'],
  ['ò', 'o'], ['ó', 'o'], ['ô', 'o'], ['õ', 'o'], ['ö', 'o'],
  ['Ù', 'u'], ['Ú', 'u'], ['Û', 'u'], ['Ü', 'u'],
  ['ù', 'u'], ['ú', 'u'], ['û', 'u'], ['ü', 'u'],
  ['Ý', 'y'], ['Ÿ', 'y'], ['ý', 'y'], ['ÿ', 'y'],
]

function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function normalizeColumn(column: SQLWrapper) {
  let normalized = sql`lower(${column})`
  for (const [accented, plain] of accentReplacements) {
    normalized = sql`replace(${normalized}, ${accented}, ${plain})`
  }
  return normalized
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = typeof query.search === 'string' ? normalizeSearch(query.search.trim()) : ''
  const domaine = typeof query.domaine === 'string' ? query.domaine.trim() : ''
  const type = typeof query.type === 'string' ? query.type.trim() : ''
  const theme = typeof query.theme === 'string' ? query.theme.trim() : ''
  const lieu = typeof query.lieu === 'string' ? query.lieu.trim() : ''
  const requestedSort = typeof query.sort === 'string' ? query.sort : ''
  const sort = ['oldest', 'name-asc', 'name-desc'].includes(requestedSort)
    ? requestedSort as 'oldest' | 'name-asc' | 'name-desc'
    : 'newest'
  const parsedAge = Number(query.age)
  const age = Number.isInteger(parsedAge) && parsedAge >= 0 ? parsedAge : null
  const parsedPage = Number(query.page)
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const offset = (page - 1) * pageSize

  const filters = [
    search
      ? or(
          like(normalizeColumn(schema.materials.nom), `%${search}%`),
          like(normalizeColumn(schema.materials.description), `%${search}%`),
          like(normalizeColumn(schema.materials.commentaire), `%${search}%`),
        )
      : undefined,
    domaine ? eq(schema.materials.domaine, domaine) : undefined,
    type ? eq(schema.materials.type, type) : undefined,
    theme ? eq(schema.materials.theme, theme) : undefined,
    lieu ? eq(schema.materials.lieu, lieu) : undefined,
    age !== null ? eq(schema.materials.ageMin, age) : undefined,
  ].filter(Boolean)

  const where = filters.length > 0 ? and(...filters) : undefined
  const sortOrders = {
    newest: [desc(schema.materials.createdAt), asc(schema.materials.id)],
    oldest: [asc(schema.materials.createdAt), asc(schema.materials.id)],
    'name-asc': [asc(schema.materials.nom), asc(schema.materials.id)],
    'name-desc': [desc(schema.materials.nom), asc(schema.materials.id)],
  } satisfies Record<'newest' | 'oldest' | 'name-asc' | 'name-desc', SQL[]>
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
      .orderBy(...sortOrders[sort])
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
