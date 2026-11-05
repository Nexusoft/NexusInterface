type Timer = ReturnType<typeof setTimeout>;

export function createPeerRefresh<T>({
  load,
  onSuccess,
  onError,
  intervalMs = 10_000,
  timeoutMs = 8_000,
  schedule = setTimeout,
  cancel = clearTimeout,
}: {
  load: () => Promise<T>;
  onSuccess: (value: T) => void;
  onError: (error: unknown) => void;
  intervalMs?: number;
  timeoutMs?: number;
  schedule?: typeof setTimeout;
  cancel?: typeof clearTimeout;
}) {
  let generation = 0;
  let active = false;
  let timer: Timer | undefined;
  let timeout: Timer | undefined;

  async function refresh(current: number) {
    let timedOut = false;
    timeout = schedule(() => {
      if (active && current === generation) {
        timedOut = true;
        const next = ++generation;
        timeout = undefined;
        timer = schedule(() => refresh(next), intervalMs);
        onError(new Error('Peer list request timed out'));
      }
    }, timeoutMs);
    try {
      const value = await load();
      if (active && current === generation && !timedOut) onSuccess(value);
    } catch (error) {
      if (active && current === generation && !timedOut) onError(error);
    } finally {
      if (current === generation) {
        cancel(timeout);
        timeout = undefined;
        if (active) timer = schedule(() => refresh(current), intervalMs);
      }
    }
  }

  return {
    start() {
      if (active) return;
      active = true;
      refresh(++generation);
    },
    stop() {
      active = false;
      generation++;
      cancel(timer);
      cancel(timeout);
      timer = undefined;
      timeout = undefined;
    },
  };
}
