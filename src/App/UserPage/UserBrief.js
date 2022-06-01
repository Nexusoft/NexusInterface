import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import RouterVerticalTab from 'components/RouterVerticalTab';
import { consts } from 'styles';
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

export default function UserBrief() {
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
      <RouterVerticalTab to="Accounts" text={__('Accounts')} />
      <RouterVerticalTab to="Staking" text={__('Staking')} />
      <RouterVerticalTab to="Tokens" text={__('Tokens')} />
      <RouterVerticalTab to="Names" text={__('Names')} />
      <RouterVerticalTab to="Namespaces" text={__('Namespaces')} />
      <RouterVerticalTab to="Assets" text={__('Assets')} />
    </UserBriefComponent>
  );
}
