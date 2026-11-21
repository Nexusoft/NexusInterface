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
  //a long, unbreakable label (e.g. a user-named asset field) must not widen the label column and stretch the row
  minWidth: 0,
  overflowWrap: 'anywhere',
}));

const Value = styled.div(({ theme }) => ({
  gridArea: 'value',
  //without this the grid column grows to fit an unbreakable value (a long txid/address), pushing the dialog wider
  //than the screen; minWidth 0 lets the column stay put so a long value wraps or truncates inside it instead
  minWidth: 0,
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
