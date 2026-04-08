import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Add relationship columns for the new category collections to payload_locked_documents_rels
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`project_categories_id\` integer REFERENCES \`project_categories\`(\`id\`) ON DELETE cascade`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`product_categories_id\` integer REFERENCES \`product_categories\`(\`id\`) ON DELETE cascade`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_project_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`project_categories_id\`)`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_product_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`product_categories_id\`)`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`payload_locked_documents_rels_project_categories_id_idx\``)
  await db.run(sql`DROP INDEX IF EXISTS \`payload_locked_documents_rels_product_categories_id_idx\``)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` DROP COLUMN \`project_categories_id\``)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` DROP COLUMN \`product_categories_id\``)
}
