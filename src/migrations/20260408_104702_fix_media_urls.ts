import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Update media URLs to use static paths instead of API paths
  await db.run(sql`UPDATE media SET url = REPLACE(url, '/api/media/file/', '/media/') WHERE url LIKE '/api/media/file/%'`)
  await db.run(sql`UPDATE media SET sizes_thumbnail_url = REPLACE(sizes_thumbnail_url, '/api/media/file/', '/media/') WHERE sizes_thumbnail_url LIKE '/api/media/file/%'`)
  await db.run(sql`UPDATE media SET sizes_card_url = REPLACE(sizes_card_url, '/api/media/file/', '/media/') WHERE sizes_card_url LIKE '/api/media/file/%'`)
  await db.run(sql`UPDATE media SET sizes_hero_url = REPLACE(sizes_hero_url, '/api/media/file/', '/media/') WHERE sizes_hero_url LIKE '/api/media/file/%'`)
  await db.run(sql`UPDATE media SET sizes_og_url = REPLACE(sizes_og_url, '/api/media/file/', '/media/') WHERE sizes_og_url LIKE '/api/media/file/%'`)

  // Also handle absolute URLs
  await db.run(sql`UPDATE media SET url = REPLACE(url, 'http://localhost:3000/api/media/file/', '/media/') WHERE url LIKE 'http://localhost:3000/api/media/file/%'`)
  await db.run(sql`UPDATE media SET sizes_thumbnail_url = REPLACE(sizes_thumbnail_url, 'http://localhost:3000/api/media/file/', '/media/') WHERE sizes_thumbnail_url LIKE 'http://localhost:3000/api/media/file/%'`)
  await db.run(sql`UPDATE media SET sizes_card_url = REPLACE(sizes_card_url, 'http://localhost:3000/api/media/file/', '/media/') WHERE sizes_card_url LIKE 'http://localhost:3000/api/media/file/%'`)
  await db.run(sql`UPDATE media SET sizes_hero_url = REPLACE(sizes_hero_url, 'http://localhost:3000/api/media/file/', '/media/') WHERE sizes_hero_url LIKE 'http://localhost:3000/api/media/file/%'`)
  await db.run(sql`UPDATE media SET sizes_og_url = REPLACE(sizes_og_url, 'http://localhost:3000/api/media/file/', '/media/') WHERE sizes_og_url LIKE 'http://localhost:3000/api/media/file/%'`)

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`services_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`meta_og_image_id\` integer,
  	\`meta_no_index\` integer DEFAULT false,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`meta_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`services_page_meta_meta_og_image_idx\` ON \`services_page\` (\`meta_og_image_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`services_page_locales\` (
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
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`services_page_locales_locale_parent_id_unique\` ON \`services_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  try { await db.run(sql`ALTER TABLE \`site_settings\` ADD \`sticky_header\` integer DEFAULT false;`) } catch {}
  try { await db.run(sql`ALTER TABLE \`hero_content\` DROP COLUMN \`cta_secondary_href\`;`) } catch {}
  try { await db.run(sql`ALTER TABLE \`hero_content_locales\` DROP COLUMN \`cta_secondary_text\`;`) } catch {}
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`services_page\`;`)
  await db.run(sql`DROP TABLE \`services_page_locales\`;`)
  await db.run(sql`ALTER TABLE \`hero_content\` ADD \`cta_secondary_href\` text;`)
  await db.run(sql`ALTER TABLE \`hero_content_locales\` ADD \`cta_secondary_text\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`sticky_header\`;`)
}
