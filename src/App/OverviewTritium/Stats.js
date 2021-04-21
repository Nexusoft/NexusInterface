// External
import { Fragment, Component } from 'react';
import { Link } from 'react-router-dom';
import { connect, useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import GA from 'lib/googleAnalytics';

// Internal
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import TokenName from 'components/TokenName';
import { refreshBalances, loadAccounts } from 'lib/user';
import { getMiningInfo } from 'lib/core';
import { formatNumber, formatCurrency, formatRelativeTime } from 'lib/intl';
import { timing, consts } from 'styles';
import {
  isCoreConnected,
  isSynchronized,
  selectTokenBalances,
} from 'selectors';
import { observeStore } from 'store';
import Globe from './Globe';
import { webGLAvailable } from 'consts/misc';

// Images
import logoIcon from 'icons/NXS_coin.svg';
import currencyIcons from 'data/currencyIcons';
import chartIcon from 'icons/chart.svg';
import supplyIcon from 'icons/supply.svg';
import hours24Icon from 'icons/24hr.svg';
import nxsStakeIcon from 'icons/nxs-staking.svg';

import Connections0 from 'icons/Connections0.svg';
import Connections4 from 'icons/Connections4.svg';
import Connections8 from 'icons/Connections8.svg';
import Connections12 from 'icons/Connections12.svg';
import Connections14 from 'icons/Connections14.svg';
import Connections16 from 'icons/Connections16.svg';
import blockweight0 from 'icons/BlockWeight-0.svg';
import blockweight1 from 'icons/BlockWeight-1.svg';
import blockweight2 from 'icons/BlockWeight-2.svg';
import blockweight3 from 'icons/BlockWeight-3.svg';
import blockweight4 from 'icons/BlockWeight-4.svg';
import blockweight5 from 'icons/BlockWeight-5.svg';
import blockweight6 from 'icons/BlockWeight-6.svg';
import blockweight7 from 'icons/BlockWeight-7.svg';
import blockweight8 from 'icons/BlockWeight-8.svg';
import blockweight9 from 'icons/BlockWeight-9.svg';
import trust00 from 'icons/trust00.svg';
import trust10 from 'icons/trust00.svg';
import trust20 from 'icons/trust00.svg';
import trust30 from 'icons/trust00.svg';
import trust40 from 'icons/trust00.svg';
import trust50 from 'icons/trust00.svg';
import trust60 from 'icons/trust00.svg';
import trust70 from 'icons/trust00.svg';
import trust80 from 'icons/trust00.svg';
import trust90 from 'icons/trust00.svg';
import trust100 from 'icons/trust00.svg';
import nxsblocksIcon from 'icons/blockexplorer-invert-white.svg';
import interestIcon from 'icons/interest.svg';
import stakeIcon from 'icons/staking-white.svg';
import warningIcon from 'icons/warning.svg';
import questionMarkCircleIcon from 'icons/question-mark-circle.svg';

import Stat from './Stat';

__ = __context('Overview');

const trustIcons = [
  trust00,
  trust10,
  trust20,
  trust30,
  trust40,
  trust50,
  trust60,
  trust70,
  trust80,
  trust90,
  trust100,
];

const blockWeightIcons = [
  blockweight0,
  blockweight1,
  blockweight2,
  blockweight3,
  blockweight4,
  blockweight5,
  blockweight6,
  blockweight7,
  blockweight8,
  blockweight9,
  blockweight9,
];

const slideRight = keyframes`
  0% {
    opacity: 0;
    transform: translate(-100px,-50%);
  }
  100% {
    opacity: 1;
    transform: translate(0,-50%);
  }
`;

const slideLeft = keyframes`
  0% {
    opacity: 0;
    transform: translate(100px,-50%);
  }
  100% {
    opacity: 1;
    transform: translate(0,-50%);
  }
`;

const Stats = styled.div(
  {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    whiteSpace: 'nowrap',
    // I don't like this but its a quick fix for super small screens.
    '@media (min-height: 10px) and (max-height: 720px)': {
      fontSize: '75%',
      '& svg': {
        transform: 'scale(0.75)',
      },
    },
  },
  ({ left, compact }) =>
    left && {
      textAlign: 'right',
      right: compact ? 'calc(56% + 40px)' : 'calc(70% + 40px)',
      animation: `${timing.slow} ${consts.enhancedEaseOut} 0s ${slideRight}`,
      [Stat]: {
        justifyContent: 'flex-end',
      },
      [StatIcon]: {
        marginLeft: 15,
      },
    },
  ({ right, compact }) =>
    right && {
      textAlign: 'left',
      left: compact ? 'calc(56% + 40px)' : 'calc(70% + 40px)',
      animation: `${timing.slow} ${consts.enhancedEaseOut} 0s ${slideLeft}`,
      [Stat]: {
        justifyContent: 'flex-start',
      },
      [StatIcon]: {
        marginRight: 15,
      },
    }
);

const Stat = styled.div(
  ({ theme }) => ({
    display: 'block',
    margin: '1.7em 0',
    display: 'flex',
    alignItems: 'center',
    filter: `drop-shadow(0 0 8px ${theme.mixer(-0.5)}) brightness(100%)`,
    color: theme.foreground,
  }),
  ({ to, theme }) =>
    to && {
      cursor: 'pointer',
      transitionProperty: 'filter',
      transitionDuration: timing.normal,
      transitionTimingFunction: 'ease-out',
      '&:hover': {
        filter: `drop-shadow(0 0 8px ${theme.mixer(0.5)}) brightness(120%)`,
      },
    }
);

const StatLabel = styled.div(({ theme }) => ({
  fontWeight: 'bold',
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  fontSize: '.9em',
  color: theme.primary,
}));

const StatValue = styled.div({
  fontSize: '1.8em',
});

const SubValue = styled.div(({ theme }) => ({
  fontSize: '0.4em',
  // color: theme.primary,
}));

const StatIcon = styled(Icon)(({ theme }) => ({
  width: 38,
  height: 38,
  color: theme.primary,
}));
