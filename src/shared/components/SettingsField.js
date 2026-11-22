// External
import { cloneElement, Children, useId } from 'react';
import styled from '@emotion/styled';

const indentSpace = 20;

const Field = styled.div(({ indent = 0, theme, disabled }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1em 0',
  borderBottom: `1px solid ${theme.mixer(0.125)}`,
  marginLeft: indent * indentSpace,
  opacity: disabled ? 0.5 : 1,
  pointerEvents: disabled ? 'none' : 'initial',
  ...(theme.modern && {
    padding: '20px 0', gap: 24, minWidth: 0,
    '@media (max-width: 800px)': { flexDirection: 'column', alignItems: 'stretch', gap: 12, marginLeft: Math.min(indent, 1) * indentSpace },
  }),
}));

const Label = styled.label({
  position: 'relative',
  paddingRight: '3em',
  flexShrink: 1,
  flexGrow: 1,
}, ({ theme }) => theme.modern && ({ paddingRight: 0, minWidth: 0, fontSize: 14, lineHeight: 1.5 }));

const SubLabel = styled.div(({ theme }) => ({
  fontSize: '.9em',
  color: theme.mixer(0.75),
  ...(theme.modern && { marginTop: 6, fontSize: 12, lineHeight: 1.6, color: theme.mixer(0.6) }),
}));

const Input = styled.div({
  flexShrink: 0,
  width: 350,
}, ({ theme }) => theme.modern && ({
  width: '40%', minWidth: 0,
  '@media (max-width: 800px)': { width: '100%' },
}));

/**
 * A Field on the Settings Page
 *
 * @class SettingsField
 * @extends {Component}
 */
export default function SettingsField({
  label,
  subLabel,
  connectLabel,
  children,
  indent,
  disabled,
  ...rest
}) {
  const inputId = useId();

  const settingsInput = () => {
    if (connectLabel) {
      if (typeof children === 'function') {
        return children(inputId);
      } else {
        return cloneElement(Children.only(children), {
          id: inputId,
        });
      }
    }
    return children;
  };

  return (
    <Field indent={indent} disabled={disabled} {...rest}>
      <Label
        htmlFor={connectLabel ? inputId : undefined}
        onClick={(e) => e.preventDefault()}
      >
        <div>{label}</div>
        {subLabel && <SubLabel>{subLabel}</SubLabel>}
      </Label>
      <Input>{settingsInput()}</Input>
    </Field>
  );
}
