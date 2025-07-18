#!/bin/bash
set -e

# Prerequisites
echo "Installing build dependencies..."
sudo apt-get update
sudo apt-get install -y git nodejs npm build-essential

# --- Build LLL-TAO from merging branch ---
if [ ! -d "LLL-TAO" ]; then
  git clone --branch merging https://github.com/Nexusoft/LLL-TAO.git
fi
cd LLL-TAO
git checkout merging
git pull

echo "Building LLL-TAO..."
make clean && make

# Assume the output binary is "lll-tao" (update as needed)
LLL_TAO_BIN="./lll-tao"
if [ ! -f "$LLL_TAO_BIN" ]; then
  echo "ERROR: LLL-TAO binary not found after build!"
  exit 1
fi

cd ..

# --- Build NexusInterface from Merging branch ---
if [ ! -d "NexusInterface" ]; then
  git clone --branch Merging https://github.com/Nexusoft/NexusInterface.git
fi
cd NexusInterface
git checkout Merging
git pull

echo "Installing NexusInterface npm dependencies..."
npm install

echo "Building NexusInterface..."
npm run build || echo "No 'build' script, skipping..."

# --- Copy LLL-TAO binary into NexusInterface package ---
# Choose appropriate location (e.g., resources/bin, or as required by your app)
mkdir -p resources/bin
cp ../LLL-TAO/lll-tao resources/bin/

# --- Package as .deb using electron-builder ---
if ! npx electron-builder --version > /dev/null 2>&1; then
  npm install --save-dev electron-builder
fi

echo "Packaging NexusInterface (with LLL-TAO) as .deb..."
npx electron-builder build --linux deb

echo "Done! Check the dist/ folder for your .deb package."
