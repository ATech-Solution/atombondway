#!/bin/bash
set -e  # stop script if any command fails

#echo "🔍 Checking server health..."
#FREE_MEM=$(free -m | awk '/^Mem:/{print $4}')
#FREE_DISK=$(df -m ~ | awk 'NR==2{print $4}')

#if [ "$FREE_MEM" -lt 300 ]; then
#    echo "❌ Not enough RAM ($FREE_MEM MB free). Aborting."
#    exit 1
#fi

#if [ "$FREE_DISK" -lt 500 ]; then
#    echo "❌ Not enough disk space ($FREE_DISK MB free). Aborting."
#    exit 1
#fi
#prepare .next
sudo rm -rf .next
sudo unzip -q next.zip
sudo mv next .next
# sudo chown -R deploy:deploy .next
# sudo chmod -R 755 .next
sudo rm -rf __MACOSX

# set the permisson for site
# Project root — deploy owns everything
sudo chown -R deploy:deploy /home/deploy/atombondway
# .next/standalone — needs read + execute to run Node
sudo chmod -R 755 /home/deploy/atombondway/.next
# data/ — needs write for SQLite (read/write/lock the .db file)
#sudo chmod 750 /home/deploy/atombondway/data
#sudo chmod 640 /home/deploy/atombondway/data/payload.db
# public/media — must exist and be writable for Payload file uploads
mkdir -p /home/deploy/atombondway/public/media
sudo chown -R deploy:deploy /home/deploy/atombondway/public/media
sudo chmod 755 /home/deploy/atombondway/public/media

# data/ — must exist and be writable for SQLite (payload.db lives here)
mkdir -p /home/deploy/atombondway/data
sudo chown deploy:deploy /home/deploy/atombondway/data
sudo chmod 750 /home/deploy/atombondway/data

echo "📦 Pulling latest code..."
#cd ~/atombondway
git stash
git stash drop
git pull origin main
#overwrite completely
#git checkout origin/main -- package.json

echo "📥 Installing dependencies..."
#npm install

echo "skip 🏗️ Building app... make sure already on local and pass .nextjs"
#npm run build

 npm run generate:types && npm run generate:importmap

echo "🔧 Patching dev-machine paths in standalone bundle..."
# Next.js bakes import.meta.url absolute paths at build time (e.g. Payload's OG font loader).
# Replace the build machine's path with this server's path so runtime file reads succeed.
grep -rl "/Users/tansams/Documents/GitHub/atombondway" .next/standalone/ --include="*.js" 2>/dev/null \
  | xargs -r sed -i "s|/Users/tansams/Documents/GitHub/atombondway|/home/deploy/atombondway|g"

echo "📂 Copying JS/CSS chunks into standalone bundle..."
# The zip puts static chunks at .next/static/ (top level) but the standalone server
# expects them at .next/standalone/.next/static/. The standalone zip doesn't include
# this subdir, so we must copy it. Destination doesn't exist yet → cp creates it correctly.
cp -r .next/static .next/standalone/.next/static

echo "📂 Merging public/ assets into standalone bundle..."
# Use /. to copy directory CONTENTS into the existing .next/standalone/public/
# (plain `cp -r public .next/standalone/public` would create a nested public/public/
# because the destination already exists from the build zip)
cp -r public/. .next/standalone/public/

echo "🔗 Symlinking media directory into standalone..."
# standalone/server.js calls process.chdir(__dirname), so process.cwd() becomes
# .next/standalone/ — NOT the project root. Symlink the persistent media dir into
# the standalone public/ so Next.js static serving and Payload API both find the same files.
rm -rf .next/standalone/public/media
ln -sfn /home/deploy/atombondway/public/media .next/standalone/public/media

echo "🔄 Restarting app..."
pm2 stop company-profile || true
pm2 delete company-profile || true
pm2 start ecosystem.config.js --env production
pm2 restart company-profile --update-env

echo "✅ Deployed successfully!"
pm2 status
pm2 logs company-profile