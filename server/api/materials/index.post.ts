import { db, schema } from 'hub:db'
import { requireEditor } from '../../utils/auth'
import { parseMaterialInput } from '../../utils/material-validation'

export default defineEventHandler(async (event) => {
  await requireEditor(event)
  const body = await readBody<Record<string, unknown>>(event)
  const input = parseMaterialInput(body ?? {})
  const now = new Date()

  const [material] = await db
    .insert(schema.materials)
    .values({ ...input, createdAt: now, updatedAt: now })
    .returning()

  setResponseStatus(event, 201)
  return material
})
