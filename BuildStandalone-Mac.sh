#!/bin/bash

rm -r release
rm -r build
npm run package-mac
echo ""
echo "Cleared for next attempt!"
echo ""

