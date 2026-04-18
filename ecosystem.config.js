/**
 * PM2 Process Manager Configuration
 * Usage: pm2 start ecosystem.config.js --env production
 *
 * IMPORTANT: SQLite requires single-process (fork) mode.
 * Never use cluster mode — it will cause SQLITE_BUSY errors.
 */
module.exports = {
  apps: [
    {
      name: 'company-profile',
      script: 'node',
      args: '.next/standalone/server.js',
      cwd: '/home/deploy/atombondway/',       // Change to your deployment path
      instances: 1,                  // Must be 1 for SQLite
      exec_mode: 'fork',             // Must be fork (not cluster) for SQLite
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
        DATABASE_URL: 'file:/home/deploy/atombondway/data/payload.db',
      },
    },
  ],
}
