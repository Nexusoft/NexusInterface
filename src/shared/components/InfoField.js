import styled from '@emotion/styled';

const Row = styled.div(({ leftSize, rightSize }) => ({
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

export default function InfoField({
  ratio = [1, 3],
  label,
  children,
  ...rest
}) {
  return (
    <Row leftSize={ratio[0]} rightSize={ratio[1]} {...rest}>
      <Label>{label}</Label>
      <Value>{children}</Value>
    </Row>
  );
}
