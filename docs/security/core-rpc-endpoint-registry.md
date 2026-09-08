# Core RPC endpoint registry

## Purpose

Structured Core API traffic from the renderer (`core-rpc:call` via
`window.nexusElectron.coreRpc.call` / `callAPI`) is restricted to a **concrete
endpoint registry** with **per-endpoint request schemas**.

This replaces the earlier namespace-only allowlist for structured calls.

## Sources of truth

| Layer | Location | Role |
| --- | --- | --- |
| TypeScript surface | `src/shared/lib/api.ts` (`callAPI` / `listAll` overloads) | Compile-time endpoint + param shapes; **no** `endpoint: string` escape hatch |
| Runtime registry | `src/main/ipc/coreRpcRegistry.js` | Allowlisted endpoints and field validators used by main |
| IPC contracts | `src/main/ipc/contracts.js` (`validateCoreRpcRequest`) | Shared validation entry point for main / tests |

The registry is built from the wallet's typed API surface and live call sites
under `src/`.

## Structured call policy (`core-rpc:call`)

Rejected when:

- the endpoint is not in `CORE_RPC_ENDPOINT_REGISTRY`
- a parameter name is not declared for that endpoint (unless the endpoint
  explicitly allows additional primitive fields, e.g. `assets/update/asset`)
- PIN / password / session / recipient / query fields are the wrong type or
  outside bounds
- parameter objects use dangerous keys (`__proto__`, `constructor`, …)
- the payload is larger than 64 KiB

Multi-user `session` handling:

- main owns the active session used by ordinary structured RPCs
- caller-provided sessions are stripped from ordinary RPCs and main injects its
  active session
- explicit session values are honored only by selected session-management
  endpoints and must be a single opaque id (`[A-Za-z0-9_-]{8,128}`)
- arrays/objects/prototype-polluting shapes are rejected

## Terminal / console exception (`core-rpc:call-by-url`)

The Nexus API console (Terminal → URL syntax) uses
`window.nexusElectron.coreRpc.callByUrl` → `core-rpc:call-by-url`.

This is a **named, constrained console capability**, not the structured
registry:

- persisted Developer mode must be enabled; both URL and CLI console handlers
  enforce this policy in the main process
- relative Core API paths only (no absolute URLs, fragments, or traversal)
- first path segment must be in `ALLOWED_CORE_CONSOLE_RPC_NAMESPACES`
- query strings are allowed for console ergonomics
- CLI syntax goes through `core:execute-console-command` (separate validator)

Do not use `callByUrl` for ordinary wallet UI flows. Prefer `callAPI` so
endpoint-specific schemas apply.

## Logging

IPC failure logging redacts known credential/session parameter shapes before
writing to `electron-log`. Validators never echo secret values in
`TypeError` messages.

## Tests

See `test/security/core-rpc-registry.test.js` and
`test/security/contracts.test.js`.
