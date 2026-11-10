# Build Guide

- [Wallet][1]
- [Core][2]

## Wallet

### Step 1

Install the following

- Code editor of choice (VSCode)
- Node.js (min v22.12.0)
- NPM (min v10.9.0)

### Step 2

Clone Repo into a empty folder and open that folder in your editor

### Step 3

Run the command `npm install`

For a reproducible install that exactly matches the committed `package-lock.json`
(recommended for release builds and CI), run `npm ci` instead. `npm ci` will fail
fast if the lockfile is out of sync rather than silently resolving newer
transitive dependencies, which has caused build breaks in `electron-builder` in
the past.

### Step 4 (Development)

Run command `npm run build-dll`
Run command `npm run dev`

### Step 4 (Production)

Run command `npm run package-platform*`

- replace `platform` with your desired platform
  Platforms: `win`, `darwin`(macOS), `linux`
  This will build the project and place the build in the `release` folder. The file format will depend on the provided formats in the `package.json`
- macOS should use `npm run package-mac`; this repository sets `mac.identity` to `null`, so notarization is skipped unless you override the signing configuration.

### FAQ

- If you compile a replacement Nexus core daemon and otherwise keep the upstream NexusInterface unchanged, replace the bundled core binary in `assets/<platform>/cores/` before packaging:
  - Linux x64: `assets/linux/cores/nexus-linux-x64`
  - macOS x64: `assets/darwin/cores/nexus-darwin-x64`
  - Windows x64: `assets/win32/cores/nexus-win32-x64.exe`
- The wallet starts whichever bundled binary matches the current platform and architecture.
- The embedded x64 cores are based on LLL-TAO NODE5 5.1.7-rc6 build 1.
  Linux and Windows use core revision `54726c85d1c1a0a12f95212a18e1c72a8fe88ece`;
  macOS uses `04eb09340bb20852c081b84fdb9c7b2e3de4a7d2`, which adds a
  configurable macOS deployment target. The macOS core targets 10.13 or
  later. Older macOS releases have not been verified.
- Back up wallet and core data before upgrading. In particular, test existing
  Windows legacy wallets before rollout: the embedded Windows build uses
  Berkeley DB 5.3, and compatibility with data created by other Berkeley DB
  major versions has not been verified.
- Embedded core dependency licenses and source locations are packaged under
  `assets/misc/licenses/`. The `Build embedded ... core` workflows produce
  candidate binaries; replace the assets only after platform validation.

## Cores

https://github.com/Nexusoft/LLL-TAO

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
