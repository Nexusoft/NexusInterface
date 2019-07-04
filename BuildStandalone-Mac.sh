#!/bin/bash

rm -r release
rm -r app/dist
rm app/*.map
rm app/main.prod.js
npm run package-mac
echo ""
echo "Cleared for next attempt!"
echo ""

