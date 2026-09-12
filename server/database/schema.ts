import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const articles = sqliteTable('articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  cloudinaryPublicId: text('cloudinary_public_id').notNull() // Stocke l'ID de l'image Cloudinary
})