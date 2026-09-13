import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { requireEditor } from '../../utils/auth'
import { deleteCloudinaryImage } from '../../utils/cloudinary-migration'
import { parseMaterialInput } from '../../utils/material-validation'

export default defineEventHandler(async (event) => {
  await requireEditor(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de matériel invalide.' })
  }

  const [existing] = await db
    .select({
      cloudinaryPublicId: schema.materials.cloudinaryPublicId,
    })
    .from(schema.materials)
    .where(eq(schema.materials.id, id))
    .limit(1)
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Matériel introuvable.' })
  }

  const input = parseMaterialInput(await readBody<Record<string, unknown>>(event) ?? {})
  const [material] = await db
    .update(schema.materials)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(schema.materials.id, id))
    .returning()

  if (existing.cloudinaryPublicId && existing.cloudinaryPublicId !== input.cloudinaryPublicId) {
    try {
      const config = useRuntimeConfig(event)
      await deleteCloudinaryImage(existing.cloudinaryPublicId, {
        cloudName: config.public.cloudinaryCloudName,
        apiKey: config.cloudinaryApiKey,
        apiSecret: config.cloudinaryApiSecret,
      })
    } catch {
      throw createError({
        statusCode: 502,
        statusMessage: 'La fiche est enregistrée, mais l’ancienne image n’a pas pu être supprimée.',
      })
    }
  }
  return material
})
