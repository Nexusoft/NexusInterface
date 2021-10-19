import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { NavLink } from 'react-router-dom';

import { timing, consts } from 'styles';
import * as color from 'utils/color';
import { selectUsername } from 'lib/user';

__ = __context('User');

const UserBriefComponent = styled.div(({ theme }) => ({
  width: 315,
  marginLeft: -30,
  padding: '0 30px',
  borderRight: `1px solid ${theme.mixer(0.125)}`,
  overflow: 'auto',
}));

const Separator = styled.div(({ theme }) => ({
  borderBottom: `1px solid ${theme.mixer(0.125)}`,
  margin: '5px 0',
}));

const Username = styled.div(({ theme }) => ({
  color: theme.primary,
  textAlign: 'center',
  fontSize: 30,
  padding: '20px 0',
}));

const Genesis = styled.div({
  textAlign: 'center',
  opacity: 0.7,
  fontSize: '.8em',
  padding: '10px 0',
});

const GenesisId = styled.div({
  wordBreak: 'break-all',
  fontFamily: consts.monoFontFamily,
});

const MenuItem = styled(NavLink)(
  ({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '.5em 30px',
    margin: '0 -30px',
    transitionProperty: 'background, color',
    transitionDuration: timing.normal,
    cursor: 'pointer',

    '&:hover': {
      background: theme.mixer(0.05),
    },

    '&.active, &.active:hover': {
      background: theme.primary,
      color: theme.primaryAccent,
    },
  }),
  ({ selected, theme }) =>
    selected && {
      '&, &:hover': {
        background: color.fade(theme.primary, 0.4),
        color: theme.primaryAccent,
      },
    }
);

export default function UserBrief({ match }) {
  const username = useSelector(selectUsername);
  const genesis = useSelector((state) => state.user.status?.genesis);
  return (
    <UserBriefComponent>
      <Username>{username}</Username>
      <Separator />
      <Genesis>
        <div>{__('User ID')}:</div>
        <GenesisId>{genesis}</GenesisId>
      </Genesis>
      <Separator />
      <MenuItem to={`${match.url}/Accounts`}>{__('Accounts')}</MenuItem>
      <MenuItem to={`${match.url}/Staking`}>{__('Staking')}</MenuItem>
      <MenuItem to={`${match.url}/Tokens`}>{__('Tokens')}</MenuItem>
      <MenuItem to={`${match.url}/Names`}>{__('Names')}</MenuItem>
      <MenuItem to={`${match.url}/Namespaces`}>{__('Namespaces')}</MenuItem>
      <MenuItem to={`${match.url}/Assets`}>{__('Assets')}</MenuItem>
    </UserBriefComponent>
  );
}
