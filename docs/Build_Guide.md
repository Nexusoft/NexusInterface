# Build Guide

- [Wallet][1]
- [Core][2]

## Wallet

### Step 1

Install the following

- Code editor of choice (VSCode)
- Node.js
- NPM

### Step 2

Clone Repo into a empty folder and open that folder in your editor

### Step 3

Run the command `npm install`

### Step 4 (Development)

Run command `npm run build-dll`
Run command `npm run dev`

### Step 4 (Production)

Run command `npm run package-platform*`

- replace `platform` with your desired platform
  Platforms: `win`, `darwin`(Mac OSX), `linux`
  This will build the project and place the build in the `release` folder. The file format will depend on the provided formats in the `package.json`

### FAQ

## Cores

//URL

### Step 1

Git Clone repo into a empty folder and open in your favorite code editor.

### Step 2 (Windows)

Install mksys
Open mksys and cd into the repo

### Step 3

run `make clean`

### Step 4

run `make -f makefile.cli`
optional params are
`-j 8` Jobs, will make it compile faster, replace 8 with desired job amount
`verbose=1` What level of logs to produce, accepts 0 to 5
`STATIC=1` Will compile dependencies

### FAQ

[1]: #wallet
[2]: #core
