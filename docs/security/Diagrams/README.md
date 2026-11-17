# Security diagrams

Mermaid diagrams for the module isolation and network-policy work in this
security track. All diagrams render natively on GitHub.

| Diagram | Contents |
|---|---|
| [module-loopback-transport.md](./module-loopback-transport.md) | How production and development module entries are resolved onto the shared loopback file-server prefix |
| [module-network-policy.md](./module-network-policy.md) | Session-level deny-by-default filtering, blackhole proxy bypass, and what automated tests cover vs the WebRTC manual gate |

Related decision/design docs:

- [`../module-webview-isolation.md`](../module-webview-isolation.md)
- [`../context-isolation-migration-report.md`](../context-isolation-migration-report.md)
- [`../NEXUS_INTERFACE_SECURITY_RELEASE_SUMMARY.md`](../NEXUS_INTERFACE_SECURITY_RELEASE_SUMMARY.md)
- Exchange-track companion: [`../../NewNexusExchange/Diagrams/egress-enforcement.md`](../../NewNexusExchange/Diagrams/egress-enforcement.md)
