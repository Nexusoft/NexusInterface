# Final report: Module WebView isolation

## Summary

Third-party module WebViews now run behind a versioned **NEXUS v2** bridge with
main-process capability brokerage. Production guests no longer receive React
libraries, generic Core RPC, or a network proxy.

## Capabilities removed

- `NEXUS.libraries` / `NEXUS.components`
- `utilities.apiCall` / `utilities.secureApiCall`
- `proxyRequest` generic HTTP proxy
- Raw `ipcRenderer`, `require`, `process`, Node core, Electron APIs in module pages
- Address book push into modules by default
- Caller-controlled incremental IPC return channels as the primary RPC style
- `contextIsolation=no` / `nodeIntegration=yes` for production module WebViews

## Capabilities retained (v2)

- Read-only sanitized wallet context + change subscription
- UI notify / confirm
- Opt-in external open (`http`/`https`/`mailto`) via a confirmed, rate-limited
  main-process action
- Opt-in clipboard write via a confirmed, rate-limited main-process action
- Per-module JSON storage and in-memory module state
- Send **intent** navigation to wallet-owned review UI

## Legacy exceptions

- None enabled for production modules.
- Legacy channel handlers in the host renderer reject privileged v1 channels and
  only keep narrow non-RPC shims for transitional guests.
- Legacy mode is documented as disabled-by-default and excluded from the
  production security claim.

## Test evidence

Automated (see `npm run test:security`):

- Module API contract validation (`moduleApiV2`)
- WebView preference hardening expectations
- Preload bridge shape (no React/ipc export to page)
- File server allowlisting / path rules (static review)
- Per-session network denial / proxy policy for production and development
  modules (shared module-scoped loopback asset prefix; `file:` rejected).
  Packaged-Electron WebRTC/STUN/TURN denial remains a manual release gate.
- Renderer boundary still forbids Node imports outside main/preload
- Malicious fixture static checks

Manual matrix (pre-release):

- [ ] Install verified production module
- [ ] Launch/close repeatedly
- [ ] Update module
- [ ] Development module launch
- [ ] Module icon rendering
- [ ] Theme and locale updates propagate
- [ ] Send draft handoff shows module name
- [ ] External link opens in OS browser
- [ ] Offline core behavior
- [ ] Packaged app on Windows, macOS, Linux

## Conditions before claiming production module isolation

1. Security tests green in CI (`test:security` + preload/main/renderer builds).
2. No production code path sets module `contextIsolation` false.
3. No production preload assigns `global.NEXUS` libraries/components.
4. `proxyRequest` remains disabled.
5. Module-session egress denial remains enabled for production and development.
6. At least one real production module migrated to v2 and smoke-tested.
7. Manual matrix above completed on target platforms.
8. Docs published: isolation threat model + v2 migration guide.

## Key paths

- Docs: `docs/security/module-webview-isolation.md`, `docs/Modules/nexus-v2-migration.md`
- Contract: `src/shared/modules/nexusApiV2.ts`, `src/main/ipc/moduleApiV2.js`
- Broker: `src/main/moduleBroker.js`
- Preload: `src/module/preload/*`
- Hardening: `src/main/webviewSecurity.js`, `src/main/fileServer.js`
