# NEXUS v2 Exchange Capability — Requirements & Strategy

> Tracking issue: [NamecoinGithub/NexusInterface#34](https://github.com/NamecoinGithub/NexusInterface/issues/34)
> Depends on: [PR #32](https://github.com/NamecoinGithub/NexusInterface/pull/32) — Isolate module WebViews with NEXUS v2 contextBridge API

## 1. Purpose

This document is the working spec for adding `exchange.quote` / `exchange.submitSwap` capabilities to the NEXUS v2 module API, enabling a future in-wallet NXS↔LTC (and other pairs) exchange module — without reintroducing the generic `proxyRequest` SSRF vector that PR #32 removed.

Hand this document to the coding agent as the primary task brief. It supersedes ad-hoc chat drafts; where this doc and the linked issue disagree, this doc wins.

## 2. Background

- PR #32 hardened module WebViews (`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`), replaced the old React-bridging preload with a minimal `contextBridge` API, added a main-process capability broker, and **disabled `proxyRequest` entirely**.
- The exchange/swap feature needs *some* way to fetch rates and submit swap orders to an external provider. A generic network proxy is explicitly out of scope/rejected — this must be a narrow, allowlisted, capability-gated surface.
- Actual fund movement must **never** be handled by this new surface. It continues to flow exclusively through the existing `wallet.requestSend` → wallet-owned Send review UI, which requires explicit user confirmation and never exposes signing/broadcast to a module.

## 3. Non-negotiable security invariants

1. Modules never supply a raw URL — only an opaque `provider` key. The main process resolves `provider` against a hardcoded allowlist (`EXCHANGE_PROVIDERS`); unknown keys are rejected.
2. `exchange.submitSwap` never grants signing or broadcasting. It only registers swap intent with a provider and returns an order id/status.
3. All outbound provider HTTP calls have a timeout/abort so a slow or malicious provider cannot hang the broker for other modules.
4. Per-module rate limits apply to both quote and submit calls, with submit throttled more strictly than quote (submissions are consequential, quotes are cheap/frequent).
5. Capability checks are enforced **server-side only** (in the main-process broker). Any client-side/preload-side capability gating is a UX convenience, never a security boundary — a compromised module page must not be able to escalate itself into the `exchange` namespace by tampering with anything it can observe or control.
6. `exchange.quote` / `exchange.submitSwap` are **not** part of `DEFAULT_CAPABILITIES` — a module's `nxs_package.json` must explicitly declare them.
7. All payloads are validated against allowlisted fields, size limits, and format-locked regexes (provider identifier, `BASE/QUOTE` pair, opaque tokens) — same rigor as the existing `validateSendDraft`.

## 4. Requirements checklist (acceptance criteria)

### 4.1 Main-process broker — `src/main/moduleBroker.js`
- [ ] `EXCHANGE_PROVIDERS` allowlist constant: `{ [providerKey]: { baseUrl, pairs: string[], timeoutMs } }`, frozen, hardcoded (no dynamic registration at runtime).
- [ ] `resolveProvider(providerKey)` throws `ERROR_CODES.VALIDATION_FAILED` for unknown keys.
- [ ] Rate limiting: `exchangeQuoteBuckets` / `exchangeSubmitBuckets` maps, keyed by `guest.moduleName`, using a generalized `consumeRateLimit(bucketMap, key, limit, windowMs, label)` helper (refactor `consumeStorageWriteQuota` into this shared helper or add a parallel one — don't duplicate the sliding-window logic three times).
  - Suggested defaults: quote = 20/min, submit = 5/min per module. Confirm/tune with the team before shipping.
- [ ] `fetchProviderJson(provider, path, { method, body })` — wraps `fetch`/Electron `net` with `AbortController` timeout derived from `provider.timeoutMs`; maps timeout/non-2xx to `ERROR_CODES.HOST_UNAVAILABLE`.
- [ ] Wire `exchange.getQuote`, `exchange.submitSwap`, `exchange.getSwapStatus` into `handleInvoke`'s method switch, following the existing pattern (validate → capability already checked by `assertCapability` → rate-limit → resolve provider → call → audit).
- [ ] Extend `audit()` call sites for these methods to include `provider` and `pair` in the `reason`/context fields (non-sensitive only — no amounts/PII beyond what's already logged elsewhere).

### 4.2 Runtime contract — `src/main/ipc/moduleApiV2.js`
- [ ] Add `EXCHANGE_QUOTE` (`'exchange.quote'`) and `EXCHANGE_SUBMIT_SWAP` (`'exchange.submitSwap'`) to `CAPABILITIES`. Do **not** add to `DEFAULT_CAPABILITIES`.
- [ ] Add `EXCHANGE_GET_QUOTE`, `EXCHANGE_SUBMIT_SWAP`, `EXCHANGE_GET_SWAP_STATUS` to `METHODS`.
- [ ] Add corresponding entries to `METHOD_CAPABILITY` (`getSwapStatus` maps to the `quote` capability — it's a read, not a write).
- [ ] Implement validators, following `validateSendDraft`'s style (allowlisted keys, `assertString`/`assertRecord`, explicit `fail(...)` on anything unexpected):
  - `validateExchangeQuote({ provider, pair, amount })`
  - `validateExchangeSwap({ provider, pair, amount, quoteId })` — should reuse quote validation internally rather than duplicating the provider/pair/amount checks.
  - `validateExchangeSwapStatus({ provider, orderId })`
  - Format rules: `provider` matches `/^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$/`; `pair` matches `/^[A-Z0-9]{2,10}\/[A-Z0-9]{2,10}$/`; `amount` is a positive decimal string; `quoteId`/`orderId` match `/^[A-Za-z0-9_-]+$/` with a max length (128).
- [ ] Wire the three new methods into `validateInvokeRequest`'s switch statement.
- [ ] Export the three new validators from the module.

### 4.3 TypeScript contract — `src/shared/modules/nexusApiV2.ts`
- [ ] Add types: `NexusExchangePair`, `NexusExchangeQuoteRequest`, `NexusExchangeQuote`, `NexusExchangeSwapRequest`, `NexusExchangeSwapState`, `NexusExchangeSwapResult`, `NexusExchangeSwapStatusRequest`, `NexusExchangeSwapStatus`.
- [ ] Extend `NexusModuleCapability` and `NexusModuleMethod` unions with the new values.
- [ ] Add **optional** `exchange?: { getQuote, submitSwap, getSwapStatus }` namespace to `NexusModuleApiV2`. Optional/undefined-safe so consumers must feature-detect (`NEXUS.exchange?.getQuote(...)`).

### 4.4 Preload bridge — `src/module/preload/`
- [ ] New `capabilities.ts`: reads the module's resolved capability list from `webPreferences.additionalArguments` (format: `--nexus-capabilities=<encodeURIComponent(JSON.stringify(capabilities))>`). Exposes `hasCapability(name)`. Must fail safe (empty set) on any parse error.
- [ ] `validation.ts`: add `assertExchangeProvider`, `assertExchangePair`, `assertExchangeAmount`, `assertExchangeOpaqueToken` — client-side mirrors of the main-process validators. These are defense-in-depth only; main-process validation remains authoritative.
- [ ] `bridge.ts`: `createApi()` builds the `exchange` namespace only when `hasCapability('exchange.quote') || hasCapability('exchange.submitSwap')` is true; otherwise the key is omitted entirely from the returned/frozen object (not merely `undefined`).

### 4.5 Main-process wiring — `webviewSecurity.js` / module authorization
- [ ] Extend `authorizeModuleEntry` (or wherever the module policy is built) to resolve capabilities via `normalizeManifestCapabilities` at authorization time and store them on the policy object.
- [ ] Update `hardenModuleWebviews`'s `will-attach-webview` handler to set `webPreferences.additionalArguments` with the resolved capability list, alongside the existing forced `contextIsolation`/`sandbox`/`nodeIntegration` overrides.

### 4.6 Tests
- [ ] Main-process validator unit tests: valid/invalid `provider`, `pair`, `amount`, `quoteId`/`orderId` for all three new validators.
- [ ] Client-side preload validator unit tests (same matrix, mirrored).
- [ ] Security test: a module without the capability sees `window.NEXUS.exchange === undefined`, **and** a broker-level test confirms `assertCapability` rejects an `exchange.*` invoke from such a module even if it fabricates a request — i.e., prove the server-side check is the real boundary, not the preload gating.
- [ ] Security test: `resolveProvider` rejects any key not in `EXCHANGE_PROVIDERS`.
- [ ] Rate limit test: exceeding quote/submit thresholds within the window returns `ERROR_CODES.RATE_LIMITED`, and resets after the window elapses.
- [ ] Timeout test: `fetchProviderJson` aborts and returns `HOST_UNAVAILABLE` when a provider doesn't respond within `timeoutMs`.

### 4.7 Docs
- [ ] `docs/Modules/nxs_package.json.md` — document the two new `capabilities` values.
- [ ] `docs/Modules/nexus-v2-migration.md` — add an "Exchange (optional)" section with example usage.
- [ ] `docs/security/module-webview-isolation.md` — add the new methods to the v1→v2 / threat model tables, noting the allowlist-only provider resolution as the mitigation for SSRF.

## 5. Out of scope (explicitly not part of this issue)

- The actual exchange/swap module UI and its `nxs_package.json` (tracked separately once this API lands).
- Choosing/onboarding the real production LTC swap provider(s) — `EXCHANGE_PROVIDERS` should ship with zero or a test-only entry until a vetted provider is selected.
- Any change to `wallet.requestSend` itself.
- Reviving `proxyRequest` in any form.

## 6. Suggested implementation order

1. Runtime contract additions (`moduleApiV2.js`) — capabilities, methods, validators. Pure functions, easiest to unit test in isolation.
2. Broker wiring (`moduleBroker.js`) — allowlist, rate limits, fetch helper, method handlers.
3. Main-process capability propagation (`authorizeModuleEntry` + `will-attach-webview`).
4. Preload (`capabilities.ts`, `validation.ts`, `bridge.ts`).
5. TypeScript contract (`nexusApiV2.ts`) — can be done in parallel with 1–2 since it's type-only.
6. Tests for each layer as it's built, not deferred to the end.
7. Docs last, once the API shape is final.

## 7. Definition of done

- All checklist items in Section 4 are complete and covered by tests.
- `npm run test:security` passes.
- No production code path exposes a caller-supplied URL to an outbound request.
- A module manifest without `exchange.*` capabilities cannot invoke any `exchange.*` method (broker-enforced) and does not see the `exchange` object on `window.NEXUS` (preload UX).
- Docs updated per Section 4.7.
- PR references this document and issue #34, and calls out any deviations from this spec with rationale.
