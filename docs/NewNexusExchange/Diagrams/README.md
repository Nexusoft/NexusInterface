# NewNexusExchange — Diagrams

Mermaid diagrams supporting the [decision record](../README.md) and [ROADMAP](../ROADMAP.md). All diagrams render natively on GitHub.

| Diagram | Contents |
|---|---|
| [trust-boundaries.md](./trust-boundaries.md) | Trust-boundary map: built-in tab path vs installed-module path, both terminating in the single main-process exchange broker |
| [exchange-sequence.md](./exchange-sequence.md) | Exchange flows: quote → deposit → swap → settle (provider-brokered interim) and the atomic-swap end-state sequence |
| [ltc-connectivity.md](./ltc-connectivity.md) | LTC connectivity topologies: loopback (accepted D2 = 1a), SSH tunnel over VPN, opt-in LAN allowlist (fallback), bundled litecoind (end-state) |
| [egress-enforcement.md](./egress-enforcement.md) | Module egress enforcement architecture (D3 = E3 + E1): shared loopback-prefix transport for prod/dev, session deny-all, blackhole proxy, and WebRTC manual gate |
| [../../security/Diagrams/module-loopback-transport.md](../../security/Diagrams/module-loopback-transport.md) | Security-track diagram: `getModuleEntry` loopback URL resolution for production and development |
| [../../security/Diagrams/module-network-policy.md](../../security/Diagrams/module-network-policy.md) | Security-track diagram: request filter, proxy bypass, automated vs manual coverage |
