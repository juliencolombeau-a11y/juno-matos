import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const materials = sqliteTable(
  'materials',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    legacyId: integer('legacy_id'),
    nom: text('nom').notNull(),
    domaine: text('domaine'),
    type: text('type'),
    theme: text('theme'),
    ageMin: integer('age_min'),
    nbreMin: integer('nbre_min'),
    nbreMax: integer('nbre_max'),
    sourceImageUrl: text('source_image_url'),
    cloudinaryPublicId: text('cloudinary_public_id'),
    cloudinaryUrl: text('cloudinary_url'),
    lieu: text('lieu'),
    description: text('description'),
    commentaire: text('commentaire'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    legacyIdUnique: uniqueIndex('materials_legacy_id_unique').on(table.legacyId),
    nomIndex: index('materials_nom_idx').on(table.nom),
    domaineIndex: index('materials_domaine_idx').on(table.domaine),
    typeIndex: index('materials_type_idx').on(table.type),
    themeIndex: index('materials_theme_idx').on(table.theme),
    lieuIndex: index('materials_lieu_idx').on(table.lieu),
  }),
)

export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: text('role', { enum: ['admin', 'editor'] }).notNull().default('editor'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex('users_email_unique').on(table.email),
  }),
)

export const domaines = sqliteTable(
  'domaines',
  {
    id: text('id').primaryKey(),
    nom: text('nom').notNull(),
  },
  (table) => ({
    nomUnique: uniqueIndex('domaines_nom_unique').on(table.nom),
  }),
)

export const types = sqliteTable(
  'types',
  {
    id: text('id').primaryKey(),
    nom: text('nom').notNull(),
  },
  (table) => ({
    nomUnique: uniqueIndex('types_nom_unique').on(table.nom),
  }),
)

export const themes = sqliteTable(
  'themes',
  {
    id: text('id').primaryKey(),
    nom: text('nom').notNull(),
  },
  (table) => ({
    nomUnique: uniqueIndex('themes_nom_unique').on(table.nom),
  }),
)

export const lieux = sqliteTable(
  'lieux',
  {
    id: integer('id').primaryKey(),
    nom: text('nom').notNull(),
  },
  (table) => ({
    nomUnique: uniqueIndex('lieux_nom_unique').on(table.nom),
  }),
)

export const ages = sqliteTable(
  'ages',
  {
    id: text('id').primaryKey(),
    nom: integer('nom').notNull(),
  },
  (table) => ({
    nomUnique: uniqueIndex('ages_nom_unique').on(table.nom),
  }),
)
