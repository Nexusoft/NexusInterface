import { useRef } from 'react';

import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import { StakeInfo } from 'lib/api';
import { formatNumber } from 'lib/intl';

__ = __context('User.Staking');

export type StopStakingChoice = 'unstake' | 'now' | null;

export default function StopStakingModal({
  stakeInfo,
  onChoose,
}: {
  stakeInfo: StakeInfo;
  onChoose: (choice: StopStakingChoice) => void;
}) {
  const chosenRef = useRef(false);
  const choose = (choice: StopStakingChoice, closeModal: () => void) => {
    chosenRef.current = true;
    onChoose(choice);
    closeModal();
  };

  return (
    <ControlledModal
      maxWidth={640}
      onClose={() => {
        if (!chosenRef.current) onChoose(null);
      }}
    >
      {(closeModal) => (
        <>
          <ControlledModal.Header>{__('Stop staking?')}</ControlledModal.Header>
          <ControlledModal.Body>
            <p>
              {__(
                '%{amount} NXS is locked as stake in your trust account. It only becomes available again with your next Trust transaction, and that only happens while staking runs.',
                { amount: formatNumber(stakeInfo.stake, 6) }
              )}
            </p>
            <p>
              <strong>{__('Unstake, then stop')}</strong>
              {': '}
              {__(
                'requests your whole stake back and keeps staking until the next Trust transaction returns it to your available balance, then stops by itself.'
              )}
            </p>
            <p>
              <strong>{__('Stop now')}</strong>
              {': '}
              {__(
                'stops right away. Your coins stay in the trust account as stake (nothing is lost) and become available only after you stake again.'
              )}
            </p>
            <div
              className="mt2 flex space-between"
              style={{ flexWrap: 'wrap', gap: '0.6em' }}
            >
              <Button onClick={() => choose(null, closeModal)}>
                {__('Cancel')}
              </Button>
              <div className="flex" style={{ flexWrap: 'wrap', gap: '0.6em' }}>
                <Button onClick={() => choose('now', closeModal)}>
                  {__('Stop now')}
                </Button>
                <Button
                  skin="primary"
                  onClick={() => choose('unstake', closeModal)}
                >
                  {__('Unstake, then stop')}
                </Button>
              </div>
            </div>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
