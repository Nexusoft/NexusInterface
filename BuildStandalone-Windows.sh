#!/bin/bash

rm -r release
rm -r dist
sudo apt-get purge -y nexus-tritium
rm -r ~/.config/Nexus_Tritium_Wallet
npm run package-win
echo ""
echo "Cleared for next attempt!"
echo ""
