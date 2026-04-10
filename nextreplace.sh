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
sudo chown -R deploy:deploy .next
sudo chmod -R 755 .next
sudo rm -rf __MACOSX

echo "📦 Pulling latest code..."
#cd ~/atombondway
git pull origin main

#echo "📥 Installing dependencies..."
#npm install

#echo "skip 🏗️ Building app..."
#npm run build

#echo "🔄 Restarting app..."
#pm2 restart company-profile
pm2 stop company-profile
pm2 delete company-profile
pm2 start npm --name "company-profile" -- start

echo "✅ Deployed successfully!"
pm2 status
pm2 logs company-profile
