# Module loopback transport

Both production and development module WebViews load through the private
loopback module file server. There is no authorized `file:` guest root in the
implemented transport.

## Entry resolution

```mermaid
flowchart LR
    host["Wallet host UI modules:get-entry"]
    main["Main process authorizeModuleEntry + getModuleEntry"]
    root["resolveModuleRoot name → root + development flag"]
    pkg["Read nxs_package.json or nxs_package.dev.json"]
    resolve["resolveModuleFile root, entry under module root"]
    url["Return loopback URL\nfileServerDomain/modules/name/entry"]
    attach["will-attach-webview only allows authorized loopback src"]

    host --> main --> root --> pkg --> resolve --> url --> attach
```

Key sources:

- `src/main/moduleFiles.js` `getModuleEntry` always returns
  `` `${fileServerDomain}/modules/${name}/${entry}` ``
- `src/main/webviewSecurity.js` `moduleUrlPrefix` and `isAllowedNavigation`
  require the same prefix
- `src/main/fileServer.js` binds the private asset server to `127.0.0.1`

## Production vs development

```mermaid
flowchart TB
    subgraph shared["Shared transport"]
        fs["Loopback file server 127.0.0.1"]
        prefix["/modules/&lt;moduleName&gt;/..."]
        fs --> prefix
    end

    prod["Production module\nnxs_package.json"]
    dev["Development module\nnxs_package.dev.json"]
    prod --> shared
    dev --> shared

    deny["Rejected for both modes"]
    deny --> f["file: URLs"]
    deny --> sib["Sibling module prefixes"]
    deny --> ext["Non-local HTTP(S)/WebSocket"]
```

Development still resolves files from the developer-selected module root on
disk, but the **guest document URL** and **network allowlist** are the loopback
prefix, not a `file:` root. That keeps CSP headers, path allowlisting, and
session policy aligned with production.
