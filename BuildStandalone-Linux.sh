#!/bin/bash

rm -r release
rm -r dist
sudo apt-get purge -y nexus-wallet
rm -r ~/.config/Nexus_Wallet_v1.0.1
echo ""
echo "Removed old build and associated data."
echo ""
npm run package-linux
sudo apt-get install -y ./release/nexus_wallet_1.0.1_amd64.deb
echo ""
echo "Cleared for next attempt!"
echo ""