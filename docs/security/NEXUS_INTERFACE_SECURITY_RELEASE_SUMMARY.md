# NexusInterface Security Release Summary

This release consolidates the renderer, Core, module, and PR #42 installation
hardening work together with the critical post-review follow-ups.

## Highlights

- **Electron privilege-boundary hardening**
  - Privileged filesystem/process/network actions stay in the main process behind validated IPC contracts.
  - Renderer and module code no longer receive broad direct access to Electron/Node capabilities.
  - The main window cannot navigate or redirect away from its exact trusted application document, and popups are denied.
  - Privileged main-window IPC verifies both the expected `webContents` and trusted top-frame URL.
  - The application document has a restrictive Content-Security-Policy with no inline script.

- **Core launch and settings restrictions**
  - Core-related settings are validated before use.
  - Main-process launch behavior is constrained to approved configuration fields and safe argument shapes.
  - Structured Core RPC uses a concrete endpoint registry with endpoint-specific request schemas.
  - The broader Terminal URL and CLI capabilities require persisted Developer mode, enforced in main.
  - Core start, stop, kill, resync, bootstrap, and application shutdown share one serialized lifecycle coordinator.
  - Destructive resync requires confirmed Core shutdown before changing the data directory.

- **Module sandbox, path, and install hardening**
  - Production and development module WebViews use NEXUS v2 with `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: true`.
  - Generic Core RPC, proxy networking, raw Electron/Node access, and the legacy production bridge are not exposed to module pages.
  - External-link and clipboard capabilities are opt-in, confirmed by wallet-owned UI for every action, and rate-limited per module session.
  - Module entry, icon, and file paths are kept inside approved module roots.
  - Symlink and realpath-escape defenses protect installed module reads.
  - Mutable directory installs use descriptor-relative/no-follow traversal on supported hosts.
  - Same-destination installs are serialized at publish time so `overwrite: false` cannot be raced into an unintended replacement.
  - Install publication remains staged, verified, atomic, and rollback-capable.

- **Network exposure reduction**
  - The private module asset server binds to loopback (`127.0.0.1`) instead of broader interfaces.
  - Every module receives a unique session partition with deny-by-default request filtering and a blackhole proxy.
  - Production and development modules can load only their assigned module-scoped loopback asset prefix; `file:` navigation and requests are rejected.
  - WebRTC disabling is requested for module guests; packaged-Electron
    peer-connection and STUN/TURN denial remains a manual release gate.

- **Bootstrap fails closed**
  - Unauthenticated bootstrap download/extraction is disabled.
  - Re-enabling bootstrap requires a publisher-defined authenticated signed manifest, verification before extraction, confirmed Core shutdown, and a staged data-directory swap with rollback.

- **Updater dependency remediation**
  - `electron-updater` remains pinned to the remediated dependency set verified by security tests.

- **Cross-platform release assurance**
  - Security tests and all production bundles are configured to run on Ubuntu, macOS, and Windows.
  - Each CI runner creates an unpacked application with `electron-builder --dir`.
  - Interactive packaged-wallet and controlled-Core checks remain a manual release gate.

## Cross-platform compatibility and security tradeoffs

- **POSIX-like hosts:** mutable directory installs are supported with descriptor-relative/no-follow traversal.
- **Windows:** mutable directory installs fail closed because the required traversal guarantees are not available in this implementation.
- **ZIP archives remain supported cross-platform** because extraction occurs into an app-owned temporary directory that can then be validated and published safely.
- **Windows Core discovery:** quoted data directories and case-insensitive path comparison are supported, with CIM, legacy WMI, and `tasklist` discovery fallbacks.

This tradeoff is intentional: Windows directory installs are rejected rather than accepted through a weaker junction-racy path.

## Compatibility notes

- The loopback-only bind applies **only** to NexusInterface’s private module asset server.
- It does **not** change Nexus Core LLP, P2P, staking/mining, or VPN connectivity behavior.
- Existing module packages remain installable, but users on Windows should package mutable module directories as `.zip` archives instead of installing the directory directly.
- Production modules must target the NEXUS v2 API; the privileged v1 bridge is not a supported production fallback.
- Bootstrap is unavailable until an authenticated publisher contract and atomic replacement design are implemented.

## User-visible behavior changes

- Concurrent installs targeting the same module name now produce deterministic results:
  - one publish succeeds,
  - a concurrent `overwrite: false` install fails with `ALREADY_EXISTS`,
  - installs for different module names still proceed in parallel.
- Module requests to open an external link or write the clipboard now show a wallet-owned confirmation and can be throttled.
- Terminal Core URL/CLI commands are rejected unless Developer mode is enabled.
- Overlapping Core lifecycle requests are queued rather than racing.
- Bootstrap requests fail without downloading or changing Core data.
- Failed cleanup of stale internal install directories is now logged and retried later.
- Internal staging/backup directories are quarantined and excluded from module listings/failure reporting.
- Tiny-file module reads no longer allocate the full configured file-size cap up front.

## Migration / operator notes

- No data migration is required for normal users.
- If a stale `.installing-*` or `.replaced-*` directory remains after an interrupted or locked install, the application will exclude it from inventory and retry cleanup later.
- For Windows development workflows, prefer archive-based module installation when testing install behavior.
- Keep Developer mode disabled for normal operation; it is the explicit policy boundary for the advanced Terminal capability.
- Do not re-enable bootstrap by supplying an unauthenticated checksum or URL. The manifest trust root and rollback behavior are part of the required design.

## Testing and validation summary

- Behavioral security regressions cover:
  - trusted main-window navigation, popup, CSP, and IPC sender policy,
  - Core endpoint/parameter allowlisting and Developer-mode Terminal policy,
  - lifecycle serialization, rejection recovery, and Windows process matching,
  - module capability defaults, confirmation/rate-limit policy, and network denial for HTTP(S)/WebSocket/loopback-prefix policy (`file:` rejected; WebRTC remains a manual gate),
  - same-name concurrent installs,
  - different-name concurrent installs,
  - overwrite rollback,
  - lock release after failure,
  - internal-directory quarantine and cleanup confinement,
  - cleanup-failure quarantine behavior, and
  - chunked bounded reads, including over-limit growth.
- Existing symlink, root-confinement, Windows fail-closed, staging verification, and overwrite-preservation security tests continue to pass.
- The cross-platform workflow runs `npm run test:security`, `npm run build`, and an unpacked package smoke check.
- Final verification includes the security test suite, repository build, automated review, CodeQL scanning, and manual packaged-wallet/Core behavior on supported release platforms.
