import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

__ = __context('Header');

const ModeLabel = styled.span(({ theme }) => ({
  color: theme.primary,
  fontSize: 10,
  letterSpacing: '3px',
  textTransform: 'uppercase',
  fontWeight: 'inherit',
}));

export default function ModeDisplay() {
  const testnet = useSelector((state) => state.core.systemInfo?.testnet);
  const privateNet = useSelector((state) => state.core.systemInfo?.private);
  const lite = useSelector((state) => state.core.systemInfo?.litemode);
  const hybrid = useSelector((state) => state.core.systemInfo?.hybrid);

  return (
    <ModeLabel>
      {__('Tritium Mode')}
      {lite && ` [${__('Lite')}]`}
      {hybrid && ` [${__('Hybrid')}]`}
      {!!testnet && ` -${privateNet ? ' private' : ''} testnet ${testnet}`}
    </ModeLabel>
  );
}
