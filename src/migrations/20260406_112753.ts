import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`services_page_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`services_page\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
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
  await db.run(sql`CREATE UNIQUE INDEX \`services_page_locales_locale_parent_id_unique\` ON \`services_page_locales\` (\`_locale\`,\`_parent_id\`);`)
}
