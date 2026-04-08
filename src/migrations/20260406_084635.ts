import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {

  await db.run(sql`PRAGMA foreign_keys = OFF`)

  // ── 1. Recreate home_page (can't DROP COLUMN on FK columns in SQLite) ──
  await db.run(sql`CREATE TABLE \`home_page_new\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`projects_cta_href\` text,
    \`featured_products_mode\` text DEFAULT 'featured_products',
    \`meta_og_image_id\` integer REFERENCES \`media\`(\`id\`) ON DELETE set null,
    \`meta_no_index\` integer DEFAULT 0,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  )`)
  await db.run(sql`INSERT INTO \`home_page_new\` (id, projects_cta_href, meta_og_image_id, meta_no_index, updated_at, created_at)
    SELECT id, projects_cta_href, meta_og_image_id, meta_no_index, updated_at, created_at FROM \`home_page\``)
  await db.run(sql`DROP TABLE \`home_page\``)
  await db.run(sql`ALTER TABLE \`home_page_new\` RENAME TO \`home_page\``)

  // ── 2. home_page_locales: drop old locale columns, add new one ──
  for (const col of [
    'hero_heading', 'hero_subheading', 'hero_cta_primary_text', 'hero_cta_secondary_text',
    'products_section_label', 'products_section_title', 'products_section_subtitle',
    'products_cta_text', 'services_section_title', 'services_section_subtitle',
    'services_cta_text', 'about_section_title', 'about_body', 'about_cta_text',
  ]) {
    await db.run(sql.raw(`ALTER TABLE \`home_page_locales\` DROP COLUMN \`${col}\``))
  }
  await db.run(sql`ALTER TABLE \`home_page_locales\` ADD COLUMN \`featured_products_title\` text`)

  // NOTE: home_page_featured_category_links tables are intentionally omitted here.
  // Payload's dev push creates them with the correct schema (text UUID primary key)
  // on first startup after this migration runs.

  // ── 4. footer_settings_locales: drop contact_text ──
  await db.run(sql`ALTER TABLE \`footer_settings_locales\` DROP COLUMN \`contact_text\``)

  // ── 5. site_settings: add noindex ──
  await db.run(sql`ALTER TABLE \`site_settings\` ADD COLUMN \`noindex\` integer DEFAULT 0`)

  // ── 6. services_page: add use_static_content ──
  await db.run(sql`ALTER TABLE \`services_page\` ADD COLUMN \`use_static_content\` integer DEFAULT 1`)

  // ── 7. product_categories collection ──
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`product_categories\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`slug\` text,
    \`image_id\` integer REFERENCES \`media\`(\`id\`) ON DELETE set null,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  )`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`product_categories_slug_idx\` ON \`product_categories\` (\`slug\`)`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`product_categories_updated_at_idx\` ON \`product_categories\` (\`updated_at\`)`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`product_categories_created_at_idx\` ON \`product_categories\` (\`created_at\`)`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`product_categories_locales\` (
    \`title\` text NOT NULL,
    \`description\` text,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` integer NOT NULL REFERENCES \`product_categories\`(\`id\`) ON DELETE cascade
  )`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`product_categories_locales_unique\` ON \`product_categories_locales\` (\`_locale\`, \`_parent_id\`)`)

  // ── 8. project_categories collection ──
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`project_categories\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`slug\` text,
    \`image_id\` integer REFERENCES \`media\`(\`id\`) ON DELETE set null,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  )`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`project_categories_slug_idx\` ON \`project_categories\` (\`slug\`)`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`project_categories_updated_at_idx\` ON \`project_categories\` (\`updated_at\`)`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`project_categories_created_at_idx\` ON \`project_categories\` (\`created_at\`)`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`project_categories_locales\` (
    \`title\` text NOT NULL,
    \`description\` text,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` integer NOT NULL REFERENCES \`project_categories\`(\`id\`) ON DELETE cascade
  )`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`project_categories_locales_unique\` ON \`project_categories_locales\` (\`_locale\`, \`_parent_id\`)`)

  // ── 9. products: add product_category_id (Payload derives column name from field name) ──
  await db.run(sql`ALTER TABLE \`products\` ADD COLUMN \`product_category_id\` integer REFERENCES \`product_categories\`(\`id\`) ON DELETE set null`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`products_product_category_idx\` ON \`products\` (\`product_category_id\`)`)

  // ── 10. projects: add project_category_id ──
  await db.run(sql`ALTER TABLE \`projects\` ADD COLUMN \`project_category_id\` integer REFERENCES \`project_categories\`(\`id\`) ON DELETE set null`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`projects_project_category_idx\` ON \`projects\` (\`project_category_id\`)`)

  // ── 11. about_page global ──
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`about_page\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`meta_og_image_id\` integer REFERENCES \`media\`(\`id\`) ON DELETE set null,
    \`meta_no_index\` integer DEFAULT 0,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  )`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`about_page_locales\` (
    \`page_title\` text,
    \`page_body\` text,
    \`vision_title\` text,
    \`vision_body\` text,
    \`mission_title\` text,
    \`mission_body\` text,
    \`partners_title\` text,
    \`meta_title\` text,
    \`meta_description\` text,
    \`meta_keywords\` text,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` integer NOT NULL REFERENCES \`about_page\`(\`id\`) ON DELETE cascade
  )`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`about_page_locales_unique\` ON \`about_page_locales\` (\`_locale\`, \`_parent_id\`)`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`about_page_partners\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL REFERENCES \`about_page\`(\`id\`) ON DELETE cascade,
    \`name\` text NOT NULL,
    \`logo_id\` integer REFERENCES \`media\`(\`id\`) ON DELETE set null,
    \`logo_url\` text
  )`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_page_partners_order_idx\` ON \`about_page_partners\` (\`_order\`)`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_page_partners_parent_idx\` ON \`about_page_partners\` (\`_parent_id\`)`)

  await db.run(sql`PRAGMA foreign_keys = ON`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys = OFF`)
  await db.run(sql`DROP TABLE IF EXISTS \`about_page_partners\``)
  await db.run(sql`DROP TABLE IF EXISTS \`about_page_locales\``)
  await db.run(sql`DROP TABLE IF EXISTS \`about_page\``)
  await db.run(sql`DROP TABLE IF EXISTS \`product_categories_locales\``)
  await db.run(sql`DROP TABLE IF EXISTS \`product_categories\``)
  await db.run(sql`DROP TABLE IF EXISTS \`project_categories_locales\``)
  await db.run(sql`DROP TABLE IF EXISTS \`project_categories\``)
  await db.run(sql`PRAGMA foreign_keys = ON`)
}
