import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text DEFAULT 'editor' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`_verified\` integer,
  	\`_verificationtoken\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumbnail_url\` text,
  	\`sizes_thumbnail_width\` numeric,
  	\`sizes_thumbnail_height\` numeric,
  	\`sizes_thumbnail_mime_type\` text,
  	\`sizes_thumbnail_filesize\` numeric,
  	\`sizes_thumbnail_filename\` text,
  	\`sizes_card_url\` text,
  	\`sizes_card_width\` numeric,
  	\`sizes_card_height\` numeric,
  	\`sizes_card_mime_type\` text,
  	\`sizes_card_filesize\` numeric,
  	\`sizes_card_filename\` text,
  	\`sizes_hero_url\` text,
  	\`sizes_hero_width\` numeric,
  	\`sizes_hero_height\` numeric,
  	\`sizes_hero_mime_type\` text,
  	\`sizes_hero_filesize\` numeric,
  	\`sizes_hero_filename\` text,
  	\`sizes_og_url\` text,
  	\`sizes_og_width\` numeric,
  	\`sizes_og_height\` numeric,
  	\`sizes_og_mime_type\` text,
  	\`sizes_og_filesize\` numeric,
  	\`sizes_og_filename\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`media\` (\`sizes_thumbnail_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_card_sizes_card_filename_idx\` ON \`media\` (\`sizes_card_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_hero_sizes_hero_filename_idx\` ON \`media\` (\`sizes_hero_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_og_sizes_og_filename_idx\` ON \`media\` (\`sizes_og_filename\`);`)
  await db.run(sql`CREATE TABLE \`media_locales\` (
  	\`alt\` text,
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`media_locales_locale_parent_id_unique\` ON \`media_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_gallery_order_idx\` ON \`projects_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_gallery_parent_id_idx\` ON \`projects_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_gallery_image_idx\` ON \`projects_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`projects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`cover_image_id\` integer,
  	\`project_category_id\` integer,
  	\`material_supplied\` text,
  	\`completion_date\` text,
  	\`featured\` integer DEFAULT false,
  	\`order\` numeric DEFAULT 0,
  	\`published_at\` text,
  	\`meta_og_image_id\` integer,
  	\`meta_no_index\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`project_category_id\`) REFERENCES \`project_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_slug_idx\` ON \`projects\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`projects_cover_image_idx\` ON \`projects\` (\`cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_project_category_idx\` ON \`projects\` (\`project_category_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_meta_meta_og_image_idx\` ON \`projects\` (\`meta_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_updated_at_idx\` ON \`projects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`projects_created_at_idx\` ON \`projects\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`projects_locales\` (
  	\`title\` text NOT NULL,
  	\`summary\` text,
  	\`description\` text,
  	\`architect\` text,
  	\`developer\` text,
  	\`building_type\` text,
  	\`location\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_keywords\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_locales_locale_parent_id_unique\` ON \`projects_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`project_categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`project_categories_slug_idx\` ON \`project_categories\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`project_categories_image_idx\` ON \`project_categories\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`project_categories_updated_at_idx\` ON \`project_categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`project_categories_created_at_idx\` ON \`project_categories\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`project_categories_locales\` (
  	\`title\` text NOT NULL,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`project_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`project_categories_locales_locale_parent_id_unique\` ON \`project_categories_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_gallery_order_idx\` ON \`products_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_gallery_parent_id_idx\` ON \`products_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_gallery_image_idx\` ON \`products_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`products\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`image_id\` integer,
  	\`product_category_id\` integer,
  	\`featured\` integer DEFAULT false,
  	\`order\` numeric DEFAULT 0,
  	\`meta_og_image_id\` integer,
  	\`meta_no_index\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`product_category_id\`) REFERENCES \`product_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_slug_idx\` ON \`products\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`products_image_idx\` ON \`products\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`products_product_category_idx\` ON \`products\` (\`product_category_id\`);`)
  await db.run(sql`CREATE INDEX \`products_meta_meta_og_image_idx\` ON \`products\` (\`meta_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`products_updated_at_idx\` ON \`products\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`products_created_at_idx\` ON \`products\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`products_locales\` (
  	\`name\` text NOT NULL,
  	\`tagline\` text,
  	\`description\` text,
  	\`subcategory\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_keywords\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_locales_locale_parent_id_unique\` ON \`products_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`product_categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`product_categories_slug_idx\` ON \`product_categories\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`product_categories_image_idx\` ON \`product_categories\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`product_categories_updated_at_idx\` ON \`product_categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`product_categories_created_at_idx\` ON \`product_categories\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`product_categories_locales\` (
  	\`title\` text NOT NULL,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`product_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`product_categories_locales_locale_parent_id_unique\` ON \`product_categories_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`plugins\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`description\` text,
  	\`version\` text DEFAULT '1.0.0',
  	\`status\` text DEFAULT 'inactive' NOT NULL,
  	\`config\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`plugins_slug_idx\` ON \`plugins\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`plugins_updated_at_idx\` ON \`plugins\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`plugins_created_at_idx\` ON \`plugins\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`projects_id\` integer,
  	\`project_categories_id\` integer,
  	\`products_id\` integer,
  	\`product_categories_id\` integer,
  	\`plugins_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`project_categories_id\`) REFERENCES \`project_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`product_categories_id\`) REFERENCES \`product_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`plugins_id\`) REFERENCES \`plugins\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_projects_id_idx\` ON \`payload_locked_documents_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_project_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`project_categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_products_id_idx\` ON \`payload_locked_documents_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_product_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`product_categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_plugins_id_idx\` ON \`payload_locked_documents_rels\` (\`plugins_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`domain\` text,
  	\`logo_id\` integer,
  	\`logo_light_id\` integer,
  	\`favicon_id\` integer,
  	\`default_meta_og_image_id\` integer,
  	\`sticky_header\` integer DEFAULT false,
  	\`noindex\` integer DEFAULT false,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`logo_light_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`favicon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`default_meta_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_logo_idx\` ON \`site_settings\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_logo_light_idx\` ON \`site_settings\` (\`logo_light_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_favicon_idx\` ON \`site_settings\` (\`favicon_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_default_meta_default_meta_og_image_idx\` ON \`site_settings\` (\`default_meta_og_image_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_locales\` (
  	\`company_name\` text DEFAULT 'Company Name' NOT NULL,
  	\`default_meta_title\` text,
  	\`default_meta_description\` text,
  	\`default_meta_keywords\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`site_settings_locales_locale_parent_id_unique\` ON \`site_settings_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_items_children\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`href\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`navigation_items_children_order_idx\` ON \`navigation_items_children\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`navigation_items_children_parent_id_idx\` ON \`navigation_items_children\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_items_children_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation_items_children\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`navigation_items_children_locales_locale_parent_id_unique\` ON \`navigation_items_children_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`href\` text NOT NULL,
  	\`open_in_new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`navigation_items_order_idx\` ON \`navigation_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`navigation_items_parent_id_idx\` ON \`navigation_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_items_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`navigation_items_locales_locale_parent_id_unique\` ON \`navigation_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`home_page_featured_category_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`category_slug_id\` integer,
  	FOREIGN KEY (\`category_slug_id\`) REFERENCES \`product_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_featured_category_links_order_idx\` ON \`home_page_featured_category_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_featured_category_links_parent_id_idx\` ON \`home_page_featured_category_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_featured_category_links_category_slug_idx\` ON \`home_page_featured_category_links\` (\`category_slug_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_featured_category_links_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_featured_category_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`home_page_featured_category_links_locales_locale_parent_id_unique\` ON \`home_page_featured_category_links_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_services_section_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`services_section_highlights_title\` text NOT NULL,
  	\`services_section_highlights_description\` text,
  	\`services_section_highlights_image_id\` integer,
  	FOREIGN KEY (\`services_section_highlights_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_services_section_highlights_order_idx\` ON \`home_page_services_section_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_services_section_highlights_parent_id_idx\` ON \`home_page_services_section_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_services_section_highlights_locale_idx\` ON \`home_page_services_section_highlights\` (\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`home_page_services_section_highlights_services_section_highlights_image_idx\` ON \`home_page_services_section_highlights\` (\`services_section_highlights_image_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_section_cta_href\` text DEFAULT '/about',
  	\`hero_sectionbackground_image_id\` integer,
  	\`hero_sectionoverlay_opacity\` numeric DEFAULT 50,
  	\`projects_cta_href\` text DEFAULT '/projects',
  	\`featured_products_mode\` text DEFAULT 'featured_products',
  	\`services_section_cta_href\` text DEFAULT '/services',
  	\`about_section_cta_href\` text DEFAULT '/about',
  	\`seo_og_image_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_sectionbackground_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_hero_sectionbackground_image_idx\` ON \`home_page\` (\`hero_sectionbackground_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_seo_og_image_idx\` ON \`home_page\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_locales\` (
  	\`hero_section_title\` text DEFAULT 'WE SEAL THE SUCCESS OF HONG KONG',
  	\`hero_section_body\` text,
  	\`hero_section_cta_text\` text DEFAULT 'TELL ME MORE',
  	\`projects_section_label\` text DEFAULT 'WHAT WE DO',
  	\`projects_section_title\` text DEFAULT 'RECENT PROJECTS',
  	\`projects_cta_text\` text DEFAULT 'VIEW MORE',
  	\`featured_products_title\` text DEFAULT 'OUR FEATURED PRODUCTS',
  	\`services_section_title\` text DEFAULT 'OUR SERVICES',
  	\`services_section_cta_text\` text DEFAULT 'VIEW MORE',
  	\`about_section_title\` text DEFAULT 'ABOUT US',
  	\`about_section_body\` text,
  	\`about_section_cta_text\` text DEFAULT 'VIEW MORE',
  	\`seo_title\` text,
  	\`seo_description\` text,
  	\`seo_keywords\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`home_page_locales_locale_parent_id_unique\` ON \`home_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`meta_og_image_id\` integer,
  	\`meta_no_index\` integer DEFAULT false,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`meta_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`products_page_meta_meta_og_image_idx\` ON \`products_page\` (\`meta_og_image_id\`);`)
  await db.run(sql`CREATE TABLE \`products_page_locales\` (
  	\`page_title\` text DEFAULT 'Our Products' NOT NULL,
  	\`page_subtitle\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_keywords\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_page_locales_locale_parent_id_unique\` ON \`products_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`meta_og_image_id\` integer,
  	\`meta_no_index\` integer DEFAULT false,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`meta_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_page_meta_meta_og_image_idx\` ON \`projects_page\` (\`meta_og_image_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_page_locales\` (
  	\`page_title\` text DEFAULT 'Our Projects' NOT NULL,
  	\`page_subtitle\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_keywords\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_page_locales_locale_parent_id_unique\` ON \`projects_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`services_page_values\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`logo_id\` integer,
  	\`description\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`services_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_page_values_order_idx\` ON \`services_page_values\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_page_values_parent_id_idx\` ON \`services_page_values\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`services_page_values_locale_idx\` ON \`services_page_values\` (\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`services_page_values_logo_idx\` ON \`services_page_values\` (\`logo_id\`);`)
  await db.run(sql`CREATE TABLE \`services_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`meta_og_image_id\` integer,
  	\`meta_no_index\` integer DEFAULT false,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`meta_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`services_page_meta_meta_og_image_idx\` ON \`services_page\` (\`meta_og_image_id\`);`)
  await db.run(sql`CREATE TABLE \`services_page_locales\` (
  	\`page_title\` text DEFAULT 'Who We Are',
  	\`page_subtitle\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_keywords\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`services_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`services_page_locales_locale_parent_id_unique\` ON \`services_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page_partners\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`logo_id\` integer,
  	\`logo_url\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_partners_order_idx\` ON \`about_page_partners\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_partners_parent_id_idx\` ON \`about_page_partners\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_partners_logo_idx\` ON \`about_page_partners\` (\`logo_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`meta_og_image_id\` integer,
  	\`meta_no_index\` integer DEFAULT false,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`meta_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_meta_meta_og_image_idx\` ON \`about_page\` (\`meta_og_image_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page_locales\` (
  	\`page_title\` text DEFAULT 'About Atom Bondway',
  	\`page_body\` text,
  	\`vision_title\` text DEFAULT 'Vision',
  	\`vision_body\` text,
  	\`mission_title\` text DEFAULT 'Mission',
  	\`mission_body\` text,
  	\`partners_title\` text DEFAULT 'Partners',
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_keywords\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`about_page_locales_locale_parent_id_unique\` ON \`about_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`footer_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`email\` text,
  	\`phone\` text,
  	\`fax\` text,
  	\`map_embed_url\` text,
  	\`show_contact_info\` integer DEFAULT true,
  	\`show_back_to_top\` integer DEFAULT true,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`footer_settings_locales\` (
  	\`title\` text,
  	\`address\` text,
  	\`business_hours\` text,
  	\`copyright_text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`footer_settings_locales_locale_parent_id_unique\` ON \`footer_settings_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`custom_css\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`css\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`media_locales\`;`)
  await db.run(sql`DROP TABLE \`projects_gallery\`;`)
  await db.run(sql`DROP TABLE \`projects\`;`)
  await db.run(sql`DROP TABLE \`projects_locales\`;`)
  await db.run(sql`DROP TABLE \`project_categories\`;`)
  await db.run(sql`DROP TABLE \`project_categories_locales\`;`)
  await db.run(sql`DROP TABLE \`products_gallery\`;`)
  await db.run(sql`DROP TABLE \`products\`;`)
  await db.run(sql`DROP TABLE \`products_locales\`;`)
  await db.run(sql`DROP TABLE \`product_categories\`;`)
  await db.run(sql`DROP TABLE \`product_categories_locales\`;`)
  await db.run(sql`DROP TABLE \`plugins\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings_locales\`;`)
  await db.run(sql`DROP TABLE \`navigation_items_children\`;`)
  await db.run(sql`DROP TABLE \`navigation_items_children_locales\`;`)
  await db.run(sql`DROP TABLE \`navigation_items\`;`)
  await db.run(sql`DROP TABLE \`navigation_items_locales\`;`)
  await db.run(sql`DROP TABLE \`navigation\`;`)
  await db.run(sql`DROP TABLE \`home_page_featured_category_links\`;`)
  await db.run(sql`DROP TABLE \`home_page_featured_category_links_locales\`;`)
  await db.run(sql`DROP TABLE \`home_page_services_section_highlights\`;`)
  await db.run(sql`DROP TABLE \`home_page\`;`)
  await db.run(sql`DROP TABLE \`home_page_locales\`;`)
  await db.run(sql`DROP TABLE \`products_page\`;`)
  await db.run(sql`DROP TABLE \`products_page_locales\`;`)
  await db.run(sql`DROP TABLE \`projects_page\`;`)
  await db.run(sql`DROP TABLE \`projects_page_locales\`;`)
  await db.run(sql`DROP TABLE \`services_page_values\`;`)
  await db.run(sql`DROP TABLE \`services_page\`;`)
  await db.run(sql`DROP TABLE \`services_page_locales\`;`)
  await db.run(sql`DROP TABLE \`about_page_partners\`;`)
  await db.run(sql`DROP TABLE \`about_page\`;`)
  await db.run(sql`DROP TABLE \`about_page_locales\`;`)
  await db.run(sql`DROP TABLE \`footer_settings\`;`)
  await db.run(sql`DROP TABLE \`footer_settings_locales\`;`)
  await db.run(sql`DROP TABLE \`custom_css\`;`)
}
