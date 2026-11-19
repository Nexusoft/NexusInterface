// External
import { Link } from 'react-router';
import styled from '@emotion/styled';

// Internal Global
import Icon from 'components/Icon';
import HorizontalLine from 'components/HorizontalLine';
import { consts, timing, animations } from 'styles';
import * as color from 'utils/color';
import { useCoreInfo, useCoreConnected } from 'lib/coreInfo';
import { alphaRelease, betaRelease } from 'consts/misc';

// Internal Local
import StatusIconsTritium from './StatusIconsTritium';
import WalletStatus from './WalletStatus';
import logoFull from 'icons/logo-full.svg';
import Tooltip from 'components/Tooltip';
import {
  useTestnetIndicator,
  testnetColor,
  toggleTestnetColor,
} from 'lib/testnetIndicator';

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

const TestnetTag = styled.div({
  position: 'absolute',
  top: 4,
  right: -84,
  fontSize: 11,
  fontWeight: 'bold',
  letterSpacing: 1,
  padding: '1px 6px',
  borderRadius: 3,
  color: '#1a1a1a',
  background: testnetColor,
  cursor: 'pointer',
  userSelect: 'none',
  '&:hover': { filter: 'brightness(1.1)' },
});

const TestnetBanner = styled.div({
  margin: '4px auto 0',
  display: 'inline-block',
  padding: '2px 12px',
  borderRadius: 3,
  fontSize: 13,
  color: '#1a1a1a',
  background: testnetColor,
});

const preReleaseTag = alphaRelease ? 'ALPHA' : betaRelease ? 'BETA' : null;

export default function Header() {
  const coreConnected = useCoreConnected();
  const coreInfo = useCoreInfo();
  const { testnet, private: privateNet, litemode, hybrid } = coreInfo || {};
  const indicator = useTestnetIndicator();

  return (
    <HeaderComponent>
      <LogoLink to="/">
        <Logo icon={logoFull} />
        {LOCK_TESTNET && <PreReleaseTag>TESTNET</PreReleaseTag>}
        {preReleaseTag ? <PreReleaseTag>{preReleaseTag}</PreReleaseTag> : null}
        {indicator.show('tag') && (
          <Tooltip.Trigger
            tooltip={
              indicator.show('color')
                ? __('%{network} - click for the normal colours', {
                    network: indicator.label,
                  })
                : __('%{network} - click for the testnet colours', {
                    network: indicator.label,
                  })
            }
          >
            <TestnetTag
              onClick={(e) => {
                //inside the logo link, so do not navigate
                e.preventDefault();
                e.stopPropagation();
                toggleTestnetColor();
              }}
            >
              TESTNET
            </TestnetTag>
          </Tooltip.Trigger>
        )}
      </LogoLink>

      <ModeDisplay>
        {__('Tritium Mode')}
        {litemode && ` [${__('Lite')}]`}
        {hybrid && ` [${__('Hybrid')}]`}
        {!!testnet && ` -${privateNet ? ' private' : ''} testnet ${testnet}`}
      </ModeDisplay>

      <UnderHeader>
        <HorizontalLine />
        {indicator.show('banner') && (
          <TestnetBanner>
            {__('%{network} - coins on this network have no value', {
              network: indicator.label,
            })}
          </TestnetBanner>
        )}
        <WalletStatus />
      </UnderHeader>

      {coreConnected && <StatusIconsTritium />}
    </HeaderComponent>
  );
}
