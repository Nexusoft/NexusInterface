// External
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

// Internal Global
import Icon from 'components/Icon';
import HorizontalLine from 'components/HorizontalLine';
import { consts, timing, animations } from 'styles';
import * as color from 'utils/color';
import { isCoreConnected } from 'selectors';
import { alphaRelease, betaRelease, legacyMode } from 'consts/misc';

// Internal Local
import StatusIcons from './StatusIcons';
import StatusIconsTritium from './StatusIconsTritium';
import WalletStatus from './WalletStatus';
import logoFull from 'icons/logo-full.svg';

__ = __context('Header');

const HeaderComponent = styled.header(({ theme }) => ({
  gridArea: 'header',
  position: 'relative',
  top: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(to bottom, rgba(0,0,0,.6), transparent)',
  color: theme.primary,
  zIndex: 1,
}));

const LogoLink = styled(Link)(({ theme }) => ({
  position: 'relative',
  animation: `${animations.fadeInAndExpand} ${timing.slow} ${consts.enhancedEaseOut}`,
  transitionProperty: 'filter',
  transitionDuration: timing.normal,
  transitionTimingFunction: 'ease-out',
  filter: `drop-shadow(0 0 8px ${color.fade(
    color.lighten(theme.primary, 0.2),
    0.3
  )})`,

  '&:hover': {
    filter: `drop-shadow(0 0 10px ${color.lighten(
      theme.primary,
      0.2
    )}) brightness(110%)`,
  },
}));

const Logo = styled(Icon)(({ theme }) => ({
  display: 'block',
  height: 50,
  width: 'auto',
  fill: theme.primary,
}));

const UnderHeader = styled.div(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  textAlign: 'center',
  color: theme.foreground,
}));

const ModeDisplay = styled.div({
  position: 'absolute',
  bottom: '-1px',
  fontSize: 14,
  fontWeight: 'bold',
  opacity: 0.7,
});

const PreReleaseTag = styled.div(({ theme }) => ({
  fontSize: 12,
  position: 'absolute',
  bottom: 3,
  right: -32,
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: theme.foreground,
}));

const preReleaseTag = alphaRelease ? 'ALPHA' : betaRelease ? 'BETA' : null;

export default function Header() {
  const coreConnected = useSelector(isCoreConnected);
  const testnet = useSelector((state) => state.core.systemInfo?.testnet);
  const privateNet = useSelector((state) => state.core.systemInfo?.private);
  const legacyTestnet = useSelector((state) => state.core.info?.testnet);
  const lite = useSelector((state) => state.core.systemInfo?.litemode);
  const hybrid = useSelector((state) => state.core.systemInfo?.hybrid);

  return (
    <HeaderComponent>
      <LogoLink to="/">
        <Logo icon={logoFull} />
        {LOCK_TESTNET && <PreReleaseTag>TESTNET</PreReleaseTag>}
        {preReleaseTag ? <PreReleaseTag>{preReleaseTag}</PreReleaseTag> : null}
      </LogoLink>

      <ModeDisplay>
        {legacyMode ? (
          <>
            {__('Legacy Mode')}
            {lite && ` [${__('Lite')}]`}
            {!!legacyTestnet && ' - testnet'}
          </>
        ) : (
          <>
            {__('Tritium Mode')}
            {lite && ` [${__('Lite')}]`}
            {hybrid && ` [${__('Hybrid')}]`}
            {!!testnet &&
              ` -${privateNet ? ' private' : ''} testnet ${testnet}`}
          </>
        )}
      </ModeDisplay>

      <UnderHeader>
        <HorizontalLine />
        <WalletStatus />
      </UnderHeader>

      {coreConnected && (legacyMode ? <StatusIcons /> : <StatusIconsTritium />)}
    </HeaderComponent>
  );
}
