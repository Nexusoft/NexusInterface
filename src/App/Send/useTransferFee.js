import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { callAPI } from 'lib/api';

// Core rules: TAO/Ledger/transaction.cpp (Cost), Ledger/include/constants.h,
// and API/build.cpp (AddFee). Fees are paid by the default NXS account.
// https://github.com/Nexusoft/LLL-TAO
export function estimateTransferFee(count, previousTimestamp, now, hybrid = false) {
  if (!count || hybrid) return 0;
  // Larger batches can be split by Core's configurable contract limit.
  if (count > 99 || !Number.isFinite(previousTimestamp) || previousTimestamp <= 0) return null;
  return now - previousTimestamp < 10 ? count * 10000 / 1000000 : 0;
}

export default function useTransferFee(count) {
  const genesis = useSelector((state) => state.user.status?.genesis);
  const hybrid = useSelector((state) => !!state.core.systemInfo?.private);
  const [snapshot, setSnapshot] = useState(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!genesis || !count || hybrid) return undefined;
    let active = true;
    let pending = false;
    const refresh = async () => {
      if (pending) return;
      pending = true;
      try {
        const transactions = await callAPI('profiles/transactions/master', { limit: 1, page: 0, order: 'desc', verbose: 'summary' });
        const timestamp = transactions?.[0]?.timestamp;
        if (active) setSnapshot({ genesis, timestamp, fetchedAt: Date.now() });
      } catch {
        if (active) setSnapshot(null);
      } finally {
        pending = false;
      }
    };
    refresh();
    const poll = setInterval(refresh, 5000);
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => { active = false; clearInterval(poll); clearInterval(clock); };
  }, [genesis, count, hybrid]);
  const timestamp = snapshot?.genesis === genesis && now - snapshot.fetchedAt < 15000
    ? snapshot.timestamp : null;
  return estimateTransferFee(count, timestamp, Math.floor(now / 1000), hybrid);
}
