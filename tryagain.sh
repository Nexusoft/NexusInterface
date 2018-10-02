#!/bin/bash

rm -r release
rm -r app/dist
rm app/*.map
rm app/main.prod.js
sudo apt-get purge -y nexus-interface
rm -r ~/.config/nexus-interface
npm run package-linux
sudo apt-get install -y ./release/nexus-interface_0.6.0_amd64.deb
echo ""
echo "Cleared for next attempt!"
echo ""

