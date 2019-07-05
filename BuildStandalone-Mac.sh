#!/bin/bash

rm -r release
rm -r dist
npm run package-mac
echo ""
echo "Cleared for next attempt!"
echo ""

