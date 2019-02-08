#!/bin/bash

rm -r release
rm -r app/dist
rm app/*.map
rm app/main.prod.js
sudo apt-get purge -y nexus-wallet
rm -r ~/.config/Nexus_Wallet_BETA_v0.8.6
rm -r dll
echo ""
echo "Removed old build and associated data."
echo ""
npm run package-linux
sudo apt-get install -y ./release/nexus_wallet_0.8.6_amd64.deb
echo ""
echo "Cleared for next attempt!"
echo ""