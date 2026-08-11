# Module WebView context isolation

## Status

Standalone security subproject for third-party module guests.
This work is **not** the primary renderer `contextIsolation` migration
(see `context-isolation-migration-report.md`).

## Decision record: NEXUS v1 compatibility

| Option | Decision |
| --- | --- |
| Migrate all modules silently to v2 | **No** — v1 assumed mutable `global.NEXUS`, React/Emotion bridges, and generic RPC |
| Temporary legacy compatibility mode | **Dev-only, disabled by default, not part of the production security claim** |
| Reject production v1 modules until rebuilt | **Yes** for the production isolation claim |

### Legacy mode rules (if ever enabled later)

1. Disabled by default.
2. Labeled insecure / compatibility-only in UI and docs.
3. Limited to locally installed **development** modules (`nxs_package.dev.json` + `legacyApi: true`).
4. Must not be offered for store/installed production modules.
5. Excluded from any statement that “production modules are isolated.”

**Current implementation:** production and development module WebViews both use
the isolated NEXUS v2 preload (`contextIsolation: true`, `nodeIntegration: false`,
`sandbox: true`). Legacy React/component bridging is not shipped.

## Threat model

| Threat | Mitigations |
| --- | --- |
| Malicious installed module | Process isolation (WebView), no Node/Electron in page, capability broker, open-source policy + hash verification |
| Compromised module update/release | Manifest file allowlist, hash/signature checks, capability defaults are read-only-ish UI + storage |
| Compromised module repository | Existing repo verification / Nexus signature on `repo_info.json` |
| XSS in module content | CSP on module file server, no `file:` reads of wallet data, no Node integration |
| Path traversal (entry/icon/files/storage) | `assertRelativeModulePath`, resolve-under-root checks, symlink policy, storage file name fixed |
| Forged module IPC | Main associates guest `webContents.id` → module identity at attach time; ignores caller-selected identity |
| Renderer compromise forging module auth | Main authorizes privileged actions; host UI actions require main-issued request IDs |
| User approval confusion (spend) | `wallet.requestSend` only navigates to wallet-owned Send review; no silent sign/broadcast |
| Generic proxy SSRF / redirects | `proxyRequest` disabled; no generic network API in v2 |
| External URL abuse | Protocol allowlist `http:`, `https:`, `mailto:` only; blocks `file:`, `javascript:`, `data:` |

## NEXUS API inventory (v1 → v2)

| v1 member | Path | Privileged? | Sensitivity | v2 replacement | Status |
| --- | --- | --- | --- | --- | --- |
| `walletVersion` | preload constant | no | low | `NEXUS.walletVersion` / context | retained |
| `libraries.React/ReactDOM/emotion` | preload bundle | N/A | supply-chain / bridge fragility | **removed** — modules bundle their own UI | removed |
| `components.*` | preload bundle | N/A | same | **removed** | removed |
| `utilities.send` | host `goToSend` | UI navigation | high (leads to spend UX) | `wallet.requestSend(draft)` | replaced |
| `utilities.apiCall` | host `callAPI` → Core RPC | yes | high | **removed** (no generic RPC) | removed |
| `utilities.secureApiCall` | host PIN + Core RPC | yes | critical | **removed** → intent flows only | removed |
| `utilities.showNotification` | host UI | no | low | `ui.notify` | replaced |
| `utilities.show*Dialog` | host UI | no | low | `ui.notify` / `ui.confirm` | narrowed |
| `utilities.confirm` | host UI | no | low | `ui.confirm` | replaced |
| `utilities.updateState` | renderer atom | no | low | `state.get` / `state.set` | replaced |
| `utilities.updateStorage` | main storage.json | yes (write) | medium | `storage.get` / `storage.set` | replaced |
| `utilities.onceInitialize` | host → guest | no | medium (was oversharing) | `wallet.getContext` + `onContextChanged` | replaced |
| `utilities.onWalletDataUpdated` | host → guest | no | medium (address book etc.) | sanitized `onContextChanged` | replaced |
| `utilities.copyToClipboard` | clipboard | yes | medium | `ui.copyText` | replaced |
| `utilities.openInBrowser` | shell | yes | medium | `ui.openExternal` | replaced |
| `utilities.color` | pure helpers | no | none | **removed** (bundle locally) | removed |
| `proxyRequest` (main helper) | axios | yes | critical | **disabled** | removed |

### Wallet context allowed fields (v2)

- `apiVersion`, `walletVersion`
- `theme` (presentation tokens only)
- `settings`: `locale`, `fiatCurrency`, `addressStyle`
- `core`: `connected`, `synchronized`, `connections`
- `session`: `loggedIn`
- `moduleState`, `storageData` (module-owned)

### Explicitly not exposed

Session IDs, PINs, API credentials, raw settings, filesystem paths, address book
by default, account private material, generic Core RPC, generic HTTP proxy.

## Architecture

```
Module page (untrusted)
  └─ contextBridge window.NEXUS (v2)
       └─ module preload (isolated)
            └─ ipcRenderer.invoke('module-api:invoke')
                 └─ main moduleBroker
                      ├─ storage / clipboard / shell.openExternal
                      └─ host request (UI notify/confirm/send/state/context)
                           └─ wallet renderer (untrusted requestor; main still gates)
```

### Guest identity

On `modules:get-entry`, main authorizes the entry URL **and** pre-loads
validated module identity/capability metadata from the installed manifest.
On `will-attach-webview`, main only allows those authorized URLs. On guest
`web-contents-created`, main **synchronously** inserts
`webContents.id → module identity` from the attach policy (no async
manifest I/O on the critical path), so the guest's first
`NEXUS.wallet.getContext()` cannot race an unknown-guest rejection. Every
`module-api:invoke` verifies `event.sender` is that guest.

### WebView preferences (production)

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true` (always; not overridable via environment)
- `webSecurity: true`
- popups denied; permission requests denied
- navigation limited to module origin / dev module root

### File server

- Per-module allowlists from manifest `files`
- Path canonicalization + relative-path validation
- Restrictive CSP and security headers
- No sibling-module reads via global static root

## Capability declarations

Optional `capabilities` array in `nxs_package.json`. Default:

```json
[
  "wallet.context",
  "ui.notify",
  "ui.confirm",
  "ui.openExternal",
  "ui.copyText",
  "storage",
  "state",
  "wallet.requestSend"
]
```

`legacy.api` is rejected for production modules.

## Audit events

Broker logs non-sensitive records: module id/version/hash, method, capability,
outcome, reason, timestamp. No PINs, credentials, or raw secret payloads.

## Related files

- `src/module/preload/*` — v2 preload
- `src/main/moduleBroker.js` — capability broker
- `src/main/ipc/moduleApiV2.js` — runtime contract
- `src/shared/modules/nexusApiV2.ts` — TypeScript contract
- `src/main/webviewSecurity.js` — attach hardening
- `src/main/fileServer.js` — static module assets
- `src/shared/lib/modules/webview.tsx` — host UI relay
- `fixtures/modules/*` — smoke + malicious fixtures
- `test/security/module-webview-isolation.test.js`
