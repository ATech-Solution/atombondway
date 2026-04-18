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

echo "📦 Pulling latest code..."
#cd ~/atombondway
git stash
git stash drop
git pull origin main
#overwrite completely
#git checkout origin/main -- package.json

echo "📥 Installing dependencies..."
npm install

echo "skip 🏗️ Building app... make sure already on local and pass .nextjs"
#npm run build

echo "📂 Copying static assets into standalone bundle..."
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

echo "🔄 Restarting app..."
pm2 stop company-profile || true
pm2 delete company-profile || true
pm2 start ecosystem.config.js --env production
pm2 restart company-profile --update-env

echo "✅ Deployed successfully!"
pm2 status
pm2 logs company-profile