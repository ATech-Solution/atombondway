# Deployment & Local Testing Guide

A step-by-step walkthrough for setting up the project locally and deploying to a VPS or cPanel server.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [First Run & Admin Setup](#first-run--admin-setup)
4. [Email Testing with Mailpit](#email-testing-with-mailpit)
5. [Building for Production](#building-for-production)
6. [Deploy to VPS (Nginx + PM2)](#deploy-to-vps-nginx--pm2)
7. [Deploy to cPanel (Node.js Selector)](#deploy-to-cpanel-nodejs-selector)
8. [Environment Variables Reference](#environment-variables-reference)
9. [Database Management](#database-management)
10. [Media Uploads Management](#media-uploads-management)
11. [Updating the Site](#updating-the-site)

---

## Prerequisites

### Local machine
- Node.js >= 20 ([download](https://nodejs.org))
- npm >= 9
- Git
- Docker (optional, for Mailpit email testing)

### Server (VPS)
- Ubuntu 22.04 LTS or later
- Node.js >= 20
- Nginx
- PM2 (`npm install -g pm2`)
- Certbot (for SSL)

### Server (cPanel)
- cPanel with Node.js Selector (v20+)
- SSH access recommended

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone <your-repo-url> company-profile
cd company-profile
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and configure at minimum:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PAYLOAD_SECRET=any-random-string-at-least-32-chars
DATABASE_URL=file:./data/payload.db
EMAIL_FROM=noreply@example.com
EMAIL_FROM_NAME=Company Profile
```

Leave `AWS_SES_SMTP_USER` empty — the app will use Mailpit automatically.

### 4. Create required directories

```bash
mkdir -p data public/media
```

### 5. Generate Payload types and import map

```bash
npm run generate:types
npm run generate:importmap
```

> These commands generate `src/payload-types.ts` and `src/app/(payload)/admin/importMap.js`.
> They are also run automatically on `next dev`.

### 6. Run database migrations

```bash
npm run migrate
```

### 7. Start the development server

```bash
npm run dev
```

The app is now running at:
- **Frontend**: http://localhost:3000
- **Admin panel**: http://localhost:3000/admin

---

## First Run & Admin Setup

### 1. Create the first admin user

Navigate to http://localhost:3000/admin

On first run, Payload will show a "Create first user" screen. Fill in:
- **Name**: Your name
- **Email**: your@email.com
- **Password**: a strong password

This user automatically gets admin role.

### 2. Populate Site Settings

Go to **Admin → Globals → Site Settings**:
- Set **Company Name**
- Set **Domain** (e.g., `https://yourdomain.com`)
- Upload your **Logo**
- Configure **Default SEO** fields

### 3. Configure Contact Information

Go to **Admin → Globals → Contact Information**:
- Fill in address, phone, email, fax
- Set business hours
- Add Google Maps embed URL (optional)

### 4. Configure the Hero Section

Go to **Admin → Globals → Hero Section**:
- Set heading and subheading (in both EN and ZH)
- Upload a background image
- Set CTA button text and links

### 5. Add Navigation

Go to **Admin → Globals → Navigation Menu**:
- Add nav items (Home, About, Projects, Products, Services, Contact)

### 6. Add Content

- **Projects**: Admin → Collections → Projects → Create
- **Products**: Admin → Collections → Products → Create
- **Services**: Admin → Collections → Services → Create

Remember to **check "Featured on Homepage"** for items you want on the homepage, and set the **Sort Order**.

---

## Email Testing with Mailpit

Mailpit is a local SMTP server with a web UI for viewing emails during development.

### Start Mailpit with Docker

```bash
docker run -d \
  --name mailpit \
  -p 1025:1025 \
  -p 8025:8025 \
  axllent/mailpit
```

### View emails

Open http://localhost:8025

All emails sent by the app (password reset, contact form, user verification) will appear here.

### Stop Mailpit

```bash
docker stop mailpit
```

---

## Building for Production

```bash
# Build the Next.js app
npm run build

# Test the production build locally
npm run start
# App runs at http://localhost:3000
```

---

## Deploy to VPS (Nginx + PM2)

### 1. Server preparation

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Upload the project

```bash
# On your local machine — create a production archive
git archive --format=tar.gz HEAD > compro.tar.gz

# Upload to server
scp compro.tar.gz user@your-server-ip:/var/www/

# On the server
cd /var/www
tar -xzf compro.tar.gz -C compro
cd compro
```

### 3. Configure environment

```bash
cp .env.example .env
nano .env
```

Set production values:
```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_DOMAIN=https://yourdomain.com
PAYLOAD_SECRET=<generate: openssl rand -base64 32>
DATABASE_URL=file:/var/www/compro/data/payload.db

# AWS SES (required in production)
AWS_SES_SMTP_HOST=email-smtp.ap-southeast-1.amazonaws.com
AWS_SES_SMTP_PORT=465
AWS_SES_SMTP_USER=your-ses-smtp-user
AWS_SES_SMTP_PASSWORD=your-ses-smtp-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Company Name
```

### 4. Install & build

```bash
mkdir -p data public/media
npm install
npm run generate:types
npm run generate:importmap
npm run migrate
npm run build
```

### 5. Start with PM2

Edit `ecosystem.config.js` to set the correct `cwd`:
```javascript
cwd: '/var/www/compro',
```

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup   # Follow the printed command to enable auto-start on reboot
```

### 6. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/compro
```

Paste:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Proxy Next.js app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploaded media directly from filesystem (faster)
    location /media/ {
        alias /var/www/compro/public/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header Referrer-Policy strict-origin-when-cross-origin;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/compro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Enable SSL

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts. Certbot auto-renews the certificate.

### 8. Set file permissions

```bash
sudo chown -R $USER:www-data /var/www/compro
sudo chmod -R 755 /var/www/compro
sudo chmod -R 775 /var/www/compro/data
sudo chmod -R 775 /var/www/compro/public/media
```

---

## Deploy to cPanel (Node.js Selector)

### 1. Upload files

Via File Manager or FTP, upload the project to a directory in your home folder, e.g.:
```
/home/username/company-profile/
```

Do **not** upload `node_modules/`, `.next/`, `data/`, or `public/media/`.

### 2. Configure Node.js Selector

In cPanel → **Node.js Selector**:

| Setting | Value |
|---|---|
| Node.js version | 20.x (or latest available) |
| Application mode | Production |
| Application root | `company-profile` |
| Application URL | `yourdomain.com` |
| Application startup file | `node_modules/.bin/next` |

> **Note**: Some cPanel setups require an `app.js` file as the entry point instead. If so, create `app.js`:
> ```javascript
> const { createServer } = require('http')
> const { parse } = require('url')
> const next = require('next')
> const app = next({ dev: false })
> const handle = app.getRequestHandler()
> app.prepare().then(() => {
>   createServer((req, res) => {
>     const parsedUrl = parse(req.url, true)
>     handle(req, res, parsedUrl)
>   }).listen(process.env.PORT || 3000)
> })
> ```

### 3. Set environment variables

In Node.js Selector → **Environment Variables**, add all variables from `.env.example` with production values.

### 4. Install dependencies and build via Terminal

```bash
cd ~/company-profile
mkdir -p data public/media
npm install
npm run generate:types
npm run generate:importmap
npm run migrate
npm run build
```

### 5. Start the application

Click **Run JS Script** in Node.js Selector and run:
```
next start
```

Or restart via the Node.js Selector dashboard.

### 6. Persistent directories

Mark these as persistent (never deleted during updates):
- `data/` — SQLite database
- `public/media/` — uploaded images

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Yes | `http://localhost:3000` | Full URL of the site (used in emails) |
| `NEXT_PUBLIC_DOMAIN` | Prod | — | Production domain for canonical URLs |
| `PAYLOAD_SECRET` | Yes | — | Secret key for Payload sessions. Min 32 chars. |
| `DATABASE_URL` | Yes | `file:./data/payload.db` | SQLite file path (`file:` prefix required) |
| `AWS_SES_SMTP_HOST` | Prod | `email-smtp.us-east-1.amazonaws.com` | SES SMTP endpoint |
| `AWS_SES_SMTP_PORT` | Prod | `465` | SES SMTP port |
| `AWS_SES_SMTP_USER` | Prod | — | SES SMTP username (leave blank for Mailpit) |
| `AWS_SES_SMTP_PASSWORD` | Prod | — | SES SMTP password |
| `EMAIL_FROM` | Yes | `noreply@yourdomain.com` | From address for all emails |
| `EMAIL_FROM_NAME` | Yes | `Company Profile` | From name for all emails |
| `MAILPIT_HOST` | Dev | `localhost` | Mailpit SMTP host |
| `MAILPIT_PORT` | Dev | `1025` | Mailpit SMTP port |

---

## Database Management

### Backup

```bash
# Create a timestamped backup
cp data/payload.db "backups/payload-$(date +%Y%m%d-%H%M%S).db"
```

Set up a cron job for automated backups:
```bash
crontab -e
# Add: daily backup at 2am
0 2 * * * cp /var/www/compro/data/payload.db /var/www/backups/payload-$(date +\%Y\%m\%d).db
```

### Run migrations after schema changes

Whenever you modify Payload collections or globals, create and run a migration:

```bash
npm run migrate:create   # Creates a new migration file
npm run migrate          # Applies pending migrations
```

---

## Media Uploads Management

All uploaded images are stored in `public/media/`. This directory must:
1. Be **persistent** — never wiped on redeploy
2. Be **writable** by the Node.js process
3. Be **backed up** separately (not tracked by git)

### Backup media

```bash
tar -czf "media-backup-$(date +%Y%m%d).tar.gz" public/media/
```

### Restore media

```bash
tar -xzf media-backup-YYYYMMDD.tar.gz
```

---

## Updating the Site

### 1. Pull latest code

```bash
cd /var/www/compro
git pull origin main
```

### 2. Install new dependencies (if any)

```bash
npm install
```

### 3. Run migrations (if schema changed)

```bash
npm run migrate
```

### 4. Rebuild

```bash
npm run generate:importmap
npm run build
```

### 5. Restart PM2

```bash
pm2 restart company-profile
```

---

## Troubleshooting

### Admin panel returns 404 after deploy
Run `npm run generate:importmap` and rebuild.

### SQLite "database is locked" error
Ensure PM2 is running in **fork** mode (not cluster). Check `ecosystem.config.js`: `exec_mode: 'fork'`, `instances: 1`.

### Images not loading in production
Check that `public/media/` is writable and Nginx `location /media/` alias points to the correct path.

### Emails not sending
- **Dev**: Ensure Mailpit is running on port 1025. Check http://localhost:8025.
- **Prod**: Verify `AWS_SES_SMTP_USER` and `AWS_SES_SMTP_PASSWORD` are set. Check SES sandbox status in AWS Console.

### `Cannot find module '@payload-config'` 
Check `tsconfig.json` paths: `"@payload-config": ["./payload.config.ts"]`.
