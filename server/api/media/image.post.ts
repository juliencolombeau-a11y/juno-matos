import { requireEditor } from '../../utils/auth'
import { getCloudinaryServerConfig, uploadImageBuffer } from '../../utils/cloudinary-migration'

export default defineEventHandler(async (event) => {
  await requireEditor(event)
  const parts = await readMultipartFormData(event)
  const file = parts?.find((part) => part.name === 'file')

  if (!file?.data || !file.type?.startsWith('image/')) {
    throw createError({ statusCode: 422, statusMessage: 'Un fichier image est requis.' })
  }
  if (file.data.byteLength > 15 * 1024 * 1024) {
    throw createError({ statusCode: 422, statusMessage: 'L’image ne doit pas dépasser 15 Mo.' })
  }

  const config = getCloudinaryServerConfig(event)
  const missingConfig = [
    !config.cloudName && 'CLOUDINARY_CLOUD_NAME',
    !config.apiKey && 'CLOUDINARY_API_KEY',
    !config.apiSecret && 'CLOUDINARY_API_SECRET',
  ].filter(Boolean)
  if (!config.cloudName || !config.apiKey || !config.apiSecret) {
    throw createError({
      statusCode: 503,
      message: `Configuration Cloudinary serveur incomplète. Paramètre(s) absent(s) : ${missingConfig.join(', ')}.`,
    })
  }

  const publicId = `juno-matos/editor-${crypto.randomUUID()}`
  try {
    const imageData = new Uint8Array(file.data).slice().buffer
    const uploaded = await uploadImageBuffer(
      imageData,
      file.type,
      publicId,
      config.cloudName,
      config.apiKey,
      config.apiSecret,
    )
    return { publicId: uploaded.public_id, url: uploaded.secure_url }
  } catch (error) {
    throw createError({
      statusCode: 502,
      message: error instanceof Error ? error.message : 'Téléversement Cloudinary impossible.',
    })
  }
})
