# NewNexusExchange — Diagrams

Mermaid diagrams supporting the [decision record](../README.md) and [ROADMAP](../ROADMAP.md). All diagrams render natively on GitHub.

| Diagram | Contents |
|---|---|
| [trust-boundaries.md](./trust-boundaries.md) | Trust-boundary map: built-in tab path vs installed-module path, both terminating in the single main-process exchange broker |
| [exchange-sequence.md](./exchange-sequence.md) | Provider-brokered quote → deposit → swap → settle and a link to the direct-swap proposal |
| [../ATOMIC_SWAP_PLAN.md](../ATOMIC_SWAP_PLAN.md) | Direct swap architecture, protocol and recovery-state diagrams, prerequisites and staged implementation |
| [ltc-connectivity.md](./ltc-connectivity.md) | LTC connectivity topologies: loopback (accepted D2 = 1a), SSH tunnel over VPN, opt-in LAN allowlist (fallback), bundled litecoind (end-state) |
| [egress-enforcement.md](./egress-enforcement.md) | Module egress enforcement architecture (D3 = E3 + E1): shared loopback-prefix transport for prod/dev, session deny-all, blackhole proxy, and WebRTC manual gate |
| [../../security/Diagrams/module-loopback-transport.md](../../security/Diagrams/module-loopback-transport.md) | Security-track diagram: `getModuleEntry` loopback URL resolution for production and development |
| [../../security/Diagrams/module-network-policy.md](../../security/Diagrams/module-network-policy.md) | Security-track diagram: request filter, proxy bypass, automated vs manual coverage |
