# Wallet bug review - November 2026

This reviews the supplied findings against the `Merging` branch. These are
latent failure paths, not evidence that funds were misdirected or that a user
has encountered them. Severity below retains the original potential-impact
ranking; likelihood has not been measured. No functional finding was dismissed
solely because it was difficult to reproduce.

## Updated bug list

| Priority | Finding | Status and minimal correction |
| --- | --- | --- |
| High | Stale recipient-name response can overwrite a newer recipient | **Fixed.** Results are accepted only while the originating effect is active and its input is current. Changing to another name, an address, an empty input, or unmounting invalidates the response. |
| High | One failed API probe can force-restart a running Core | **Fixed.** Existing processes get the same bounded readiness polling as a fresh start. A timeout reports a connection error without killing/replacing Core. An explicit restart is still available. |
| High | `system/stop` can reach a different Core on the configured port | **Fixed.** Graceful API stop requires an OS listener-ownership check against the datadir-matched PID. If ownership cannot be established, no stop RPC is sent. POSIX uses a revalidated, PID-targeted `SIGTERM`; the existing bounded, PID-revalidated force-stop fallback remains. |
| High | Prerelease updates never begin downloading | **Fixed.** Prerelease selection no longer disables automatic downloads. Channel selection and downgrade protection are unchanged. |
| High | Timed force-exit can interrupt asynchronous macOS installation | **Fixed.** Removed the 1.5-second exit timer. Installation waits for Electron's native `before-quit-for-update` event before removing the window's close/beforeunload blockers. |
| Medium | Updating `nexus.conf` drops comments and repeated directives | **Fixed.** The atomic, mode-0600 write patches only changed/deleted keys into the original text. Unrelated repeated directives, comments, blank lines, BOM and newline style survive. The obsolete SSL-port alias is still migrated. |
| Medium | Menu/tray quit bypasses remote logout-on-close | **Fixed.** Remote logout now runs inside the main-process quit coordinator, covering window close, menu, tray, OS quit and update installation without depending on the renderer. Single-/multi-user modes are distinguished; rejected or unconfirmed termination cancels quit. |
| Medium | Missing Core executable prevents normal exit | **Fixed.** Process discovery uses the configured path/name without requiring that executable to exist. Starting Core still requires a valid executable. |
| Medium | Asynchronous Core spawn error has no child error listener | **Fixed, with qualification.** Startup now awaits the child `spawn` event and rejects on `error`. The old main process also had a global uncaught-exception logger, so a guaranteed main-process crash was overstated; unhandled startup failure was real. |
| Medium | Failed update shutdown leaves the closing screen | **Fixed.** Installation errors propagate to the renderer, which restores polling and the normal screen and displays the failure. Main-process quit/lifecycle flags are also reset after installer failure. |
| Medium | Transaction address search sends an object; clearing retains a filter | **Fixed.** The debounced setter receives a string, including the empty string. |
| Medium | Account history labels unconverted NXS amounts as fiat | **Fixed.** Native-token identity and price availability now determine both the label and every balance conversion. |
| Medium | Recipient fields share one debounce timer | **Fixed.** Each recipient effect owns and cleans up its own timer; selecting a suggestion cannot cancel another field's lookup. |
| Lower | Filtering retains a previous transaction page | **Fixed.** Address, operation and time-span writes reset pagination to page 1, including address selection and clearing. |
| Lower | Contract amounts default to three displayed decimal places | **Fixed.** Contract summaries retain up to six NXS decimals or eight token decimals. This changes presentation only, not transaction amounts or submission. The old formatter did preserve a significant digit for tiny values, so it did not simply render every tiny amount as zero. |

The intentional startup behavior change is conservative: unreachable API
settings no longer trigger an automatic destructive recovery. A genuinely
misconfigured running Core may require the existing explicit restart action.
Normal successful starts, sends, channel selection and explicit stop/restart
operations are otherwise retained.

## Dependency upgrades and remaining work

