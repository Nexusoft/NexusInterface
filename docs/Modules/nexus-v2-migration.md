# Migrating modules to NEXUS v2

## Why this change exists

Nexus Wallet now runs third-party module WebViews with:

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`

The old `global.NEXUS` object injected React, Emotion, wallet components, and
generic Core RPC helpers into the module page. That model is incompatible with
a trustworthy isolation boundary.

NEXUS **v2** is a minimal, versioned, structured-cloneable API exposed only
through Electron `contextBridge` as `window.NEXUS`.

## Breaking changes

| Removed in v2 | What to do instead |
| --- | --- |
| `NEXUS.libraries` (React, ReactDOM, Emotion) | Bundle your own UI runtime in the module package |
| `NEXUS.components.*` | Ship your own components, or plain HTML/CSS |
| `NEXUS.utilities.apiCall` | Not available. Request a named capability if a concrete read is required later |
| `NEXUS.utilities.secureApiCall` | Not available. Spend flows use `wallet.requestSend` only |
| `NEXUS.utilities.color` | Copy the helpers you need into the module |
| Mutable `global.NEXUS = ...` assumptions | Treat `window.NEXUS` as a frozen API surface |
| Raw `require` / `process` / `ipcRenderer` | Unavailable under isolation |

## v2 API surface

```js
const {
  apiVersion, // 2
  walletVersion,
  wallet,
  ui,
  storage,
  state,
} = window.NEXUS;
```

### Wallet context

```js
const ctx = await NEXUS.wallet.getContext();
// ctx.settings.locale, ctx.theme, ctx.core.synchronized, ctx.session.loggedIn, ...

const stop = NEXUS.wallet.onContextChanged((next) => {
  // apply theme/locale updates
});
// later:
stop();
```

Context does **not** include address book entries, session secrets, PINs, API
credentials, or filesystem paths.

### UI helpers

```js
await NEXUS.ui.notify({ content: 'Saved', type: 'success' });
const ok = await NEXUS.ui.confirm({ question: 'Continue?' });
await NEXUS.ui.copyText('NXS...');
await NEXUS.ui.openExternal('https://example.com/docs');
```

`openExternal` allows only `http:`, `https:`, and `mailto:`.

### Module state and storage

```js
await NEXUS.state.set({ tab: 'overview' });
const tabState = await NEXUS.state.get();

await NEXUS.storage.set({ favorites: [] });
const data = await NEXUS.storage.get();
```

Storage is per-module, JSON-only, size-capped, rate-limited, and written by the
main process.

### Send intent (no silent signing)

```js
await NEXUS.wallet.requestSend({
  sendFrom: 'account:...',
  recipients: [{ address: '...', amount: '1.0' }],
  advancedOptions: false,
});
```

This only opens the wallet-owned Send review screen. The user must confirm in
the wallet UI. Modules never receive a generic sign/broadcast API.

## Manifest capabilities

Optional field in `nxs_package.json`:

```json
{
  "name": "my_module",
  "capabilities": [
    "wallet.context",
    "ui.notify",
    "ui.confirm",
    "ui.openExternal",
    "ui.copyText",
    "storage",
    "state",
    "wallet.requestSend"
  ]
}
```

If omitted, the default set above is granted. Unknown capabilities are rejected.

## Bundling your own UI

Recommended production approach:

1. Build the module with Vite/webpack/esbuild.
2. Output static files listed in `nxs_package.json` `files`.
3. Load React/Vue/Svelte/etc. from your bundle — not from the wallet.
4. Call `window.NEXUS` only for wallet integration points.

Minimal no-framework example:

```html
<!doctype html>
<html>
  <body>
    <h1 id="title">Module</h1>
    <script src="app.js"></script>
  </body>
</html>
```

```js
// app.js
async function main() {
  const ctx = await NEXUS.wallet.getContext();
  document.getElementById('title').textContent =
    `Hello from ${ctx.walletVersion}`;
  NEXUS.wallet.onContextChanged((next) => {
    document.body.dataset.theme = next.theme?.primary || '';
  });
}
main();
```

## Compatibility stance

- **Production modules** must target NEXUS v2.
- **Legacy v1 modules** are not part of the production isolation claim.
- Do not expect `contextIsolation: false` or wallet-provided React to return.

See also:

- [Module WebView isolation](../security/module-webview-isolation.md)
- [nxs_package.json](./nxs_package.json.md)
