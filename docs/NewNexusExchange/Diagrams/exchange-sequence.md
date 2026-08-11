# Exchange sequences — quote → deposit → swap → settle

Decision context: [README §1 D1/D2](../README.md#1-decision-record), [README §5 provider-adapter contract](../README.md#5-provider-adapter-contract).

## 1. Provider-brokered swap (interim adapter, phase 1 tab / phase 2 module)

The ShapeShift model reborn — but provider-agnostic, main-process-only, and with funds moving exclusively through the wallet's own Send flow.

```mermaid
sequenceDiagram
    autonumber
    participant UI as Exchange UI (tab or module)
    participant EX as Exchange service (main)
    participant AD as Provider adapter
    participant P as Provider (untrusted)
    participant SEND as Send flow (wallet-owned)
    participant USER as User

    UI->>EX: getQuote(provider key, pair, amount)
    EX->>EX: resolve key vs EXCHANGE_PROVIDERS, rate-limit
    EX->>AD: getQuote(pair, amount)
    AD->>P: HTTPS (timeout, size cap, redirect policy)
    P-->>AD: raw payload (untrusted bytes)
    AD-->>EX: normalized quote { rate, min, max, expiresAt }
    EX-->>UI: quote
    UI->>EX: createSwap(quote, refund addr, payout addr)
    EX->>AD: createSwap(...)
    AD->>P: HTTPS
    P-->>AD: raw order
    AD-->>EX: { orderId, depositAddress, depositAmount, expiresAt }
    EX-->>UI: deposit instructions
    UI->>SEND: prefill Send to depositAddress
    USER->>SEND: review + confirm (PIN)
    SEND->>SEND: sign and broadcast (existing wallet path)
    loop until terminal state or expiry
        UI->>EX: getSwapStatus(orderId)
        EX->>AD: getStatus(orderId)
        AD->>P: HTTPS
        P-->>AD: raw status
        AD-->>EX: closed-enum status
        EX-->>UI: awaiting_deposit | confirming | exchanging | sending | complete | failed | refunded | expired
    end
```

Invariants: the broker registers intent and reports status only; deposit addresses are shown for explicit user confirmation; a provider change touches the adapter, never the flow.

## 2. Atomic swap end-state (research track, HTLC/adaptor)

Trustless NXS↔LTC settlement. Requires litecoind wallet RPC for the LTC-side HTLC and Nexus contract-side design. The wallet never imports `wallet.dat` — LTC keys stay in LTC Core, driven over authenticated loopback RPC.

```mermaid
sequenceDiagram
    autonumber
    participant A as NexusInterface (initiator)
    participant NXS as Nexus chain
    participant LTCD as litecoind (loopback RPC)
    participant LTC as Litecoin chain
    participant B as Counterparty

    A->>A: generate secret s, hash h = H(s)
    A->>NXS: lock NXS in contract, hashlock h, timeout T1
    B->>LTC: lock LTC in HTLC, hashlock h, timeout T2 < T1
    A->>LTCD: watch/verify HTLC (frozen RPC allowlist)
    LTCD-->>A: HTLC confirmed with h, amount, T2
    A->>LTCD: redeem HTLC revealing s
    LTCD->>LTC: broadcast redeem tx
    B->>NXS: claim NXS using revealed s
    Note over A,B: Refund paths: if unredeemed, B refunds LTC after T2, A refunds NXS after T1
```

Phasing: this sequence lands only after D2 = 1(a) connectivity (PR #36 resurrection) is stable — see [ROADMAP Phase 6](../ROADMAP.md#phase-6--atomic-swap-research-track-d2-end-state).
