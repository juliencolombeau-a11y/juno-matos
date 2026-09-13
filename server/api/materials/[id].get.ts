import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de matériel invalide.' })
  }

  const [material] = await db
    .select({
      id: schema.materials.id,
      nom: schema.materials.nom,
      domaine: schema.materials.domaine,
      type: schema.materials.type,
      theme: schema.materials.theme,
      ageMin: schema.materials.ageMin,
      nbreMin: schema.materials.nbreMin,
      nbreMax: schema.materials.nbreMax,
      cloudinaryPublicId: schema.materials.cloudinaryPublicId,
      cloudinaryUrl: schema.materials.cloudinaryUrl,
      lieu: schema.materials.lieu,
      description: schema.materials.description,
      commentaire: schema.materials.commentaire,
      createdAt: schema.materials.createdAt,
      updatedAt: schema.materials.updatedAt,
    })
    .from(schema.materials)
    .where(eq(schema.materials.id, id))
    .limit(1)

  if (!material) {
    throw createError({ statusCode: 404, statusMessage: 'Matériel introuvable.' })
  }

  return material
})
