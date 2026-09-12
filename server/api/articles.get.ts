import { db, schema } from '@nuxthub/db'

export default defineEventHandler(async () => {
  // Récupère les articles en BDD
  return await db.select().from(schema.articles)
})