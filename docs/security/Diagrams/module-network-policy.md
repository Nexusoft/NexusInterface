# Module network policy

Per-module session partitions enforce deny-by-default networking for production
and development guests.

## Enforcement stack

```mermaid
flowchart TB
    guest["Module guest WebContents\npartition nexus-module:&lt;random&gt;"]
    wr["webRequest.onBeforeRequest\nisAllowedModuleRequest"]
    proxy["setProxy blackhole\nhttp/https → 127.0.0.1:9\nbypass &lt;-loopback&gt; + file-server host"]
    blink["disableBlinkFeatures = WebRTC\nrequested on guest preferences"]
    broker["Allowed side effects only via\nmodule-api:invoke NEXUS v2 broker"]

    guest --> wr
    guest --> proxy
    guest --> blink
    guest -->|"capability-gated IPC"| broker

    wr -->|"allow"| allow["http://127.0.0.1:&lt;port&gt;/modules/&lt;name&gt;/...\ndata: blob: about:blank"]
    wr -->|"deny"| deny["file:\nother hosts/ports\nsibling /modules/ prefixes\nws/wss and non-local http/https"]
```

Implementation:

- `src/main/ipc/moduleNetworkPolicy.js`
- `src/main/webviewSecurity.js` session wiring
- Automated coverage: `test/security/module-network-policy.test.js`

## Automated tests vs manual gate

```mermaid
flowchart LR
    subgraph auto["Automated security tests"]
        a1["Allow module-scoped loopback assets"]
        a2["Deny sibling module prefixes"]
        a3["Deny http/https to other hosts"]
        a4["Deny file: for development and production policies"]
        a5["Proxy blackhole + loopback bypass rules"]
    end

    subgraph manual["Manual release gate"]
        m1["Packaged-Electron RTCPeerConnection denied"]
        m2["No STUN/TURN traffic from module guest"]
        m3["Trusted wallet renderer WebRTC behavior unchanged if required"]
    end
```

Do **not** document WebRTC/STUN/TURN denial as automated coverage. The guest
preference requests WebRTC disabling, but packaged peer-connection behavior is
validated on release builds.
