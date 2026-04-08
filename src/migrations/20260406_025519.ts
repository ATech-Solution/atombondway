import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
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
//   await db.run(sql`CREATE INDEX \`about_page_meta_meta_og_image_idx\` ON \`about_page\` (\`meta_og_image_id\`);`)
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
  await db.run(sql`CREATE TABLE \`home_page_featured_category_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`category_slug\` text,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_featured_category_links_order_idx\` ON \`home_page_featured_category_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_featured_category_links_parent_id_idx\` ON \`home_page_featured_category_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_featured_category_links_image_idx\` ON \`home_page_featured_category_links\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_featured_category_links_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_featured_category_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`home_page_featured_category_links_locales_locale_parent_id_unique\` ON \`home_page_featured_category_links_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`projects_cta_href\` text DEFAULT '/projects',
  	\`featured_products_mode\` text DEFAULT 'featured_products',
  	\`meta_og_image_id\` integer,
  	\`meta_no_index\` integer DEFAULT false,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`meta_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_meta_meta_og_image_idx\` ON \`home_page\` (\`meta_og_image_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_locales\` (
  	\`projects_section_label\` text DEFAULT 'WHAT WE DO',
  	\`projects_section_title\` text DEFAULT 'RECENT PROJECTS',
  	\`projects_cta_text\` text DEFAULT 'VIEW MORE',
  	\`featured_products_title\` text DEFAULT 'OUR FEATURED PRODUCTS',
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_keywords\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`home_page_locales_locale_parent_id_unique\` ON \`home_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_services_page_locales\` (
  	\`page_title\` text DEFAULT 'Our Services',
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
  await db.run(sql`INSERT INTO \`__new_services_page_locales\`("page_title", "page_subtitle", "meta_title", "meta_description", "meta_keywords", "id", "_locale", "_parent_id") SELECT "page_title", "page_subtitle", "meta_title", "meta_description", "meta_keywords", "id", "_locale", "_parent_id" FROM \`services_page_locales\`;`)
  await db.run(sql`DROP TABLE \`services_page_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new_services_page_locales\` RENAME TO \`services_page_locales\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`services_page_locales_locale_parent_id_unique\` ON \`services_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`projects\` ADD \`project_category_id\` integer REFERENCES project_categories(id);`)
  await db.run(sql`ALTER TABLE \`projects\` ADD \`material_supplied\` text;`)
  await db.run(sql`CREATE INDEX \`projects_project_category_idx\` ON \`projects\` (\`project_category_id\`);`)
  await db.run(sql`ALTER TABLE \`projects_locales\` ADD \`architect\` text;`)
  await db.run(sql`ALTER TABLE \`projects_locales\` ADD \`developer\` text;`)
  await db.run(sql`ALTER TABLE \`projects_locales\` ADD \`building_type\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`product_category_id\` integer REFERENCES product_categories(id);`)
  await db.run(sql`CREATE INDEX \`products_product_category_idx\` ON \`products\` (\`product_category_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`project_categories_id\` integer REFERENCES project_categories(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`product_categories_id\` integer REFERENCES product_categories(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_project_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`project_categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_product_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`product_categories_id\`);`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`noindex\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`services_page\` ADD \`use_static_content\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`footer_settings_locales\` DROP COLUMN \`contact_text\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`project_categories\`;`)
  await db.run(sql`DROP TABLE \`project_categories_locales\`;`)
  await db.run(sql`DROP TABLE \`product_categories\`;`)
  await db.run(sql`DROP TABLE \`product_categories_locales\`;`)
  await db.run(sql`DROP TABLE \`about_page_partners\`;`)
  await db.run(sql`DROP TABLE \`about_page\`;`)
  await db.run(sql`DROP TABLE \`about_page_locales\`;`)
  await db.run(sql`DROP TABLE \`home_page_featured_category_links\`;`)
  await db.run(sql`DROP TABLE \`home_page_featured_category_links_locales\`;`)
  await db.run(sql`DROP TABLE \`home_page\`;`)
  await db.run(sql`DROP TABLE \`home_page_locales\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_projects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`cover_image_id\` integer,
  	\`completion_date\` text,
  	\`featured\` integer DEFAULT false,
  	\`order\` numeric DEFAULT 0,
  	\`published_at\` text,
  	\`meta_og_image_id\` integer,
  	\`meta_no_index\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_projects\`("id", "slug", "cover_image_id", "completion_date", "featured", "order", "published_at", "meta_og_image_id", "meta_no_index", "updated_at", "created_at") SELECT "id", "slug", "cover_image_id", "completion_date", "featured", "order", "published_at", "meta_og_image_id", "meta_no_index", "updated_at", "created_at" FROM \`projects\`;`)
  await db.run(sql`DROP TABLE \`projects\`;`)
  await db.run(sql`ALTER TABLE \`__new_projects\` RENAME TO \`projects\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
//   await db.run(sql`CREATE UNIQUE INDEX \`projects_slug_idx\` ON \`projects\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`projects_cover_image_idx\` ON \`projects\` (\`cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_meta_meta_og_image_idx\` ON \`projects\` (\`meta_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_updated_at_idx\` ON \`projects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`projects_created_at_idx\` ON \`projects\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_products\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`image_id\` integer,
  	\`category_slug\` text,
  	\`featured\` integer DEFAULT false,
  	\`order\` numeric DEFAULT 0,
  	\`meta_og_image_id\` integer,
  	\`meta_no_index\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_products\`("id", "slug", "image_id", "category_slug", "featured", "order", "meta_og_image_id", "meta_no_index", "updated_at", "created_at") SELECT "id", "slug", "image_id", "category_slug", "featured", "order", "meta_og_image_id", "meta_no_index", "updated_at", "created_at" FROM \`products\`;`)
  await db.run(sql`DROP TABLE \`products\`;`)
  await db.run(sql`ALTER TABLE \`__new_products\` RENAME TO \`products\`;`)
