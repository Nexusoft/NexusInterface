// External
import {
  cloneElement,
  Children,
  useId,
  ReactNode,
  ComponentProps,
  ReactElement,
} from 'react';
import styled from '@emotion/styled';

const indentSpace = 20;

const Field = styled.div<{
  indent?: number;
  disabled?: boolean;
}>(({ indent = 0, theme, disabled }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1em 0',
  borderBottom: `1px solid ${theme.mixer(0.125)}`,
  marginLeft: indent * indentSpace,
  opacity: disabled ? 0.5 : 1,
  pointerEvents: disabled ? 'none' : 'initial',
}));

const Label = styled.label({
  position: 'relative',
  paddingRight: '3em',
  flexShrink: 1,
  flexGrow: 1,
});

const SubLabel = styled.div(({ theme }) => ({
  fontSize: '.9em',
  color: theme.mixer(0.75),
}));

const Input = styled.div({
  flexShrink: 0,
  width: 350,
});

export interface SettingsFieldProps
  extends Omit<ComponentProps<typeof Field>, 'children'> {
  label: ReactNode;
  subLabel?: ReactNode;
  connectLabel?: boolean;
  children: ReactElement | ((inputId: string) => ReactNode);
}

/**
 * A Field on the Settings Page
 */
export default function SettingsField({
  label,
  subLabel,
  connectLabel,
  children,
  indent,
  disabled,
  ...rest
}: SettingsFieldProps) {
  const inputId = useId();

  const settingsInput = () => {
    if (typeof children === 'function') {
      return children(inputId);
    }
    if (connectLabel) {
      return cloneElement(Children.only(children), {
        id: inputId,
      });
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
