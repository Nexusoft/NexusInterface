# Context-isolation inventory

This document is the acceptance matrix for renderer privilege boundaries. A
surface is not marked complete merely because it has no direct Node import:
the compiled renderer must also pass the renderer build boundary below.

| Surface | Node integration | Context isolation | Sandbox | Privileged interface | Status |
| --- | --- | --- | --- | --- | --- |
| Main wallet window | Disabled | Enabled | Enabled | `window.nexusElectron`, exposed by `src/main/preload.js` | Complete for the current migration phase |
| Virtual keyboard window | Disabled | Enabled | Enabled | `src/keyboard/preload.js` | Complete |
| Production module WebViews | Disabled | Disabled | Disabled | Module preload and authorized module-file origin | Deferred compatibility milestone |
| Development module WebViews | Enabled for local development modules only | Disabled | Disabled | Module preload and local developer-selected directory | Deferred compatibility milestone |
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
- Core RPC calls require an allowlisted API namespace in addition to path-shape
  validation.
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
| Core lifecycle / console | `src/main/core.js` | `core.*` | `core:*` | Console command bounds | Complete |
| Core RPC HTTP(S) | `src/main/coreRpc.js` | `coreRpc.call` / `callByUrl` | `core-rpc:*` | Endpoint shape + namespace allowlist + TLS policy | Complete |
| Bootstrap download/extract | `src/main/bootstrap.js` | `bootstrap.*` | `bootstrap:*` | Progress events; archive preflight | Complete |
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

## Module-WebView deferral

Module WebViews are intentionally not included in the main-window isolation
completion. They retain their existing bridge behavior until React, Emotion,
the module preload, and both production and development modules have a
dedicated compatibility and smoke-test milestone. `src/main/webviewSecurity.js`
still enforces authorized entry URLs, restricts navigation, disables the
remote module, and denies `window.open`; it does **not** claim the isolation
properties of the main wallet window.

## Bootstrap artifact integrity prerequisite

Bootstrap extraction now preflights every ZIP entry and rejects traversal,
duplicate paths, links, encryption, excessive entry counts, excessive
expansion, and unsafe compression ratios before it writes any destination
path. The archive is downloaded to a private temporary file and extracted only
after that preflight completes. The download is bounded by currently available
disk space, and the preflight checks that the declared expanded size fits before
creating the extraction directory.

A cryptographic bootstrap-artifact verification cannot safely be enabled until
the bootstrap service publishes a stable, authenticated digest or signed
manifest and its signing contract is supplied to the client. No such artifact
is defined by this repository. Inventing an endpoint or a digest would either
silently provide no assurance or disable bootstrap for existing users, so that
server-side prerequisite remains explicitly outstanding.

## Required validation commands

```sh
npm run test:security
npm run build-renderer
npm run build-main
npm run build-preload
```

The repository workflow at `.github/workflows/security.yml` runs these checks
on pull requests and pushes. A full GUI launch smoke test remains a separate
environment-dependent release check because it requires Electron display and
Core fixtures.

See also: [context-isolation-migration-report.md](./context-isolation-migration-report.md).
