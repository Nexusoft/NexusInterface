# Context-isolation migration report

## Baseline

- Repository: `NamecoinGithub/NexusInterface`
- Foundation PR: [#23](https://github.com/NamecoinGithub/NexusInterface/pull/23)
  (`054f826` on `Merging`)
- Follow-up branch: `security/context-isolation-completion` /
  `copilot/securitycontext-isolation-completion-again`

## What PR #23 already delivered

- Main wallet window: `nodeIntegration: false`, `contextIsolation: true`,
  `enableRemoteModule: false`
- Virtual keyboard window: isolated and sandboxed
- Named preload bridge (`window.nexusEnv` / `window.nexusElectron`)
- Main-process ownership of Core RPC, settings, theme, modules, bootstrap,
  updater, file assets, dialogs, and path services
- Shared IPC contracts and request validators in `src/main/ipc/contracts.js`
- Archive preflight (`safeZip`), network host allowlists, Core TLS policy
- Initial security test suite and `.github/workflows/security.yml`

## Remaining work completed in this follow-up

### 1. Dead privileged shared code removed

These renderer/shared Node ports were superseded by main-process services and
have been deleted so they cannot re-enter the renderer graph:

- `src/shared/consts/paths.ts`
- `src/shared/utils/ensureDirExists.ts`
- `src/shared/lib/modules/installModule.ts`
- `src/shared/lib/modules/module.ts`
- `src/shared/lib/modules/repo.ts`
- `src/shared/lib/modules/storage.ts`
- `src/shared/lib/modules/autoUpdate.ts`

Live module UI now depends only on the renderer-safe ports under
`src/shared/lib/modules/renderer*.ts` and `webview.tsx`.

### 2. Main-window sandbox enabled

Sandbox was blocked on preload use of:

- Electron `clipboard` in the preload world
- `@aptabase/electron/renderer`

Both capabilities are now named IPC operations:

| Capability | Channel | Main implementation |
| --- | --- | --- |
| Clipboard write | `app:write-clipboard` | `clipboard.writeText` in main |
| Analytics event | `app:track-event` | `@aptabase/electron/main` `trackEvent` |

`src/main/renderer.js` now sets:

- `nodeIntegration: false`
- `contextIsolation: true`
- `sandbox: true`
- `enableRemoteModule: false`

### 3. Deeper Core RPC authorization

`core-rpc:call` and `core-rpc:call-by-url` now require an allowlisted Core API
namespace in addition to path-shape validation.

Allowed namespaces:

`assets`, `finance`, `ledger`, `market`, `names`, `network`, `objects`,
`profiles`, `register`, `sessions`, `supply`, `system`, `tokens`, `users`

Rejected examples:

- `evil/get/info`
- absolute URLs
- query/hash suffixes on `callByUrl`
- traversal segments

### 4. Static renderer-boundary guard

`test/security/renderer-boundary.test.js` fails CI if renderer/shared code
regains:

- Node core imports/requires
- direct `electron` imports/requires
- direct `process.env` / `process.platform` / `process.arch` / `process.cwd`

Allowed privileged files remain limited to `src/main/**`,
`src/keyboard/preload.js`, and `src/module_preload.js`.

### 5. Expanded contract tests

Additional coverage for:

- Core RPC namespace rejection
- Core RPC URL rejection
- clipboard size bounds
- analytics event validation
- main-window sandbox configuration
- preload no longer importing clipboard/Aptabase renderer SDK

## Removed renderer capabilities

| Former capability | Replacement |
| --- | --- |
| Shared `consts/paths` filesystem bootstrap | `src/main/paths.js` |
| Shared module install/repo/storage Node ports | `src/main/modules.js` + IPC |
| Preload `clipboard.writeText` | `app:write-clipboard` |
| Preload Aptabase renderer SDK | `app:track-event` |
| Open Core RPC namespaces | Allowlisted namespaces only |

## Remaining intentional exceptions

| Item | Status | Reason |
| --- | --- | --- |
| Production/development module WebView `contextIsolation` | Deferred | React/Emotion/`NEXUS` bridge compatibility milestone still required |
| Development module `nodeIntegration` | Deferred with production disabled | Local developer modules only; still navigation-restricted |
| Bootstrap artifact signature/digest verification | Blocked | Bootstrap service has not published a stable signed manifest contract |
| Full packaged GUI smoke matrix | Environment-dependent release check | Requires display + Core fixtures outside CI |

Module WebViews still receive:

- authorized entry URLs only
- navigation restriction to the module origin/root
- `enableRemoteModule: false`
- denied `window.open`
- dedicated module preload, not the main wallet bridge

They do **not** yet receive the main-window isolation properties.

## Test evidence

Commands:

```sh
npm run test:security
npm run build-renderer
npm run build-main
npm run build-preload
```

Security tests now include:

- `test/security/startup.test.js`
- `test/security/ipc-handlers.test.js`
- `test/security/contracts.test.js`
- `test/security/core-transport.test.js`
- `test/security/network-policy.test.js`
- `test/security/archive-safety.test.js`
- `test/security/renderer-boundary.test.js`

## Manual regression focus for reviewers

- Main window startup in development and packaged production
- Clipboard copy of addresses
- Usage-tracking events when enabled
- Core RPC login/session and ordinary wallet API calls
- Terminal Core API console relative paths under allowed namespaces
- Module install/launch still works under the deferred WebView policy
