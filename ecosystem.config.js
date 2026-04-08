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
      script: './node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/compro',       // Change to your deployment path
      instances: 1,                  // Must be 1 for SQLite
      exec_mode: 'fork',             // Must be fork (not cluster) for SQLite
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
