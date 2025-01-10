// External
import { useAtomValue } from 'jotai';

// Internal
import CoreStatus from 'components/CoreStatus';
import { loggedInAtom, stakingAtom } from 'lib/session';
import { useCoreConnected, blockDateAtom } from 'lib/coreInfo';
import styled from '@emotion/styled';

__ = __context('Header');

const StakingDanger = styled.div({
  backgroundImage: `linear-gradient(to right, transparent 0%, transparent 20%, ${'#ff0000'} 50%, transparent 80%, transparent 100%)`,
});

export default function WalletStatus() {
  const staking = useAtomValue(stakingAtom);
  const blockDate = useAtomValue(blockDateAtom);
  const coreConnected = useCoreConnected();
  const loggedIn = useAtomValue(loggedInAtom);

  let nowTime = new Date();
  nowTime.setMinutes(nowTime.getMinutes() - 30);
  const isInDanger = nowTime >= blockDate;
  return !coreConnected ? (
    <span className="dim">
      <CoreStatus />
    </span>
  ) : (
    (!loggedIn && (
      <span className="dim">{__("You're not logged in")}. </span>
    )) ||
      (!!(isInDanger && staking) && (
        <StakingDanger>
          {__('You are staking but have not received a block in 30 minutes!')}
        </StakingDanger>
      ))
  );
}
