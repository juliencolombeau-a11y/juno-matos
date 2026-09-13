import { and, eq, isNotNull, isNull } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export interface CloudinaryUploadResponse {
  public_id: string
  secure_url: string
}

export interface ImageMigrationSummary {
  processed: number
  migrated: number
  skipped: number
  failed: number
  errors: Array<{ materialId: number; message: string }>
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function signUpload(params: { public_id: string; timestamp: number }, apiSecret: string): Promise<string> {
  const payload = `public_id=${params.public_id}&timestamp=${params.timestamp}${apiSecret}`
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(payload))
  return toHex(digest)
}

async function uploadImage(
  sourceUrl: string,
  publicId: string,
  cloudName: string,
  apiKey: string,
  apiSecret: string,
): Promise<CloudinaryUploadResponse> {
  const sourceResponse = await fetch(sourceUrl)
  if (!sourceResponse.ok) {
    throw new Error(`Téléchargement Google Drive impossible (${sourceResponse.status}).`)
  }

  const contentType = sourceResponse.headers.get('content-type') ?? ''
  if (!contentType.startsWith('image/')) {
    throw new Error(`Le contenu source n'est pas une image (${contentType || 'type inconnu'}).`)
  }

  const body = await sourceResponse.arrayBuffer()
  return uploadImageBuffer(body, contentType, publicId, cloudName, apiKey, apiSecret)
}

export async function uploadImageBuffer(
  body: ArrayBuffer,
  contentType: string,
  publicId: string,
  cloudName: string,
  apiKey: string,
  apiSecret: string,
): Promise<CloudinaryUploadResponse> {
  if (body.byteLength > 15 * 1024 * 1024) {
    throw new Error('Image supérieure à 15 Mo.')
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const signature = await signUpload({ public_id: publicId, timestamp }, apiSecret)
  const formData = new FormData()
  formData.append('file', new Blob([body], { type: contentType }))
  formData.append('api_key', apiKey)
  formData.append('timestamp', String(timestamp))
  formData.append('public_id', publicId)
  formData.append('signature', signature)

  const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!uploadResponse.ok) {
    throw new Error(`Téléversement Cloudinary impossible (${uploadResponse.status}).`)
  }

  return await uploadResponse.json() as CloudinaryUploadResponse
}

export async function deleteCloudinaryImage(
  publicId: string,
  config: { cloudName?: string; apiKey?: string; apiSecret?: string },
): Promise<void> {
  if (!config.cloudName || !config.apiKey || !config.apiSecret) {
    throw createError({
      statusCode: 503,
      statusMessage: 'La configuration Cloudinary serveur est incomplète.',
    })
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const signature = await signUpload({ public_id: publicId, timestamp }, config.apiSecret)
  const formData = new FormData()
  formData.append('public_id', publicId)
  formData.append('api_key', config.apiKey)
  formData.append('timestamp', String(timestamp))
  formData.append('signature', signature)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) {
    throw new Error(`Suppression Cloudinary impossible (${response.status}).`)
  }
}

export async function migrateMaterialImages(
  config: { cloudName?: string; apiKey?: string; apiSecret?: string },
  limit: number,
): Promise<ImageMigrationSummary> {
  if (!config.cloudName || !config.apiKey || !config.apiSecret) {
    throw createError({
      statusCode: 503,
      statusMessage: 'La configuration Cloudinary serveur est incomplète.',
    })
  }

  const materials = await db
    .select({
      id: schema.materials.id,
      legacyId: schema.materials.legacyId,
      sourceImageUrl: schema.materials.sourceImageUrl,
    })
    .from(schema.materials)
    .where(and(
      isNull(schema.materials.cloudinaryPublicId),
      isNotNull(schema.materials.sourceImageUrl),
    ))
    .limit(limit)

  const summary: ImageMigrationSummary = {
    processed: materials.length,
    migrated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  }

  for (const material of materials) {
    if (!material.sourceImageUrl || !material.legacyId) {
      summary.skipped += 1
      continue
    }

    try {
      const publicId = `juno-matos/material-${material.legacyId}`
      const uploaded = await uploadImage(
        material.sourceImageUrl,
        publicId,
        config.cloudName,
        config.apiKey,
        config.apiSecret,
      )
      await db
        .update(schema.materials)
        .set({
          cloudinaryPublicId: uploaded.public_id,
          cloudinaryUrl: uploaded.secure_url,
          updatedAt: new Date(),
        })
        .where(eq(schema.materials.id, material.id))
      summary.migrated += 1
    } catch (error) {
      summary.failed += 1
      summary.errors.push({
        materialId: material.id,
        message: error instanceof Error ? error.message : 'Erreur inconnue.',
      })
    }
  }

  return summary
}
