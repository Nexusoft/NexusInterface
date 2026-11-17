# Context-isolation inventory

This document is the acceptance matrix for renderer privilege boundaries. A
surface is not marked complete merely because it has no direct Node import:
the compiled renderer must also pass the renderer build boundary below.

| Surface | Node integration | Context isolation | Sandbox | Privileged interface | Status |
| --- | --- | --- | --- | --- | --- |
| Main wallet window | Disabled | Enabled | Enabled | `window.nexusElectron`, exposed by `src/main/preload.js` | Complete |
| Virtual keyboard window | Disabled | Enabled | Enabled | `src/keyboard/preload.js` | Complete |
| Production module WebViews | Disabled | Enabled | Enabled | Isolated NEXUS v2 preload and authorized module-file origin | Complete |
| Development module WebViews | Disabled | Enabled | Enabled | Isolated NEXUS v2 preload and module-scoped loopback origin | Complete |
| Main-process IPC | N/A | N/A | N/A | Named channels in `src/main/ipc/contracts.js`, registered in `src/main/main.js` | Complete |
| Renderer bundle | N/A | N/A | N/A | Browser-safe Electron bridge alias | Complete |

## Main-window acceptance criteria

- `src/main/renderer.js` sets `nodeIntegration: false`,
  `contextIsolation: true`, `sandbox: true`, and `enableRemoteModule: false`.
- `src/main/preload.js` exposes an allowlisted, typed operation surface rather
  than raw `ipcRenderer`, Node modules, or Electron modules.
- Clipboard writes and analytics events go through named IPC channels
  (`app:write-clipboard`, `app:track-event`) instead of preload-local Electron
  or third-party renderer SDKs.
- Every registered operation validates its request before invoking a
  main-process service. Operations with no request reject supplied arguments.
- The main window cannot navigate or redirect away from its exact trusted
  application document, and popup creation is denied. Privileged IPC also
  verifies the trusted top-frame URL rather than relying only on a
  `webContents` id.
- Core RPC calls require a concrete registered endpoint and endpoint-specific
  parameter schema. The broader Terminal URL/CLI capability requires persisted
  Developer mode and is enforced in the main process.
- `npm run build-renderer` uses
  `configs/webpack.config.base.renderer.babel.js`, which disables Node and
  Electron externals and resolves browser package conditions. A Node-core
  import in the live renderer graph therefore fails the build rather than
  becoming a runtime `require`.
- `npm run test:security` verifies the URL, path, Core transport, archive,
  renderer-boundary, and startup configuration checks.

## Capability inventory (post-migration)

| Former renderer capability | Main-process owner | Preload / bridge method | IPC channel | Validation | Status |
| --- | --- | --- | --- | --- | --- |
| `process.env` / platform / arch | Preload environment snapshot | `window.nexusEnv` / `environment` | N/A (preload constants) | Read-only values | Complete |
| Application path bootstrap | `src/main/paths.js` | `paths.getBootstrap()` | `paths:get-bootstrap` | No arguments; no FS paths returned | Complete |
| Settings / address book files | `src/main/settings.js` | `settings.*` | `settings:*` | Field allowlists | Complete |
| Theme / wallpaper files | `src/main/theme.js` | `theme.*` | `theme:*` | Theme field allowlist / dialog-only import-export | Complete |
| Core lifecycle / console | `src/main/core.js` | `core.*` | `core:*` | Serialized lifecycle; confirmed stop; console bounds + Developer-mode policy | Complete |
| Core RPC HTTP(S) | `src/main/coreRpc.js` | `coreRpc.call` / `callByUrl` | `core-rpc:*` | Concrete endpoint schemas; Developer-only console path; TLS policy | Complete |
| Bootstrap download/extract | `src/main/bootstrap.js` | `bootstrap.*` | `bootstrap:*` | Disabled until an authenticated signed-manifest contract exists | Disabled (fail closed) |
| Module install/storage/repo | `src/main/modules.js` | `modules.*` | `modules:*` | Safe module names, archive limits | Complete |
| Module icons / recovery / geoip / i18n | `src/main/fileAssets.js` | `fileAssets.*` | `file-assets:*` | Host/path allowlists | Complete |
| Updater / market data | `src/main/updater.js` | `updater.*` | `updater:*` | Boolean/option validation | Complete |
| Clipboard write | Electron main `clipboard` | `clipboard.writeText` | `app:write-clipboard` | Max length | Complete |
| Analytics events | `@aptabase/electron/main` | `aptabase.trackEvent` | `app:track-event` | Event name + property bounds | Complete |
| Native dialogs / shell open | `src/main/main.js` | `dialogs.*` / `app.openExternal` | `dialogs:*` / `app:*` | Named dialogs; HTTPS host allowlist | Complete |

### Explicitly migrated renderer files

| File | Former risk | Migration |
| --- | --- | --- |
| `src/shared/components/ExternalIcon.tsx` | External HTTP / file reads | `fileAssets.fetchExternalIcon` |
| `src/shared/components/ModuleIcon.tsx` | Module filesystem icon reads | `fileAssets.readModuleIcon` |
| `src/App/Modules/WebView.tsx` | Module entry/file serving | `modules.getEntry` / `modules.prepareFiles` + WebView host bridge |

## Module-WebView isolation

Production and development module WebViews now use the isolated NEXUS v2
bridge with `nodeIntegration: false`, `contextIsolation: true`, and
`sandbox: true`. The former React/Emotion bridge, generic Core RPC, generic
network proxy, raw Electron access, and production v1 compatibility path are
not exposed.

Module side effects are capability-based. Clipboard writes and external-link
opens are excluded from defaults, require an explicit manifest capability,
show a wallet-owned confirmation for every request, and are rate-limited per
module session. Each module receives a unique session partition whose network
policy allows only its assigned local content, rejects other requests, uses a
blackhole proxy, and requests WebRTC suppression. Packaged peer-connection and
STUN/TURN denial remain a manual release gate.

See [module-webview-isolation.md](./module-webview-isolation.md) and
[module-webview-isolation-report.md](./module-webview-isolation-report.md).

## Bootstrap artifact integrity prerequisite

Bootstrap download and extraction are disabled and reject all requests. The
previous flow could not authenticate its archive and merged extracted files
non-atomically into the live Core data directory. Keeping that behavior would
put live wallet state at risk if a download were corrupted, malicious, or
interrupted.

Re-enabling bootstrap requires a publisher-defined, authenticated signed
manifest contract, verification before extraction, a confirmed Core shutdown,
and a staged data-directory swap with rollback. No such artifact contract is
defined by this repository, so the current implementation fails closed rather
than pretending an unauthenticated digest provides assurance.

## Required validation commands

```sh
npm run test:security
npm run build
npx electron-builder --dir --publish never
```

The repository workflow at `.github/workflows/security.yml` runs these checks
on Ubuntu, macOS, and Windows for pull requests and pushes. CI creates an
unpacked application on every platform; interactive GUI/Core behavior remains
a separate release check because it requires a display and controlled Core
fixtures.

See also: [context-isolation-migration-report.md](./context-isolation-migration-report.md).
