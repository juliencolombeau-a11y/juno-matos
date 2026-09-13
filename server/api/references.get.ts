import { asc } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default defineEventHandler(async () => {
  const [domaines, types, themes, lieux, ages] = await Promise.all([
    db.select({ id: schema.domaines.id, nom: schema.domaines.nom }).from(schema.domaines).orderBy(asc(schema.domaines.nom)),
    db.select({ id: schema.types.id, nom: schema.types.nom }).from(schema.types).orderBy(asc(schema.types.nom)),
    db.select({ id: schema.themes.id, nom: schema.themes.nom }).from(schema.themes).orderBy(asc(schema.themes.nom)),
    db.select({ id: schema.lieux.id, nom: schema.lieux.nom }).from(schema.lieux).orderBy(asc(schema.lieux.nom)),
    db.select({ id: schema.ages.id, nom: schema.ages.nom }).from(schema.ages).orderBy(asc(schema.ages.nom)),
  ])

  return { domaines, types, themes, lieux, ages }
})