| Supplied upgrade item | Status |
| --- | --- |
| Electron 43.1.0 | **Updated to 43.8.7**, remaining on major 43. |
| DOMPurify 3.4.11 | **Updated to 3.4.17.** Both module and external icon sanitization use default string-returning `sanitize` calls. Exposure to the particular reported non-default-option advisories was not demonstrated. |
| axios 1.18.1 | **Updated to 1.21.1**, remaining on major 1. |
| Unused direct `extract-zip` | **Removed.** No source/script imports were found, and `npm ls extract-zip --all` is empty. Electron's separate `@electron-internal/extract-zip` is not this package. The wallet's guarded archive implementation is unchanged. |
| Remaining dependency advisories | **Partially remediated, remainder deferred.** Compatible `proxy-addr`, `concurrently`, `launch-editor` and `shell-quote` lockfile updates remove the other critical reports without major-version migrations or forced overrides. |
| TypeScript compiler and CI type-check | **Deferred, not fixed.** Running TypeScript 5.9.3 with the existing configuration reports 33 existing diagnostics, including React 19 ref/element typing, preload signatures, settings assignments and third-party declarations. The diagnostics are unchanged by this patch. Enabling a required full type-check now would introduce a failing workflow; no errors were suppressed and no unrelated typing migration was bundled into these fixes. |

Audit snapshot after these targeted upgrades: **35 affected packages**
(19 high, 16 moderate, **0 critical**), down from 44 (including 3 critical).
These are package/advisory counts, not demonstrated vulnerabilities in the
packaged wallet.

`npm audit --omit=dev` reports eight affected packages. This is a manifest-based
view, **not** a proof of bundle reachability:

| Packages | Review result / follow-up |
| --- | --- |
| `react-router` | The remaining advisory concerns RSC server action CSRF. This app uses client-side `HashRouter`; that server action path is not used in the reviewed routing setup. Do not equate its audit severity with an established wallet exploit. |
| `zod` | Used for address-book and module-manifest validation. Module manifests contain constrained arrays, so the oversized-collection advisory deserves priority follow-up. The advertised fix requires a v4 migration; exploitability/resource limits were not established here. |
| `jotai-devtools`, `jsondiffpatch` | Developer tooling is imported by the renderer store. A patched devtools migration needs compatibility review; final-bundle inclusion and the affected formatter/patch call paths were not established. |
| `js-yaml`, `undici` | Transitive runtime-manifest entries; evaluate their actual consumers and compatible patch updates separately. No claim is made that every reported YAML/HTTP feature is exercised. |
| `browserslist`, `baseline-browser-mapping` | Present in the production-manifest audit through transitive relationships as well as tooling. Installation category alone does not establish packaged reachability. |

The other 27 audit entries are `@electron/universal`, `@xmldom/xmldom`,
`app-builder-lib`, `body-parser`, `brace-expansion`, `braces`, `compression`,
`csv-parse`, `decode-uri-component`, `dmg-builder`, `electron-builder`,
`electron-builder-squirrel-windows`, `fast-uri`, `micromatch`, `minimatch`,
`postcss`, `qs`, `sockjs`, `source-map-js`, `source-map-resolve`, `svg-baker`,
`svg-baker-runtime`, `svg-sprite-loader`, `svgo`, `tar`, `uuid`, and
`webpack-dev-server`. Some suggested fixes are major migrations or even tooling
downgrades. They were not forced into this bug-fix change. Their omission from
`--omit=dev` does not prove they cannot enter webpack bundles; for example, the
main process imports Express.

## Additional findings

* **Fixed:** the history search debounce was recreated on every render. Old
  queued typing could overwrite a later modal selection. It is now stable and
  cancelled on selection/unmount.
* **Fixed:** without a market price, account history could still show a fiat
  heading above native amounts. Labels now use the same conversion decision.
* **Fixed:** the main updater swallowed a synchronous installation exception
  and still scheduled process exit. Both synchronous exceptions and asynchronous
  installer error events now reject installation instead.
* **Follow-up:** the compiler baseline and Zod's constrained-array call sites
  above are concrete reasons for separate, focused migration work, not evidence
  of an observed production incident.

## Verification scope

Regression checks cover out-of-order recipient responses, independent recipient
timers, delayed Core readiness, missing binaries, asynchronous spawn errors,
wrong-port shutdown, installer readiness/error handling, remote logout, lossless
configuration changes, history filtering, fiat labels and amount precision.
Linux listener ownership is exercised against a real local socket; Windows and
macOS ownership checks use representative command-output fixtures.

Live Core startup/shutdown, real multi-Core operation and signed macOS/Squirrel
installation remain **unverified integration scenarios**. Those are release
validation requirements, not inferred successes from unit checks.
