#!/bin/bash

rm -r release
rm -r app/dist
rm app/*.map
rm app/main.prod.js
sudo apt-get purge -y nexus-tritium-beta
rm -r ~/.config/Nexus_Tritium_Wallet_Beta
npm run package-linux
sudo apt-get install -y ./release/nexus-tritium-beta_0.8.0_amd64.deb
echo ""
echo "Cleared for next attempt!"
echo ""

