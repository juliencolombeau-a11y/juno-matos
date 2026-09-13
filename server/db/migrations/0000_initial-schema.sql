CREATE TABLE `ages` (
	`id` text PRIMARY KEY NOT NULL,
	`nom` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ages_nom_unique` ON `ages` (`nom`);--> statement-breakpoint
CREATE TABLE `domaines` (
	`id` text PRIMARY KEY NOT NULL,
	`nom` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `domaines_nom_unique` ON `domaines` (`nom`);--> statement-breakpoint
CREATE TABLE `lieux` (
	`id` integer PRIMARY KEY NOT NULL,
	`nom` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lieux_nom_unique` ON `lieux` (`nom`);--> statement-breakpoint
CREATE TABLE `materials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`legacy_id` integer,
	`nom` text NOT NULL,
	`domaine` text,
	`type` text,
	`theme` text,
	`age_min` integer,
	`nbre_min` integer,
	`nbre_max` integer,
	`cloudinary_public_id` text,
	`cloudinary_url` text,
	`lieu` text,
	`description` text,
	`commentaire` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `materials_legacy_id_unique` ON `materials` (`legacy_id`);--> statement-breakpoint
CREATE INDEX `materials_nom_idx` ON `materials` (`nom`);--> statement-breakpoint
CREATE INDEX `materials_domaine_idx` ON `materials` (`domaine`);--> statement-breakpoint
CREATE INDEX `materials_type_idx` ON `materials` (`type`);--> statement-breakpoint
CREATE INDEX `materials_theme_idx` ON `materials` (`theme`);--> statement-breakpoint
CREATE INDEX `materials_lieu_idx` ON `materials` (`lieu`);--> statement-breakpoint
CREATE TABLE `themes` (
	`id` text PRIMARY KEY NOT NULL,
	`nom` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `themes_nom_unique` ON `themes` (`nom`);--> statement-breakpoint
CREATE TABLE `types` (
	`id` text PRIMARY KEY NOT NULL,
	`nom` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `types_nom_unique` ON `types` (`nom`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'editor' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);