import styled from '@emotion/styled';
import { ReactNode } from 'react';

import { consts, timing } from 'styles';

const Wrapper = styled.div<{
  width?: string | number;
}>(({ width }) => ({
  height: consts.inputHeightEm + 'em',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  width,
}));

const ProgressBar = styled.div<{
  progress: number;
}>(({ progress, theme }) => ({
  position: 'absolute',
  height: 1,
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: theme.primary,
  transformOrigin: 'left center',
  transform: `scaleX(${progress})`,
  transition: `transform ${timing.quick}`,
}));

export default function SimpleProgressBar({
  label,
  width,
  progress,
}: {
  label?: ReactNode;
  width?: string | number;
  progress: number;
}) {
  return (
    <Wrapper width={width}>
      {label}
      <ProgressBar progress={progress} />
    </Wrapper>
  );
}
