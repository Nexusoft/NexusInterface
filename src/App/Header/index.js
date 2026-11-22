// External
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

// Internal Global
import Icon from 'components/Icon';
import { consts, timing, animations } from 'styles';
import * as color from 'utils/color';
import { isCoreConnected } from 'selectors';
import { alphaRelease, betaRelease } from 'consts/misc';

// Internal Local
import StatusIconsTritium from './StatusIconsTritium';
import WalletStatus from './WalletStatus';
import logoFull from 'icons/logo-full.svg';
import HorizontalLine from 'components/HorizontalLine';
import themeStyles from 'utils/themeStyles';
import { useTheme } from '@emotion/react';
const ModeDisplay = styled.div({
  position: 'absolute',
  bottom: '-1px',
  fontSize: 14,
  fontWeight: 'bold',
  opacity: 0.7,
});

__ = __context('Header');

const HeaderComponent = styled.header(themeStyles([({
  theme
}) => ({
  gridArea: 'header',
  position: 'relative',
  top: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(to bottom, rgba(0,0,0,.6), transparent)',
  color: theme.primary,
  zIndex: 1
})], [({
  theme
}) => ({
  gridArea: 'header',
  minWidth: 0,
  position: 'relative',
  top: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(110deg, ${theme.background}, ${color.mix(theme.background, theme.primary, 0.08)})`,
  borderBottom: `1px solid ${color.fade(theme.primary, 0.7)}`,
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.18)',
  color: theme.primary,
  zIndex: 1
})]));

const LogoLink = styled(Link)(themeStyles([({
  theme
}) => ({
  position: 'relative',
  animation: `${animations.fadeInAndExpand} ${timing.slow} ${consts.enhancedEaseOut}`,
  transitionProperty: 'filter',
  transitionDuration: timing.normal,
  transitionTimingFunction: 'ease-out',
  filter: `drop-shadow(0 0 8px ${color.fade(color.lighten(theme.primary, 0.2), 0.3)})`,
  '&:hover': {
    filter: `drop-shadow(0 0 10px ${color.lighten(theme.primary, 0.2)}) brightness(110%)`
  }
})], [({
  theme
}) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'center',
  lineHeight: 1,
  animation: `${animations.fadeInAndExpand} ${timing.slow} ${consts.enhancedEaseOut}`,
  transitionProperty: 'filter',
  transitionDuration: timing.normal,
  transitionTimingFunction: 'ease-out',
  filter: 'none',
  '&:hover': {
    filter: 'brightness(110%)'
  }
})]));

const Logo = styled(Icon)(themeStyles([({
  theme
}) => ({
  display: 'block',
  height: 50,
  width: 'auto',
  fill: theme.primary
})], [({
  theme
}) => ({
  display: 'block',
  height: 'clamp(42px, 6vh, 52px)',
  width: 'auto',
  fill: theme.primary
})]));

const UnderHeader = styled.div(themeStyles([({
  theme
}) => ({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  textAlign: 'center',
  color: theme.foreground
})], [({
  theme
}) => ({
  position: 'absolute',
  top: 28,
  left: 28,
  maxWidth: '30%',
  fontSize: 11,
  textAlign: 'center',
  color: theme.foreground,
  '@media (max-width: 800px)': {
    display: 'none'
  }
})]));

const PreReleaseTag = styled.div(({ theme }) => ({
  fontSize: 12,
  position: 'absolute',
  bottom: 3,
  right: -32,
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: theme.foreground,
}));

const HeaderLeft = styled.div(({ theme }) => ({
  position: 'absolute', left: 'clamp(12px, 2vw, 28px)',
  top: '50%', transform: 'translateY(-50%)', maxWidth: '30%',
  color: theme.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
  '.page-label': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  '.wallet-status': { fontSize: 11, letterSpacing: 0, textTransform: 'none', color: theme.foreground },
  '@media (max-width: 600px)': { maxWidth: '25%', fontSize: 9, letterSpacing: 1 },
}));

const preReleaseTag = alphaRelease ? 'ALPHA' : betaRelease ? 'BETA' : null;

export default function Header() {
  const { modern } = useTheme();
  const { pathname } = useLocation();
  const pageLabels = {
    registry: __('Registry'),
    send: __('Send'), transactions: __('Transactions'), addressbook: __('Address book'),
    settings: __('Settings'), terminal: __('Console'), user: __('User'), staking: __('Staking'), modules: __('Modules'),
  };
  const pageLabel = pageLabels[pathname.split('/')[1].toLowerCase()] || __('Overview');
  const testnet = useSelector((state) => state.core.systemInfo?.testnet);
  const privateNet = useSelector((state) => state.core.systemInfo?.private);
  const lite = useSelector((state) => state.core.systemInfo?.litemode);
  const hybrid = useSelector((state) => state.core.systemInfo?.hybrid);
  const coreConnected = useSelector(isCoreConnected);

  return (
    modern ? (<HeaderComponent>
      <LogoLink to="/">
        <Logo icon={logoFull} />
        {LOCK_TESTNET && <PreReleaseTag>TESTNET</PreReleaseTag>}
        {preReleaseTag ? <PreReleaseTag>{preReleaseTag}</PreReleaseTag> : null}
      </LogoLink>

      <HeaderLeft>
        <div className="page-label" title={`${__('Nexus')} / ${pageLabel}`}>{__('Nexus')} / {pageLabel}</div>
        <div className="wallet-status"><WalletStatus /></div>
      </HeaderLeft>

      {coreConnected && <StatusIconsTritium />}
    </HeaderComponent>) : (<HeaderComponent>
      <LogoLink to="/">
        <Logo icon={logoFull} />
        {LOCK_TESTNET && <PreReleaseTag>TESTNET</PreReleaseTag>}
        {preReleaseTag ? <PreReleaseTag>{preReleaseTag}</PreReleaseTag> : null}
      </LogoLink>

      <ModeDisplay>
        {__('Tritium Mode')}
        {lite && ` [${__('Lite')}]`}
        {hybrid && ` [${__('Hybrid')}]`}
        {!!testnet && ` -${privateNet ? ' private' : ''} testnet ${testnet}`}
      </ModeDisplay>

      <UnderHeader>
        <HorizontalLine />
        <WalletStatus />
      </UnderHeader>

      {coreConnected && <StatusIconsTritium />}
    </HeaderComponent>)
  );
}
