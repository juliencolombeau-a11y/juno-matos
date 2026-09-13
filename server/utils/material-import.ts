import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type * as XlsxTypes from 'xlsx'
// SheetJS 0.18.5 does not publish declarations for its ESM entry point.
// @ts-expect-error The runtime ESM entry point is valid and avoids the Windows C:\ import bug.
import * as XLSX from 'xlsx/xlsx.mjs'
import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

type ImportRow = Record<string, unknown>

export interface ImportSummary {
  materialsCreated: number
  materialsUpdated: number
  referencesCreated: number
  rowsSkipped: number
}

function asText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null
  }

  const textValue = String(value).trim()
  return textValue.length > 0 ? textValue : null
}

function asInteger(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const numberValue = Number(value)
  return Number.isInteger(numberValue) ? numberValue : null
}

function readRows(workbook: XlsxTypes.WorkBook, sheetName: string): ImportRow[] {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    throw createError({
      statusCode: 422,
      statusMessage: `La feuille "${sheetName}" est introuvable.`,
    })
  }

  return XLSX.utils.sheet_to_json<ImportRow>(sheet, { defval: null })
}

async function insertReferences(workbook: XLSX.WorkBook): Promise<number> {
  let referencesCreated = 0

  const domaines = readRows(workbook, 'domaine')
  for (const row of domaines) {
    const id = asText(row.id)
    const nom = asText(row.nom)
    if (!id || !nom) {
      continue
    }

    const result = await db
      .insert(schema.domaines)
      .values({ id, nom })
      .onConflictDoNothing()
    referencesCreated += result.rowsAffected
  }

  const types = readRows(workbook, 'type')
  for (const row of types) {
    const id = asText(row.id)
    const nom = asText(row.nom)
    if (!id || !nom) {
      continue
    }

    const result = await db
      .insert(schema.types)
      .values({ id, nom })
      .onConflictDoNothing()
    referencesCreated += result.rowsAffected
  }

  const themes = readRows(workbook, 'theme')
  for (const row of themes) {
    const id = asText(row.id) ?? asText(row.nom)
    const nom = asText(row.nom)
    if (!id || !nom) {
      continue
    }

    const result = await db
      .insert(schema.themes)
      .values({ id, nom })
      .onConflictDoNothing()
    referencesCreated += result.rowsAffected
  }

  const lieux = readRows(workbook, 'lieu')
  for (const row of lieux) {
    const id = asInteger(row.id)
    const nom = asText(row.nom)
    if (id === null || !nom) {
      continue
    }

    const result = await db
      .insert(schema.lieux)
      .values({ id, nom })
      .onConflictDoNothing()
    referencesCreated += result.rowsAffected
  }

  const ages = readRows(workbook, 'age')
  for (const row of ages) {
    const id = asText(row.id)
    const nom = asInteger(row.nom)
    if (!id || nom === null) {
      continue
    }

    const result = await db
      .insert(schema.ages)
      .values({ id, nom })
      .onConflictDoNothing()
    referencesCreated += result.rowsAffected
  }

  return referencesCreated
}

export async function importMaterialsFromWorkbook(
  workbookPath = resolve(process.cwd(), 'MatosPeda.xlsx'),
): Promise<ImportSummary> {
  const workbook = XLSX.read(await readFile(workbookPath), { type: 'buffer' }) as XlsxTypes.WorkBook
  const materialRows = readRows(workbook, 'matos')
  const referencesCreated = await insertReferences(workbook)
  const now = new Date()

  let materialsCreated = 0
  let materialsUpdated = 0
  let rowsSkipped = 0

  for (const row of materialRows) {
    const legacyId = asInteger(row.id)
    const nom = asText(row.nom)
    if (legacyId === null || !nom) {
      rowsSkipped += 1
      continue
    }

    const values = {
      legacyId,
      nom,
      domaine: asText(row.domaine),
      type: asText(row.type),
      theme: asText(row.theme),
      ageMin: asInteger(row.ageMin),
      nbreMin: asInteger(row.nbreMin),
      nbreMax: asInteger(row.nbreMax),
      sourceImageUrl: asText(row.imgurl),
      lieu: asText(row.lieu),
      description: asText(row.description),
      updatedAt: now,
    }

    const existing = await db
      .select({ id: schema.materials.id })
      .from(schema.materials)
      .where(eq(schema.materials.legacyId, legacyId))
      .limit(1)

    if (existing[0]) {
      await db
        .update(schema.materials)
        .set(values)
        .where(eq(schema.materials.id, existing[0].id))
      materialsUpdated += 1
      continue
    }

    await db.insert(schema.materials).values({
      ...values,
      createdAt: now,
    })
    materialsCreated += 1
  }

  return {
    materialsCreated,
    materialsUpdated,
    referencesCreated,
    rowsSkipped,
  }
}
