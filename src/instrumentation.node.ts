export async function runMigrations() {
  try {
    const { getPayload } = await import('payload')
    const { default: config } = await import('@payload-config')
    const payload = await getPayload({ config })
    await payload.db.migrate()
    payload.logger.info({ msg: '[startup] DB migrations complete' })
  } catch (err) {
    console.error('[startup] DB migration error (non-fatal):', err instanceof Error ? err.message : String(err))
  }
  // Verify DB is queryable — catches silent init failures before first request
  try {
    const { getPayload } = await import('payload')
    const { default: config } = await import('@payload-config')
    const payload = await getPayload({ config })
    const result = await payload.find({ collection: 'projects', limit: 0, depth: 0 })
    payload.logger.info({ msg: `[startup] DB health OK — projects table reachable (${result.totalDocs} docs)` })
  } catch (err) {
    console.error('[startup] DB health check FAILED:', err instanceof Error ? err.message : String(err))
  }
}
