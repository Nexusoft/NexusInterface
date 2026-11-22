import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';

import { consts, timing, animations } from 'styles';
import { fade } from 'utils/color';

import SyncStatus from './SyncStatus';
import UserControl from './UserControl';
import themeStyles from 'utils/themeStyles';

const StatusIconsComponent = styled.div(themeStyles([{
  position: 'absolute',
  top: 24,
  right: 40,
  animation: `${animations.fadeIn} ${timing.slow} ${consts.enhancedEaseOut}`,
  display: 'flex',
  alignItems: 'center',
  fontSize: 20
}], [({
  theme
}) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  right: 'clamp(10px, 2vw, 28px)',
  animation: `${animations.fadeIn} ${timing.slow} ${consts.enhancedEaseOut}`,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: 4,
  borderRadius: 12,
  border: `1px solid ${fade(theme.primary, 0.78)}`,
  background: `linear-gradient(135deg, ${fade(theme.primary, 0.93)}, ${fade(theme.background, 0.25)})`,
  boxShadow: `inset 0 1px ${fade(theme.foreground, 0.95)}, 0 4px 16px rgba(0,0,0,0.12)`,
  '@media (max-width: 600px)': {
    gap: 0,
    padding: 2,
    right: 6
  }
})]));

export default function StatusIcons() {
  const { modern } = useTheme();
  return (
    <StatusIconsComponent>
      {!modern && <SyncStatus />}
      <UserControl />
    </StatusIconsComponent>
  );
}