//   await db.run(sql`CREATE UNIQUE INDEX \`products_slug_idx\` ON \`products\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`products_image_idx\` ON \`products\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`products_meta_meta_og_image_idx\` ON \`products\` (\`meta_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`products_updated_at_idx\` ON \`products\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`products_created_at_idx\` ON \`products\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`projects_id\` integer,
  	\`products_id\` integer,
  	\`services_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`services_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "projects_id", "products_id", "services_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "projects_id", "products_id", "services_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_projects_id_idx\` ON \`payload_locked_documents_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_products_id_idx\` ON \`payload_locked_documents_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_services_id_idx\` ON \`payload_locked_documents_rels\` (\`services_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_services_page_locales\` (
  	\`page_title\` text DEFAULT 'Our Services' NOT NULL,
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
  await db.run(sql`INSERT INTO \`__new_services_page_locales\`("page_title", "page_subtitle", "meta_title", "meta_description", "meta_keywords", "id", "_locale", "_parent_id") SELECT "page_title", "page_subtitle", "meta_title", "meta_description", "meta_keywords", "id", "_locale", "_parent_id" FROM \`services_page_locales\`;`)
  await db.run(sql`DROP TABLE \`services_page_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new_services_page_locales\` RENAME TO \`services_page_locales\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`services_page_locales_locale_parent_id_unique\` ON \`services_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`footer_settings_locales\` ADD \`contact_text\` text;`)
  await db.run(sql`ALTER TABLE \`projects_locales\` DROP COLUMN \`architect\`;`)
  await db.run(sql`ALTER TABLE \`projects_locales\` DROP COLUMN \`developer\`;`)
  await db.run(sql`ALTER TABLE \`projects_locales\` DROP COLUMN \`building_type\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`noindex\`;`)
  await db.run(sql`ALTER TABLE \`services_page\` DROP COLUMN \`use_static_content\`;`)
}
