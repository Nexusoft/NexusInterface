// External
import { useSelector } from 'react-redux';

// Internal
import CoreStatus from 'components/CoreStatus';
import { isCoreConnected, isLoggedIn } from 'selectors';
import styled from '@emotion/styled';

__ = __context('Header');

const StakingDanger = styled.div({
  backgroundImage: `linear-gradient(to right, transparent 0%, transparent 20%, ${'#ff0000'} 50%, transparent 80%, transparent 100%)`,
});

export default function WalletStatus() {
  const staking = useSelector((state) => state.user.stakeInfo.staking);
  const blockDate = useSelector((state) => state.common.blockDate);
  const coreConnected = useSelector(isCoreConnected);
  const loggedIn = useSelector(isLoggedIn);

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
