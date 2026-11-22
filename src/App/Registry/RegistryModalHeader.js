import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import ControlledModal from 'components/ControlledModal';
import { fade } from 'utils/color';
import RegistryIcon from './RegistryIcon';

const Heading = styled.div(({ theme }) => ({
  display: 'flex', alignItems: 'center', gap: 14, minWidth: 0,
  '.registry-modal-icon': { width: 44, height: 44, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 12, background: fade(theme.primary, 0.9), color: theme.primary },
  '.registry-modal-title': { minWidth: 0, flex: 1, paddingRight: 24, fontSize: 20, lineHeight: 1.4, overflowWrap: 'anywhere' },
}));

export default function RegistryModalHeader({ section, children, ...rest }) {
  const { modern } = useTheme();
  return <ControlledModal.Header {...rest}>{modern ? <Heading><span className="registry-modal-icon"><RegistryIcon section={section} size={24} /></span><div className="registry-modal-title">{children}</div></Heading> : children}</ControlledModal.Header>;
}
