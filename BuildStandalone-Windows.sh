#!/bin/bash

rm -r release
rm -r app/dist
rm app/*.map
rm app/main.prod.js
sudo apt-get purge -y nexus-tritium
rm -r ~/.config/Nexus_Tritium_Wallet
rm -r dll
npm run package-win
echo ""
echo "Cleared for next attempt!"
echo ""
