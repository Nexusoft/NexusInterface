import styled from '@emotion/styled';
import { HTMLAttributes, ReactNode } from 'react';

const Row = styled.div<{
  leftSize: number;
  rightSize: number;
}>(({ leftSize, rightSize }) => ({
  display: 'grid',
  gridTemplateAreas: '"label value"',
  gridTemplateColumns: `${leftSize}fr ${rightSize}fr`,
  alignItems: 'start',
  columnGap: '1em',
  marginBottom: '.6em',
}));

const Label = styled.div(({ theme }) => ({
  gridArea: 'label',
  textAlign: 'right',
  color: theme.mixer(0.875),
}));

const Value = styled.div(({ theme }) => ({
  gridArea: 'value',
  wordBreak: 'break-word',
  color: theme.mixer(0.75),
}));

export interface InfoFieldProps extends HTMLAttributes<HTMLDivElement> {
  ratio?: [number, number];
  label: ReactNode;
}

export default function InfoField({
  ratio = [1, 3],
  label,
  children,
  ...rest
}: InfoFieldProps) {
  return (
    <Row leftSize={ratio[0]} rightSize={ratio[1]} {...rest}>
      <Label>{label}</Label>
      <Value>{children}</Value>
    </Row>
  );
}
