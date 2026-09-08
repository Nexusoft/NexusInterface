'use strict';

const BOOTSTRAP_DISABLED_REASON =
  'Recent database bootstrap is disabled until artifacts are authenticated by a signed manifest';

function emitStatus(send, step, details) {
  if (typeof send === 'function') send({ step, details });
}

function abortBootstrap() {
  return { aborted: false, reason: 'disabled' };
}

async function startBootstrap(sendStatus) {
  emitStatus(sendStatus, 'idle');
  throw new Error(BOOTSTRAP_DISABLED_REASON);
}

const bootstrapConstants = Object.freeze({
  enabled: false,
  disabledReason: BOOTSTRAP_DISABLED_REASON,
});

module.exports = {
  abortBootstrap,
  bootstrapConstants,
  startBootstrap,
};
