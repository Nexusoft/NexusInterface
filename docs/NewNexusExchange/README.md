# NewNexusExchange — Architecture & Decision Record

> Status: **Accepted** (decisions locked 2026-08-10)
> Scope: fork-first documentation for the NXS↔LTC exchange track in `NamecoinGithub/NexusInterface`
> Companion documents: [ROADMAP.md](./ROADMAP.md) · [Diagrams/](./Diagrams/README.md)
> Related in-repo spec: [`docs/security/exchange-capability-spec.md`](../security/exchange-capability-spec.md)
> Related issues/PRs: [#33](https://github.com/NamecoinGithub/NexusInterface/issues/33) (market-data hardening spec), [#34](https://github.com/NamecoinGithub/NexusInterface/issues/34) (exchange capability), [PR #35](https://github.com/NamecoinGithub/NexusInterface/pull/35) (exchange capability broker, closed draft), [PR #36](https://github.com/NamecoinGithub/NexusInterface/pull/36) (LTC loopback monitor, merged→reverted)

---

## 1. Decision record

| # | Question | Decision | Options considered |
|---|----------|----------|--------------------|
| **D1** | Where does the Exchange live? | **H — Hybrid: built-in shared tab now, module capability later.** Build the main-process exchange broker once; ship a first-party `/Exchange` route + nav item on top of it now; expose the same broker to installed modules via PR #35-style capabilities later. | T (built-in tab only), M (installed module only), **H (hybrid — accepted)** |
| **D2** | How does LTC connectivity work? | **1(a) — User-managed litecoind, loopback-only, resurrect PR #36 after fixing bug B1.** Keep the loopback-only host invariant (`127.0.0.1`/`::1`). For VPN/remote topologies, document an SSH local port-forward (`ssh -L 9332:127.0.0.1:9332 host`) instead of widening the host policy. | **1a (loopback + SSH tunnel docs — accepted)**, 1b (opt-in RFC1918 allowlist), 2 (bundled litecoind), 3 (provider deposit-address swaps), 4 (atomic swaps — retained as research end-state, not connectivity baseline) |
| **D3** | Module egress enforcement? | **E3 with E1 as backstop — broker-only networking forever, enforced by session-level deny-all.** Modules never get direct Internet egress, even with capabilities; all network flows through the main-process broker. E1 (per-partition `webRequest.onBeforeRequest` deny with a **policy-specific local-content allowlist**, blackhole proxy with production loopback bypass, and WebRTC/STUN/TURN suppression for module partitions) enforces this at the network layer so the claim doesn't rest on CSP headers alone. Local-content rules and WebRTC mechanism validation are detailed in [Diagrams/egress-enforcement.md](./Diagrams/egress-enforcement.md) and [ROADMAP Phase 2](./ROADMAP.md#phase-2--egress-enforcement-e1). | E1 (session deny-all), E2 (CSP-only status quo), **E3+E1 (accepted)** |

### Rationale summary

- **D1 = H:** A first-party shared tab does **not** weaken the module security guarantee ("modules can't reach the Internet"). Wallet-owned tabs (Send, Transactions) are main-renderer code whose network runs in the main process — the same trust domain that already fetches market data (`src/main/updater.js` `getMarketData`) and GeoIP (`src/main/ipc/networkPolicy.js`, `https://ipwho.is/`). Routing is one `<Route>` in `src/App/index.tsx` plus one `NavItem` in `src/App/Navigation/index.tsx`. Building the broker once and deferring (not blocking) the module decision is the best long-term shape.
- **D2 = 1(a):** PR #36's transport is architecturally sound (cookie auth in main, frozen RPC allowlist, stale≠connected fixed, config-keyed cache, 17 transport tests). Loopback-only is the smallest reviewed step and preserves the invariant; an SSH local forward works with any VPN topology with zero policy change. Widening to RFC1918 (1b) remains a documented fallback requiring explicit opt-in + warnings, only if SSH forwarding proves unworkable.
- **D3 = E3+E1:** Current enforcement is a CSP header (`connect-src 'none'`) served by the module file server (`src/main/fileServer.js`). That leaves three gaps: development modules load via `file://` (`src/main/moduleFiles.js`, `getModuleEntry`) with **no CSP headers at all**; CSP does not govern WebRTC; and there is no network-layer enforcement. Since `src/main/webviewSecurity.js` already gives each module webview a unique session partition (`nexus-module:<random>`), a per-session deny-all is the correct enforcement point — with a policy-specific local-content allowlist so production modules can load from their loopback file-server prefix and development modules can load from their authorized `file://` root, while all non-local egress stays denied. The same session hook could later grant a narrowly allowlisted egress if that were ever wanted. Under E3, it never is: capabilities grant *broker methods*, not egress.

---

## 2. History: the lost Shell Exchange (and its lesson)

The original in-wallet exchange exists only at old tags, under the pre-2019 `app/` layout (renamed to `src/` in July 2019):

- **Location:** `Nexusoft/NexusInterface` @ tag `Release-0.8.5` (tag object `8cabb0e`), path `app/App/Exchange/` — `index.js`, `Fast.js`, `Precise.js`, `ExchangeForm.js`, `style.css`
- **Provider:** ShapeShift v1 (`shapeshift.io`) — *Precise* (locked quote via `POST /sendamount`) and *Fast* (market rate via `POST /shift`) modes, address validation, deposit-address + countdown modal
- **Death:** commit `c90ab9dc` (2019-01-17), message *"well that sucks Shapeshift changed their api so ow we have to disable it"* — ShapeShift v1 was retired in favor of an account/KYC-required v2. The route and nav item were commented out, never deleted (at that tag).
- **Successor:** `Nexusoft/nexus-market-data-module` — read-only market data (TradeOgre, Xeggex, Coinstore; Bittrex/Binance commented out), **no swap capability**, and it depends on `proxyRequest`, which this fork's v2 isolation removed — so the upstream module is already incompatible with the hardened module API.

**Lesson:** the old Exchange was a renderer UI hardwired to one provider's API shape, with a hardcoded API key in the renderer. When the provider changed, the feature died in a day. Everything in this track therefore puts providers behind a main-process adapter/allowlist (the PR #35 / issue #34 shape) so a provider change is a small adapter fix, not a feature funeral.

---

## 3. Threat model

### 3.1 Assets

1. User funds (NXS, and LTC once connectivity lands) and the credentials that move them (session/PIN, litecoind RPC cookie).
2. The module security guarantee: installed modules cannot reach the Internet or escalate into wallet APIs.
3. Provider trust boundary: quotes, deposit addresses, and order status originate from third parties and are **untrusted input**.
4. Local node surfaces: Nexus core API and litecoind RPC on loopback.

### 3.2 Trust domains

| Domain | Contents | Network access |
|---|---|---|
| Main process | Exchange broker, provider adapters, LTC RPC transport, updater, GeoIP | Full (egress allowlisted per adapter) |
| Wallet renderer | Built-in tabs incl. `/Exchange`; talks to main via IPC contracts | None direct (all via main) |
| Module guests | Installed module webviews, unique session partitions | **None — broker-only (D3/E3), enforced by E1 deny-all** |
| External providers | Instant-exchange APIs, market-data endpoints | Reached only from main-process adapters |
| Local nodes | Nexus core, litecoind (loopback or SSH-forwarded to loopback) | Loopback only (D2) |

### 3.3 Principal threats and mitigations

| Threat | Mitigation |
|---|---|
| Malicious/compromised provider returns hostile payloads (oversized, malformed, homoglyph keys, redirects to internal hosts) | Per-provider adapter normalizes fields; timeouts + `AbortController`; bounded payload size; explicit redirect policy; byte-exact tests for actual provider responses (see §5). Issue #33 patterns apply. |
| Provider substitutes a deposit address (swap theft) | Deposit addresses rendered with explicit user confirmation; funds move **only** through the existing Send flow (`wallet.requestSend` → wallet-owned review UI); broker never signs or broadcasts. |
| Module attempts direct exfiltration (fetch, WebSocket, WebRTC/STUN, dev `file://` gap) | E1: per-partition `webRequest.onBeforeRequest` deny-all with policy-specific local-content allowlist (prod loopback module URL prefix; dev authorized `file://` root) + blackhole proxy (bypass production loopback module origin only) + WebRTC/STUN/TURN suppression on module partitions (mechanism validated in Phase 2); same external deny for production and development modules. E3: no capability ever grants raw egress. |
| Module floods broker (DoS on quotes/submits) | Per-module sliding-window rate limits keyed by `guest.moduleName`, generalized from `consumeStorageWriteQuota` (`src/main/moduleBroker.js`) per spec §4.1; submit throttled more strictly than quote. |
| SSRF via module- or renderer-supplied URLs | Modules/renderer never supply URLs — only opaque `provider` keys resolved against a frozen `EXCHANGE_PROVIDERS` allowlist in main. |
| litecoind RPC credential theft or non-loopback exposure | Cookie auth kept in main process only; host policy restricted to `127.0.0.1`/`::1`; remote nodes reached via SSH local forward so the wallet still only ever dials loopback. |
| Hung provider/endpoint pins IPC promises (current `getMarketData` bug B4) | All broker HTTP has timeout, size cap, and explicit redirect policy; freshness states (fresh/stale/unavailable) surfaced to UI. |

### 3.4 Non-goals

- No custody of LTC private keys inside the Nexus wallet. **Do not import `wallet.dat`** — drive LTC Core's own wallet via authenticated RPC. Importing keys means re-implementing LTC key/tx logic and creates new attack surface.
- No generic network proxy for modules, ever (the `proxyRequest` vector stays dead).
- No client-side capability enforcement: preload-side checks are UX only; the broker enforces server-side.

---

## 4. Architecture (D1 = H)

```
Wallet renderer                          Main process                        External
┌──────────────────┐   IPC contract   ┌──────────────────────┐
│ /Exchange tab    │ ───────────────▶ │ Exchange service      │   HTTPS    ┌───────────┐
│ (first-party UI) │ ◀─────────────── │  (broker core)        │ ─────────▶ │ Providers │
└──────────────────┘                  │  • provider adapters  │            └───────────┘
                                      │  • allowlist/limits   │
┌──────────────────┐  NEXUS v2 API    │  • validation/audit   │   RPC      ┌───────────┐
│ Module guest     │ ───────────────▶ │                       │ ─────────▶ │ litecoind │
│ (phase 2, #35)   │  exchange.* caps │                       │  loopback  │ (loopback │
└──────────────────┘                  └──────────────────────┘             │  or SSH)  │
        ▲  E1 deny-all: no direct egress from module partitions            └───────────┘
```

- **One broker, two frontends.** The main-process exchange service is written once. Phase 1 wires it to the built-in `/Exchange` tab over the existing IPC-contract pattern (`src/main/ipc/contracts.js`). Phase 2 exposes the *same* methods to modules (`exchange.getQuote` / `exchange.submitSwap` / `exchange.getSwapStatus`, gated by the `exchange.quote` / `exchange.submitSwap` capabilities) per PR #35 and `docs/security/exchange-capability-spec.md`.
- **Funds movement:** the broker registers swap intent and reports status. Sending coins always goes through the existing Send flow with explicit user confirmation.
- **LTC connectivity (D2):** PR #36's transport (resurrected after B1) provides loopback-only litecoind RPC with cookie auth held in main. See [Diagrams/ltc-connectivity.md](./Diagrams/ltc-connectivity.md).

Rendered diagrams: [Diagrams/trust-boundaries.md](./Diagrams/trust-boundaries.md), [Diagrams/exchange-sequence.md](./Diagrams/exchange-sequence.md), [Diagrams/egress-enforcement.md](./Diagrams/egress-enforcement.md).

---

## 5. Provider-adapter contract

Every external exchange/market provider is integrated through a main-process adapter that satisfies this contract. **No provider data shape ever leaks past its adapter.**

### 5.1 Interface (conceptual)

| Member | Requirement |
|---|---|
| `key` | Stable opaque identifier; the only thing renderer/modules may reference. Resolved against a frozen `EXCHANGE_PROVIDERS` allowlist; unknown keys → `VALIDATION_FAILED`. |
| `baseUrl`, `timeoutMs`, `maxResponseBytes`, `pairs` | Hardcoded in the allowlist entry; no dynamic registration at runtime. |
| `getQuote(pair, amount)` | Normalizes to `{ rate, min, max, expiresAt }`. |
| `createSwap(quote, refundAddr, payoutAddr)` | Normalizes to `{ orderId, depositAddress, depositAmount, expiresAt }`. |
| `getStatus(orderId)` | Normalizes to a closed enum: `awaiting_deposit \| confirming \| exchanging \| sending \| complete \| failed \| refunded \| expired`. |

### 5.2 Rules (non-negotiable)

1. **Never trust provider field names or shapes.** Normalize through the adapter with explicit tests for the *actual bytes* the provider sends. Precedent: dex-trade's ticker returns `percent_сhange` with a **Cyrillic U+0441 "с"** — `src/main/updater.js` (`getMarketData`) checks both the homoglyph and Latin spellings. Grep lies about such keys, schema validators pass them, and a provider "fixing" their typo silently breaks naive parsers.
2. Every request: `AbortController` timeout from `timeoutMs`, bounded response size, explicit redirect policy, non-2xx mapped to typed errors (`HOST_UNAVAILABLE`).
3. Every response: validated against allowlisted fields, size limits, and format-locked regexes (addresses, pairs, opaque tokens) — same rigor as `validateSendDraft`.
4. Adapters are stateless with respect to secrets; no API keys in the renderer, ever (the 0.8.5 mistake).
5. Adding/removing a provider touches only its adapter + allowlist entry + its byte-exact fixture tests.
6. Audit each call (`audit()` in `src/main/moduleBroker.js` pattern) with provider + pair context — non-sensitive fields only.

---

## 6. Known bugs feeding this track

Full tracking with acceptance criteria lives in [ROADMAP.md](./ROADMAP.md). Summary:

| # | Bug | Where | Severity |
|---|---|---|---|
| B1 | Overview `StatsColumn` absolute/nowrap layout clips when stats are added (blocked PR #36's LTC cards); parent `Main` has `overflow: hidden` | `src/App/Overview/Stats.tsx` (`StatsColumn`), `src/App/index.tsx` (`Main`) | High |
| B2 | One-shot webview entry authorization (`authorizedEntries.delete` at attach) breaks legitimate `<webview>` re-attach after DOM reparenting → dead module pane | `src/main/webviewSecurity.js` (`hardenModuleWebviews`) | Medium |
| B3 | `pendingPoliciesBySession` leaks if guest `web-contents-created` never fires after `will-attach-webview` | `src/main/webviewSecurity.js` | Low |
| B4 | `getMarketData` has no timeout, size cap, or redirect policy; homoglyph key handling has zero test coverage | `src/main/updater.js` | Medium |
| B5 | `market.ts` cache: non-array valid JSON in `localStorage.marketData` throws in `cache.find`; hand-rolled 15-min cache duplicates react-query caching (staleTime 1 h vs 15 m interval) | `src/shared/lib/market.ts` | Low |
| B6 | File-server rate limiter keyed by IP (always loopback) → one bucket shared by all modules; one noisy module can 429-starve the rest | `src/main/fileServer.js` (`isRateLimited`) | Low |
| B7 | Security test suite fails in fresh checkout only because deps weren't installed (`yauzl` missing); 77/77 after `npm ci`. CI should make this loud | `test/security/archive-safety.test.js` | Info |

---

## 7. PR #35 / PR #36 resurrection plan

### PR #36 — LTC loopback monitor (merged → reverted)

Keep: cookie auth in main, frozen RPC allowlist, stale≠connected distinction, config-keyed cache, the 17 transport tests.

Resurrection criteria (all must hold before re-merge):

1. **B1 fixed and merged first** — Overview columns converted to scrollable flex/grid so appended LTC cards are layout-safe at small window sizes.
2. Host policy stays loopback-only per D2 = 1(a); ships with SSH local-forward documentation for VPN/remote litecoind (see [Diagrams/ltc-connectivity.md](./Diagrams/ltc-connectivity.md)).
3. Rebase onto current hardened main; transport tests still 17/17.
4. UI states cover: no node configured / unreachable / stale / connected.

### PR #35 — exchange capability broker (closed draft)

Matches issue #34 and `docs/security/exchange-capability-spec.md`. Under D1 = H it is resurrected in two stages:

1. **Stage 1 (built-in tab):** lift the broker/validators/adapters out of the draft as the main-process exchange service; wire to the `/Exchange` tab via IPC contracts. No module capability exposure yet, so no change to the module trust model.
2. **Stage 2 (module capability):** after E1 egress enforcement has landed, wire the `exchange.getQuote` / `exchange.submitSwap` / `exchange.getSwapStatus` methods into the v2 broker per the spec, gated by the `exchange.quote` / `exchange.submitSwap` capabilities (`CAPABILITIES` but **not** `DEFAULT_CAPABILITIES`; per-module rate limits; server-side enforcement only).

Ordering rationale: upstream the hardening first — #35 builds directly on the v2 broker being upstreamed, and E1 makes the module-path security claim honest before any module-facing exchange surface exists.

---

## 8. Upstreaming order

1. Fix B1 (Overview layout) — small, standalone, upstream-friendly
2. Egress-enforcement PR (E1) — completes the module no-Internet claim; strongest upstream story
3. Upstream the v2 isolation/broker stack (existing hardened work, now provably enforced)
4. Resurrect #36 on top of (1) — LTC monitoring
5. Resurrect #35 / exchange broker + built-in `/Exchange` tab (D1)
6. Atomic-swap research track (D2 end-state, option 4)

The phased checklist with acceptance criteria is in [ROADMAP.md](./ROADMAP.md).

---

## 9. Open questions (tracked, non-blocking)

These refine, but do not block, the locked decisions:

1. **VPN topology detail:** same-machine litecoind behind a VPN kill-switch vs remote box over VPN — decides whether the SSH-forward doc needs a kill-switch caveat. Default answer shipped: SSH local forward, which covers both.
2. **Counterparty risk tolerance:** provider-brokered swaps are an *interim adapter* under D1/D2; atomic swaps (option 4) remain the settlement end-state. If providers become quotes-only, only adapters change — the architecture doesn't.
3. **Upstream target:** hardened-security PRs target `Nexusoft/NexusInterface` `master`; this `docs/NewNexusExchange/` set stays fork-only unless upstream asks for it.
4. **"Resize bug" identity:** B1 (Overview clipping) is the primary suspect; B2 (webview death on reparent) is the second candidate. Both are on the roadmap regardless, so no fix is gated on the confirmation.
