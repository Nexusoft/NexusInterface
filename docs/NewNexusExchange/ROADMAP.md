# NewNexusExchange — Roadmap

> Phased checklist implementing the [decision record](./README.md) (D1 = H, D2 = 1a, D3 = E3+E1).
> Order mirrors [README §8 upstreaming order](./README.md#8-upstreaming-order); each phase is intended to be its own small, reviewable PR (or PR series).
> Diagrams: [Diagrams/](./Diagrams/README.md)

## Phase 1 — Fix B1: Overview layout (unblocks everything visual)

Standalone, upstream-friendly. Must land before PR #36 resurrection.

- [ ] Convert Overview stat columns (`StatsColumn` in `src/App/Overview/Stats.tsx`) from `position: absolute` + `top: 50%`/`translateY(-50%)` + `whiteSpace: nowrap` to a scrollable flex/grid layout that accommodates a variable number of stat cards
- [ ] Remove reliance on the ≤720px font-scaling media query as the only small-screen mitigation
- [ ] Verify no clipping under parent `Main` (`overflow: hidden`, `src/App/index.tsx`) at small window sizes, with and without the globe (`compact` variants)
- [ ] Regression-check both animation directions (`slideRight`/`slideLeft`) and left/right column alignment
- [ ] Manual matrix: minimum supported window size × `overviewDisplay` settings × featured-token on/off
- [ ] Confirm whether the reported "Resize Bug" reproduces here (B1) or in the module pane (B2); attach repro note to the fix PR

## Phase 2 — Egress enforcement (E1)

Completes the "modules can't reach the Internet" claim; strongest upstream story. See [Diagrams/egress-enforcement.md](./Diagrams/egress-enforcement.md).

- [ ] Per-module-partition `webRequest.onBeforeRequest` deny-all in the session created by `src/main/webviewSecurity.js`, using a **policy-specific local-content allowlist** (not a single shared origin):
  - [ ] **Production:** allow only that module's assigned **loopback module URL prefix** (`getDomain()` + `/modules/<name>/` from `src/main/fileServer.js` / `moduleUrlPrefix` in `webviewSecurity.js`)
  - [ ] **Development:** allow only **`file://` URLs under the module's authorized root** (entry + in-root assets from `getModuleEntry` / `resolveModuleRoot` in `src/main/moduleFiles.js`)
  - [ ] Deny all non-local HTTP(S), WebSocket, and other external schemes/hosts in both modes
- [ ] Blackhole `setProxy` on module partitions as defense in depth, with an **explicit bypass for the production loopback module-server origin** so legitimate prod asset loads are not blackholed; no broad external proxy escape
- [ ] **WebRTC suppression (mechanism-validation spike, not a one-line assumed control):** demonstrate an Electron-compatible mechanism that blocks STUN/TURN and peer-connection traffic for **module partitions** without unintentionally changing the **trusted wallet renderer**. Prefer per-session / per-guest controls when available; if only an application-wide disable exists, document whether that blast radius is acceptable before implementing. D3's security objective (no module WebRTC egress) stands either way — this item is about honest feasibility, not relaxing the goal.
- [ ] Apply the same session-level deny-all + local-content policy pattern to development modules (closes the `file://` no-CSP gap from `src/main/moduleFiles.js` `getModuleEntry` without blocking dev entry/assets)
- [ ] Keep the file-server CSP (`src/main/fileServer.js`) as defense in depth, not the primary control
- [ ] Fix B2: make webview entry authorization tolerate legitimate re-attach after DOM reparenting (one-shot `authorizedEntries.delete` in `hardenModuleWebviews`, `src/main/webviewSecurity.js`)
- [ ] Fix B3: clean up `pendingPoliciesBySession` when an attach aborts before guest `web-contents-created`
- [ ] Security tests cover **both** local-content policies:
  - [ ] Production loading mode: module entry/assets on the loopback file-server prefix load; direct `fetch`/WebSocket/WebRTC (or equivalent peer-connection/STUN) attempts to non-local targets are blocked; broker path still works
  - [ ] Development loading mode: authorized `file://` entry/in-root assets load; the same non-local `fetch`/WebSocket/WebRTC attempts are blocked; broker path still works
  - [ ] Negative checks: prod mode cannot load arbitrary `file://`; dev mode cannot reach non-allowlisted hosts even though CSP headers are absent
- [ ] Fix B7 while touching tests: make CI fail loudly when security-test deps are missing (fresh checkout without `npm ci` → `yauzl` missing breaks `test/security/archive-safety.test.js`)

## Phase 3 — Upstream the v2 isolation/broker stack

- [ ] Prepare the hardened v2 isolation/broker work (context isolation, capability broker, `proxyRequest` removal) as upstream PRs against `Nexusoft/NexusInterface` `master`
- [ ] Include Phase 2 so the no-Internet claim is provably enforced, not just asserted
- [ ] Keep `docs/NewNexusExchange/` fork-only unless upstream requests it
- [ ] Track upstream review feedback; keep fork divergence minimal and rebased

## Phase 4 — Resurrect PR #36: LTC loopback monitor (D2 = 1a)

Criteria from [README §7](./README.md#7-pr-35--pr-36-resurrection-plan); topology diagrams in [Diagrams/ltc-connectivity.md](./Diagrams/ltc-connectivity.md).

- [ ] Rebase #36 onto current main after Phase 1 (B1) is merged
- [ ] Preserve: cookie auth in main only, frozen RPC method allowlist, stale≠connected, config-keyed cache
- [ ] Transport tests green (17/17) on the rebase
- [ ] Host policy stays loopback-only (`127.0.0.1`/`::1`); no RFC1918 widening
- [ ] Document SSH local forward (`ssh -N -L 9332:127.0.0.1:9332 user@host`) for VPN/remote litecoind, including kill-switch degradation behavior
- [ ] Overview LTC cards verified layout-safe at small sizes on the Phase 1 layout
- [ ] UI states: no node configured / unreachable / stale / connected
- [ ] Fallback 1b (explicit opt-in host allowlist + warnings) documented as rejected-by-default; only revisit if SSH forwarding proves unworkable

## Phase 5 — Exchange broker + built-in `/Exchange` tab (D1 = H, stage 1) and module capability (stage 2)

Contract in [README §5](./README.md#5-provider-adapter-contract); flows in [Diagrams/exchange-sequence.md](./Diagrams/exchange-sequence.md); spec in [`docs/security/exchange-capability-spec.md`](../security/exchange-capability-spec.md).

### Stage 1 — main-process service + first-party tab

- [ ] Lift broker/validators from the PR #35 draft into a main-process exchange service (no module wiring yet)
- [ ] Frozen `EXCHANGE_PROVIDERS` allowlist; opaque provider keys only; unknown keys → validation error
- [ ] Provider adapters per README §5: normalize fields, `AbortController` timeouts, bounded payload, explicit redirect policy, typed errors
- [ ] Byte-exact fixture tests per provider (homoglyph precedent: dex-trade `percent_сhange`, Cyrillic U+0441, `src/main/updater.js`)
- [ ] Generalize `consumeStorageWriteQuota` (`src/main/moduleBroker.js`) into the shared sliding-window `consumeRateLimit(bucketMap, key, limit, windowMs, label)` helper (spec §4.1)
- [ ] `/Exchange` route in `src/App/index.tsx` + `NavItem` in `src/App/Navigation/index.tsx`; UI wired over IPC contracts
- [ ] Funds move only via existing Send flow prefill + user confirmation; broker never signs/broadcasts
- [ ] Audit logging with provider + pair context (non-sensitive fields only)
- [ ] Related cleanups while in the area:
  - [ ] B4: `getMarketData` (`src/main/updater.js`) gets timeout, size cap, redirect policy, freshness states (issue #33 spec); add homoglyph-key test coverage
  - [ ] B5: collapse `src/shared/lib/market.ts` double-caching into react-query only; guard non-array `localStorage.marketData`
  - [ ] B6: per-module rate-limit keys in `src/main/fileServer.js` (IP key is always loopback → one shared bucket)

### Stage 2 — module capability exposure (after Phase 2 + Phase 3)

- [ ] Wire `exchange.getQuote` / `exchange.submitSwap` / `exchange.getSwapStatus` into the v2 broker per the spec
- [ ] Add `EXCHANGE_QUOTE` / `EXCHANGE_SUBMIT_SWAP` to `CAPABILITIES`, **not** `DEFAULT_CAPABILITIES` (explicit `nxs_package.json` declaration required)
- [ ] Per-module rate limits: submit throttled more strictly than quote (suggested 20/min quote, 5/min submit; confirm before shipping)
- [ ] Server-side capability enforcement only; preload gating is UX
- [ ] Module egress remains zero (E3) — capabilities grant broker methods, never raw networking

## Phase 6 — Atomic-swap research track (D2 end-state)

Sequence in [Diagrams/exchange-sequence.md §2](./Diagrams/exchange-sequence.md#2-atomic-swap-end-state-research-track-htlcadaptor).

- [ ] Research spike: HTLC vs adaptor-signature designs for NXS↔LTC; document on-chain requirements on the Nexus contract side
- [ ] Define the litecoind wallet-RPC surface needed for HTLCs; extend the frozen RPC allowlist via its own security review (monitor allowlist stays read-only until then)
- [ ] **Never import `wallet.dat`** — drive LTC Core's own wallet via authenticated loopback RPC (re-implementing LTC key/tx logic is rejected attack surface)
- [ ] Refund-path handling (timeouts T1/T2), fee estimation, and failure UX defined before any mainnet exposure
- [ ] Testnet end-to-end swap prototype behind a development flag
- [ ] Decide provider role post-atomic-swaps: quotes-only adapters vs full brokered fallback

## Cross-cutting bug ledger

| Bug | Phase | Status |
|---|---|---|
| B1 Overview stats overflow (`src/App/Overview/Stats.tsx`) | 1 | Open |
| B2 One-shot webview authorization vs reparenting (`src/main/webviewSecurity.js`) | 2 | Open |
| B3 `pendingPoliciesBySession` leak (`src/main/webviewSecurity.js`) | 2 | Open |
| B4 `getMarketData` timeout/size/redirect (`src/main/updater.js`) | 5 | Open |
| B5 `market.ts` cache fragility/double-caching (`src/shared/lib/market.ts`) | 5 | Open |
| B6 File-server shared rate bucket (`src/main/fileServer.js`) | 5 | Open |
| B7 Security tests need `npm ci` loudness (`test/security/archive-safety.test.js`) | 2 | Open |
