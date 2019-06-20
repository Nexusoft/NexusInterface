#!/bin/bash

rm -r release
rm -r app/dist
rm app/*.map
rm app/main.prod.js
sudo apt-get purge -y nexus-wallet
rm -r ~/.config/Nexus_Wallet_BETA_v1.0.0
rm -r dll
echo ""
echo "Removed old build and associated data."
echo ""
npm run package-linux
sudo apt-get install -y ./release/nexus_wallet_1.0.0_amd64.deb
echo ""
echo "Cleared for next attempt!"
echo ""