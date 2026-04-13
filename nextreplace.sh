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
sudo chmod 750 /home/deploy/atombondway/data
sudo chmod 640 /home/deploy/atombondway/data/payload.db
# public/media — needs write for file uploads
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

echo "🔄 Restarting app..."
pm2 stop company-profile
pm2 delete company-profile
pm2 start npm --name "company-profile" -- start
pm2 restart company-profile --update-env

echo "✅ Deployed successfully!"
pm2 status
pm2 logs company-profile