/**
 * Important note - This file is imported into module_preload.js, either directly or
 * indirectly, and will be a part of the preload script for modules, therefore:
 * - Be picky with importing stuffs into this file, especially for big
 * files and libraries. The bigger the preload scripts get, the slower the modules
 * will load.
 * - Don't assign anything to `global` variable because it will be passed
 * into modules' execution environment.
 * - Make sure this note also presents in other files which are imported here.
 */

// External
import {
  cloneElement,
  Children,
  useId,
  ReactNode,
  ReactElement,
  ComponentProps,
} from 'react';
import styled from '@emotion/styled';

const FormFieldComponent = styled.div<{
  inline?: boolean;
}>(
  { marginTop: '1em' },
  ({ inline }) =>
    inline && {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '',
    }
);

const Label = styled.label<{
  capitalize?: boolean;
}>(
  {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    marginBottom: '.2em',
  },
  ({ capitalize }) =>
    capitalize && {
      textTransform: 'uppercase',
      fontSize: '.8em',
    }
);

const Hint = styled.div(({ theme }) => ({
  position: 'absolute',
  visibility: 'hidden',
  opacity: 0,
  background: '#444',
  color: '#fff',
  padding: '0.25em 0.5em',
  textAlign: 'center',
  transition: 'all 0.25s linear',
  top: 'calc(100% + 0.8em)',
  zIndex: 1,

  '&::before': {
    content: '""',
    position: 'absolute',
    width: 0,
    height: 0,
    borderWidth: '0.5em',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderBottomColor: '#444',
    transition: 'all 0.25s linear',
    bottom: '100%',
    left: '1em',
  },

  'input:invalid:focus + &': {
    visibility: 'visible',
    opacity: 1,
    color: '#fff',
    background: theme.danger,
  },

  'input:invalid:focus + &::before': {
    borderBottomColor: theme.danger,
  },
}));

export type FormFieldProps = Omit<
  ComponentProps<typeof FormFieldComponent>,
  'children'
> & {
  label: string;
  capitalizeLabel?: boolean;
  connectLabel?: boolean;
  children: ReactElement | ((id: string) => ReactNode);
  hint?: string;
};

export default function FormField({
  label,
  capitalizeLabel = true,
  connectLabel,
  children,
  hint,
  ...rest
}: FormFieldProps) {
  const inputId = useId();

  const renderFormInput = () => {
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
    <FormFieldComponent {...rest}>
      <Label
        capitalize={capitalizeLabel}
        htmlFor={connectLabel ? inputId : undefined}
      >
        {label}
      </Label>
      <div className="relative">
        {renderFormInput()}
        {!!hint && <Hint>{hint}</Hint>}
      </div>
    </FormFieldComponent>
  );
}
