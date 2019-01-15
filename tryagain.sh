#!/bin/bash

rm -r release
rm -r app/dist
rm app/*.map
rm app/main.prod.js
sudo apt-get purge -y nexus_wallet_0.8.4
rm -r ~/.config/Nexus
rm -r dll
npm run package-linux
sudo apt-get install -y ./release/nexus-tritium-beta_0.8.4_amd64.deb
echo ""
echo "Cleared for next attempt!"
echo ""

