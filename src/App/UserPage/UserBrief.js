import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';

import RouterVerticalTab from 'components/RouterVerticalTab';
import { consts } from 'styles';
import { selectUsername } from 'lib/session';
import { fade, mix } from 'utils/color';
import themeStyles from 'utils/themeStyles';

__ = __context('User');

const UserBriefComponent = styled.div(themeStyles([({
  theme
}) => ({
  width: 315,
  marginLeft: -30,
  padding: '0 30px',
  borderRight: `1px solid ${theme.mixer(0.125)}`,
  overflow: 'auto'
})], [({
  theme
}) => ({
  width: 260,
  flexShrink: 0,
  padding: 16,
  border: `1px solid ${fade(theme.primary, 0.85)}`,
  borderRadius: 16,
  background: `linear-gradient(160deg, ${mix(theme.background, theme.primary, 0.05)}, ${theme.background})`,
  overflow: 'auto',
  'a, .user-option': {
    margin: '4px 0',
    padding: '11px 14px',
    borderRadius: 10,
    fontSize: 13,
    '&.active, &.active:hover': {
      background: fade(theme.primary, 0.88),
      color: theme.primary,
      boxShadow: `inset 3px 0 ${theme.primary}`
    }
  },
  '@media (max-width: 900px)': {
    width: '100%',
    overflow: 'visible'
  }
})]));

const Separator = styled.div(themeStyles([({
  theme
}) => ({
  borderBottom: `1px solid ${theme.mixer(0.125)}`,
  margin: '5px 0'
})], [({
  theme
}) => ({
  borderBottom: `1px solid ${theme.mixer(0.125)}`,
  margin: '14px 0'
})]));

const Username = styled.div(themeStyles([({
  theme
}) => ({
  color: theme.primary,
  textAlign: 'center',
  fontSize: 30,
  padding: '20px 0'
})], [({
  theme
}) => ({
  color: theme.primary,
  textAlign: 'left',
  fontSize: 24,
  fontWeight: 600,
  letterSpacing: '-0.5px',
  overflowWrap: 'anywhere',
  padding: '8px 4px'
})]));

const Genesis = styled.div(themeStyles([{
  textAlign: 'center',
  opacity: 0.7,
  fontSize: '.8em',
  padding: '10px 0'
}], [{
  textAlign: 'left',
  opacity: 0.7,
  fontSize: '.8em',
  padding: '0 4px'
}]));

const GenesisId = styled.div(themeStyles([{
  wordBreak: 'break-all',
  fontFamily: consts.monoFontFamily
}], [{
  wordBreak: 'break-all',
  fontFamily: consts.monoFontFamily,
  marginTop: 8,
  lineHeight: 1.7,
  fontSize: 11
}]));

export default function UserBrief() {
  const { modern } = useTheme();
  const username = useSelector(selectUsername);
  const genesis = useSelector((state) => state.user.status?.genesis);

  return (
    <UserBriefComponent>
      {!modern && (
        <>
          <Username>{username}</Username>
          <Separator />
          <Genesis>
            <div>{__('User ID')}:</div>
            <GenesisId>{genesis}</GenesisId>
          </Genesis>
          <Separator />
        </>
      )}
      <RouterVerticalTab to="Accounts" text={__('Accounts')} />
      {modern && (
        <>
          <Separator />
        </>
      )}
    </UserBriefComponent>
  );
}
