#!/bin/bash

set -e

# Prerequisites: git, Node.js (>=22.12), npm (>=10.9). electron-builder comes from package.json.
missing=()
command -v git >/dev/null 2>&1 || missing+=("git")
command -v node >/dev/null 2>&1 || missing+=("nodejs")
command -v npm >/dev/null 2>&1 || missing+=("npm")
if [ "${#missing[@]}" -gt 0 ]; then
  echo "Missing required tools: ${missing[*]}"
  echo "Install them first (for example: sudo apt-get update && sudo apt-get install -y ${missing[*]})"
  exit 1
fi

# Prefer the current checkout when already inside a NexusInterface tree.
if [ -f package.json ] && [ -d src ]; then
  ROOT_DIR="."
else
  if [ ! -d "NexusInterface" ]; then
    git clone --branch Merging https://github.com/Nexusoft/NexusInterface.git
  fi
  ROOT_DIR="NexusInterface"
  cd "$ROOT_DIR"
  git checkout Merging
  git pull
fi

# Install Node dependencies
echo "Installing npm dependencies..."
npm install

# Build the application (if required)
echo "Building the application..."
npm run build || echo "No 'build' script, skipping..."

# Ensure local electron-builder from package.json is available
if ! npm list electron-builder >/dev/null 2>&1; then
  npm install --save-dev electron-builder
fi

# Build the .deb package
echo "Packaging as .deb..."
npx electron-builder build --linux deb

echo "Build complete. Check the 'release/' directory for your .deb file."
