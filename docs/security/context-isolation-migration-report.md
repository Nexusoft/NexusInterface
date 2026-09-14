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

Structured `core-rpc:call` now requires a **concrete registered endpoint** and
endpoint-specific request schema (see `src/main/ipc/coreRpcRegistry.js` and
`docs/security/core-rpc-endpoint-registry.md`). Namespace-only policy is no
longer sufficient for ordinary wallet/module API calls.

Terminal URL syntax uses the separately constrained console capability
`core-rpc:call-by-url`, which still applies the namespace allowlist:

`assets`, `finance`, `ledger`, `market`, `names`, `network`, `objects`,
`profiles`, `register`, `sessions`, `supply`, `system`, `tokens`, `users`

Rejected examples:

- unregistered structured endpoints (`system/eval/code`)
- unknown parameters on registered endpoints
- `evil/get/info`
- absolute URLs
- nested URL/query traversal on `callByUrl`
- traversal segments

### 4. Static renderer-boundary guard

`test/security/renderer-boundary.test.js` fails CI if renderer/shared code
regains:

- Node core imports/requires
- direct `electron` imports/requires
- direct `process.env` / `process.platform` / `process.arch` / `process.cwd`

Allowed privileged files remain limited to `src/main/**`,
`src/keyboard/preload.js`, `src/module_preload.js`, and the isolated v2 preload
under `src/module/**`.

### 5. Expanded contract tests

Additional coverage for:

- unregistered Core RPC endpoint and invalid parameter rejection
- Core RPC URL rejection
- clipboard size bounds
- analytics event validation
- main-window sandbox configuration
- preload no longer importing clipboard/Aptabase renderer SDK

### 6. Main-window document trust enforced

`src/main/renderer.js` now denies popups and rejects navigation or redirects
away from the exact application document. `src/main/main.js` authorizes
privileged IPC using both the expected main-window `webContents` and its trusted
top-frame URL. The application document also ships a restrictive
Content-Security-Policy with no inline script.

The sandbox debug override is available only while the application is
unpackaged; a production environment variable cannot weaken the packaged
renderer sandbox.

### 7. Module isolation and side-effect policy completed

Production and development module WebViews now use the isolated NEXUS v2
preload with `nodeIntegration: false`, `contextIsolation: true`, and
`sandbox: true`. Module pages do not receive React/Emotion libraries, generic
Core RPC, generic networking, raw Electron, or Node access.

External-link opening and clipboard writes are opt-in manifest capabilities.
Each action receives a wallet-owned confirmation and a per-module-session rate
limit. Unique module session partitions deny non-local requests, use a
blackhole proxy for external traffic, and request WebRTC disabling; production
and development modules load only through their assigned module-scoped loopback
asset prefix (`getModuleEntry` returns the loopback file-server URL in both
modes), and the network policy rejects `file:` requests. Packaged-Electron
WebRTC denial remains a manual release gate until the module-partition control
is validated end to end.

### 8. Core lifecycle and bootstrap made data-safe

Start, stop, kill, resync, bootstrap, and application-shutdown operations share
a FIFO lifecycle coordinator. Graceful stop, forced termination, and retries
are owned by the main process, and destructive resync refuses to continue
without confirmed Core shutdown.

Windows process matching handles quoted data directories, compares paths
case-insensitively, and falls back from CIM to legacy WMI and then `tasklist`
discovery.

Bootstrap is disabled and fails closed because the publisher does not provide
an authenticated signed-manifest contract. Re-enabling it requires
pre-extraction authenticity verification and a staged data-directory swap with
rollback; unauthenticated archives are no longer merged into live Core data.

### 9. Cross-platform release checks added

`.github/workflows/security.yml` runs the security suite and complete production
build on Ubuntu, macOS, and Windows. Each runner also creates an unpacked
application with `electron-builder --dir`; interactive wallet/Core smoke tests
remain a manual release gate.

## Removed renderer capabilities

| Former capability | Replacement |
| --- | --- |
| Shared `consts/paths` filesystem bootstrap | `src/main/paths.js` |
| Shared module install/repo/storage Node ports | `src/main/modules.js` + IPC |
| Preload `clipboard.writeText` | `app:write-clipboard` |
| Preload Aptabase renderer SDK | `app:track-event` |
| Namespace-wide structured Core RPC | Concrete endpoint registry and per-endpoint schemas |
| Legacy privileged module bridge | Isolated capability-based NEXUS v2 bridge |
| Default module clipboard/external-link access | Explicit capability + wallet confirmation + rate limit |
| Unauthenticated bootstrap merge | Disabled until signed-manifest and staged-swap contracts exist |

## Remaining release limitations

| Item | Status | Reason |
| --- | --- | --- |
| Bootstrap | Disabled (fail closed) | Publisher has not supplied an authenticated signed-manifest contract |
| Terminal URL/CLI console | Advanced Developer-mode exception | Main-process policy requires persisted Developer mode; ordinary UI uses registered endpoints |
| Interactive packaged GUI/Core matrix | Manual release gate | CI verifies unpacked packaging, but display and controlled Core fixtures are still required |
| Real-module compatibility | Manual release gate | At least one production NEXUS v2 module must be exercised before a release claim |
| Module WebRTC denial | Manual release gate | Verify a module guest cannot create a peer connection or emit STUN/TURN traffic without changing the trusted renderer |

## Test evidence

Commands:

```sh
npm run test:security
npm run build
npx electron-builder --dir --publish never
```

Security tests now include:

- `test/security/startup.test.js`
- `test/security/ipc-handlers.test.js`
- `test/security/contracts.test.js`
- `test/security/core-rpc-registry.test.js`
- `test/security/core-lifecycle.test.js`
- `test/security/core-transport.test.js`
- `test/security/network-policy.test.js`
- `test/security/module-network-policy.test.js`
- `test/security/module-webview-isolation.test.js`
- `test/security/archive-safety.test.js`
- `test/security/renderer-boundary.test.js`

## Manual regression focus for reviewers

- Main window startup in development and packaged production
- Clipboard copy of addresses
- Usage-tracking events when enabled
- Core RPC login/session and ordinary wallet API calls
- Terminal URL/CLI access denied unless Developer mode is enabled
- Core concurrent start/stop, application shutdown, and lite-mode resync
- Bootstrap reports its disabled status without modifying Core data
- Production and development NEXUS v2 module install/launch
- Module external-link/clipboard confirmation and rate-limit behavior
- Module network denial for HTTP(S) and WebSocket paths (packaged-Electron WebRTC/STUN/TURN denial remains a manual release gate)
