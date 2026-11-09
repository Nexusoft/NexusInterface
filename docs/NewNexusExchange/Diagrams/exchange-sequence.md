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

## 2. Direct atomic-swap proposal

The earlier conceptual sequence assumed a Nexus hashlock and refund were already
available. They must be proven against the actual consensus and API first; a
generic Send or provider deposit is not an atomic swap. See the revised
[protocol sequence, timing rules, and staged plan](../ATOMIC_SWAP_PLAN.md).
