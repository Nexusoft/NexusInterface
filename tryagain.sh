#!/bin/bash

rm -r release
rm -r app/dist
rm app/*.map
rm app/main.prod.js
sudo apt-get purge -y nexus-tritium-beta
rm -r ~/.config/Nexus
rm -r dll
npm run package-linux
sudo apt-get install -y ./release/nexus-tritium-beta_0.8.3_amd64.deb
echo ""
echo "Cleared for next attempt!"
echo ""

