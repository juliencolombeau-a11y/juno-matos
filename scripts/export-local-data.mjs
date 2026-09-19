import { mkdir, writeFile } from 'node:fs/promises'
import { createClient } from '@libsql/client'

const client = createClient({ url: 'file:.data/db/sqlite.db' })
const outputPath = '.data/d1-data.sql'

const tables = [
  {
    name: 'domaines',
    columns: ['id', 'nom'],
  },
  {
    name: 'types',
    columns: ['id', 'nom'],
  },
  {
    name: 'themes',
    columns: ['id', 'nom'],
  },
  {
    name: 'lieux',
    columns: ['id', 'nom'],
  },
  {
    name: 'ages',
    columns: ['id', 'nom'],
  },
  {
    name: 'materials',
    columns: [
      'id',
      'legacy_id',
      'nom',
      'domaine',
      'type',
      'theme',
      'age_min',
      'nbre_min',
      'nbre_max',
      'source_image_url',
      'cloudinary_public_id',
      'cloudinary_url',
      'lieu',
      'description',
      'commentaire',
      'created_at',
      'updated_at',
    ],
  },
  {
    name: 'users',
    columns: ['id', 'email', 'password_hash', 'role', 'created_at', 'updated_at'],
  },
]

function quote(value) {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'number' || typeof value === 'bigint') return String(value)
  return `'${String(value).replaceAll("'", "''")}'`
}

const statements = [
  '-- Generated from the local NuxtHub SQLite database.',
  'PRAGMA foreign_keys = OFF;',
]

for (const table of tables) {
  const result = await client.execute(`SELECT ${table.columns.join(', ')} FROM ${table.name}`)
  for (const row of result.rows) {
    const values = table.columns.map((column) => quote(row[column]))
    statements.push(
      `INSERT OR IGNORE INTO "${table.name}" (${table.columns.map((column) => `"${column}"`).join(', ')}) VALUES (${values.join(', ')});`,
    )
  }
}

statements.push('PRAGMA foreign_keys = ON;')
await mkdir('.data', { recursive: true })
await writeFile(outputPath, `${statements.join('\n')}\n`, 'utf8')
await client.close()

console.log(`Exported local data to ${outputPath}`)
