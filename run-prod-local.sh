#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "🏗️  Building standalone bundle..."
npm run build

echo "📂 Copying static chunks into standalone..."
cp -r .next/static .next/standalone/.next/static

echo "📂 Merging public/ assets into standalone..."
cp -r public/. .next/standalone/public/

echo "🚀 Starting production server at http://localhost:3000"
exec env \
  NODE_ENV=production \
  PORT=3000 \
  HOSTNAME=127.0.0.1 \
  DATABASE_URL="file:${PROJECT_ROOT}/data/payload.db" \
  PAYLOAD_MEDIA_DIR="${PROJECT_ROOT}/public/media" \
  NEXT_PUBLIC_SITE_URL_PROD="http://localhost:3000" \
  PAYLOAD_PUBLIC_SERVER_URL_PROD="http://localhost:3000" \
  PAYLOAD_SECRET="${PAYLOAD_SECRET:-local-dev-secret-change-in-prod}" \
  node .next/standalone/server.js
