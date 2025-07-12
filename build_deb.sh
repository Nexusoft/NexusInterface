#!/bin/bash

set -e

# Dependencies: Node.js, npm, electron-builder, git
echo "Installing prerequisites..."
sudo apt-get update
sudo apt-get install -y git nodejs npm

# Clone the repo
if [ ! -d "NexusInterface" ]; then
  git clone --branch Merging https://github.com/Nexusoft/NexusInterface.git
fi

cd NexusInterface

# Ensure we are on the correct branch and up to date
git checkout Merging
git pull

# Install Node dependencies
echo "Installing npm dependencies..."
npm install

# Build the application (if required)
echo "Building the application..."
npm run build || echo "No 'build' script, skipping..."

# Install electron-builder if not present
if ! npx electron-builder --version > /dev/null 2>&1; then
  npm install --save-dev electron-builder
fi

# Build the .deb package
echo "Packaging as .deb..."
npx electron-builder build --linux deb

echo "Build complete. Check the 'dist/' directory for your .deb file."