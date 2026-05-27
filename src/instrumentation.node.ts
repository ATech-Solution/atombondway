export async function runMigrations() {
  try {
    const { getPayload } = await import('payload')
    const { default: config } = await import('@payload-config')
    const payload = await getPayload({ config })
    await payload.db.migrate()
    payload.logger.info({ msg: '[startup] DB migrations complete' })
  } catch (err) {
    console.error('[startup] DB migration failed — tables may be missing:', err)
  }
}
