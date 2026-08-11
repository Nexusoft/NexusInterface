# Trust-boundary map — tab path vs module path

Decision context: [README §1 D1 = H (hybrid)](../README.md#1-decision-record), [README §3 threat model](../README.md#3-threat-model).

Both frontends terminate in the **same** main-process exchange broker. The built-in tab (phase 1) adds no new trust domain; the module path (phase 2) is gated on capabilities *and* on E1 network-layer enforcement.

```mermaid
flowchart TB
    subgraph renderer["Wallet renderer (trusted, no direct egress)"]
        tab["/Exchange tab (first-party UI, phase 1)"]
        send["Send flow (wallet-owned review UI)"]
    end

    subgraph guest["Module guest partitions (untrusted)"]
        mod["Installed module UI (phase 2)"]
    end

    subgraph main["Main process (trusted)"]
        ipc["IPC contracts (src/main/ipc/contracts.js)"]
        v2["NEXUS v2 capability broker (src/main/moduleBroker.js)"]
        ex["Exchange service (broker core)"]
        ad["Provider adapters + EXCHANGE_PROVIDERS allowlist"]
        ltc["LTC RPC transport (PR #36, cookie auth in main)"]
        e1["E1 session-level deny-all (webRequest local-content policy + blackhole w/ loopback bypass; WebRTC suppressed)"]
    end

    subgraph external["External (untrusted)"]
        prov["Exchange providers"]
        node["litecoind (loopback / SSH-forwarded)"]
    end

    tab -->|"invoke"| ipc --> ex
    mod -->|"exchange.* capabilities (declared, not default)"| v2 --> ex
    ex --> ad -->|"HTTPS: timeout, size cap, redirect policy"| prov
    ex -.->|"swap intent only, never funds"| send
    main --- ltc -->|"loopback RPC only"| node
    e1 -. "blocks all direct egress" .-x mod
```

Boundary rules:

1. Funds cross **only** the renderer Send flow with explicit user confirmation; the broker never signs or broadcasts.
2. Neither renderer nor modules ever supply URLs — only opaque provider keys resolved in main.
3. Module guests have **zero** direct network access under D3 (E3 policy, E1 enforcement) — the `exchange.*` capabilities grant broker methods, not egress.
4. litecoind RPC credentials (cookie) never leave the main process.
