# Send transaction flow

This flow shows the validated wallet/module send path and the recovery behavior
when a debit request may have reached Core but its outcome cannot be confirmed.

```mermaid
sequenceDiagram
    participant UI as Wallet send UI
    participant Module as Module caller
    participant IPC as Main-process module API
    participant CoreRPC as Main-process Core RPC
    participant Core as Nexus Core
    participant Cache as Wallet queries

    opt Module initiated
        Module->>IPC: wallet.requestSend draft
        IPC->>IPC: Validate recipient and amount
        IPC-->>UI: Open wallet send flow with validated draft
    end

    UI->>UI: Validate amount at source-asset precision
    UI->>CoreRPC: finance/debit/token or finance/debit/any
    CoreRPC->>Core: HTTP(S) debit request
    alt Core confirms success
        Core-->>CoreRPC: success = true
        CoreRPC-->>UI: Confirmed result
        UI->>Cache: Refetch accounts, Core info, and transactions
        UI-->>UI: Show success and close preview
    else Core explicitly rejects
        Core-->>CoreRPC: success = false
        CoreRPC-->>UI: Known operation failure
        UI-->>UI: Show normal send error
    else Response is missing, invalid, or transport is lost
        Core--xCoreRPC: No trustworthy confirmation
        CoreRPC-->>UI: CORE_OUTCOME_UNKNOWN
        UI->>Cache: Refetch accounts, tokens, and transactions
        UI-->>UI: Block resubmission; reconcile state first
    end
```

Relevant implementation areas:

- `src/App/Send/PreviewTransactionModal.tsx` — submit and recovery behavior
- `src/main/coreRpc.js` — debit confirmation and unknown-outcome classification
- `src/main/ipc/moduleApiV2.js` — module send-draft validation
- `src/shared/utils/amount.js` — exact amount and uint64 validation
