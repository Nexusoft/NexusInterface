#!/bin/bash

rm -r release
rm -r build
sudo apt-get purge -y nexus-wallet
rm -r ~/.config/Nexus_Wallet_v1.2.2
echo ""
echo "Removed old build and associated data."
echo ""
npm run package-linux
sudo apt-get install -y ./release/nexus_wallet_1.2.2_amd64.deb
echo ""
echo "Cleared for next attempt!"
echo ""