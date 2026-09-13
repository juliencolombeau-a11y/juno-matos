export interface MaterialInput {
  nom: string
  domaine: string | null
  type: string | null
  theme: string | null
  ageMin: number | null
  nbreMin: number | null
  nbreMax: number | null
  lieu: string | null
  description: string | null
  commentaire: string | null
  cloudinaryPublicId: string | null
  cloudinaryUrl: string | null
}

function optionalText(value: unknown, field: string, maxLength: number): string | null {
  if (value === null || value === undefined || value === '') {
    return null
  }
  if (typeof value !== 'string' || value.trim().length > maxLength) {
    throw createError({ statusCode: 422, statusMessage: `Le champ ${field} est invalide.` })
  }
  return value.trim() || null
}

function optionalInteger(value: unknown, field: string, min: number, max: number): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    throw createError({ statusCode: 422, statusMessage: `Le champ ${field} est invalide.` })
  }
  return value
}

export function parseMaterialInput(body: Record<string, unknown>): MaterialInput {
  const nom = optionalText(body.nom, 'nom', 200)
  if (!nom) {
    throw createError({ statusCode: 422, statusMessage: 'Le nom du matériel est obligatoire.' })
  }

  const ageMin = optionalInteger(body.ageMin, 'ageMin', 0, 120)
  return {
    nom,
    domaine: optionalText(body.domaine, 'domaine', 200),
    type: optionalText(body.type, 'type', 200),
    theme: optionalText(body.theme, 'theme', 200),
    ageMin,
    nbreMin: optionalInteger(body.nbreMin, 'nbreMin', 0, 100000),
    nbreMax: optionalInteger(body.nbreMax, 'nbreMax', 0, 100000),
    lieu: optionalText(body.lieu, 'lieu', 200),
    description: optionalText(body.description, 'description', 10000),
    commentaire: optionalText(body.commentaire, 'commentaire', 10000),
    cloudinaryPublicId: optionalText(body.cloudinaryPublicId, 'cloudinaryPublicId', 500),
    cloudinaryUrl: optionalText(body.cloudinaryUrl, 'cloudinaryUrl', 2000),
  }
}
