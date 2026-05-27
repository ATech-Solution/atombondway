export async function register() {
  // Only run in the Node.js runtime (not Edge), and only on the server
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  try {
    const { getPayload } = await import('payload')
    const { default: config } = await import('@payload-config')
    const payload = await getPayload({ config })
    await payload.db.migrate()
    payload.logger.info({ msg: '[startup] DB migrations complete' })
  } catch (err) {
    // Log clearly so the error is visible in PM2 logs
    console.error('[startup] DB migration failed — tables may be missing:', err)
  }
}
