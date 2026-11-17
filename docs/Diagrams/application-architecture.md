# Application architecture

The wallet UI and isolated modules use separate paths into privileged
functionality. Core API traffic is mediated by the main process.

```mermaid
flowchart TB
    subgraph app["Electron wallet application"]
        renderer["React wallet renderer"]
        preload["Preload / IPC boundary"]
        main["Main process\nIPC handlers / Core RPC"]
        core["Nexus Core HTTP(S) API"]
        settings["Local settings and configuration"]
        fileServer["Loopback module asset server"]
        broker["Capability-gated module API broker"]

        renderer <-->|"approved IPC"| preload
        preload <-->|"validated IPC handlers"| main
        main <-->|"Core RPC"| core
        main <-->|"read / update"| settings
        main --- fileServer
        main --- broker
    end

    subgraph modules["Isolated module guest"]
        module["Module WebView"]
        module -->|"module-scoped assets"| fileServer
        module <-->|"validated module API IPC"| broker
    end
```

Relevant implementation areas:

- `src/shared/lib/api.ts` and `src/main/main.js` — renderer API and IPC
- `src/main/coreRpc.js` — main-process Core transport
- `src/main/moduleFiles.js`, `src/main/webviewSecurity.js`, and
  `src/main/moduleBroker.js` — isolated module assets and broker
