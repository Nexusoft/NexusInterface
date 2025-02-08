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
  useEffect,
  useRef,
  useState,
  forwardRef,
  ComponentProps,
  ReactNode,
  CSSProperties,
  ReactElement,
  ForwardedRef,
} from 'react';
import styled from '@emotion/styled';

// Internal
import Tooltip from 'components/Tooltip';
import { timing, consts } from 'styles';
import { refs } from 'utils/misc';

export type TextFieldSkin = 'underline' | 'filled' | 'filled-inverted';

const ErrorMessage = styled(Tooltip)<{
  focus?: boolean;
}>(
  {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    left: 0,
    maxWidth: '100%',
    opacity: 0,
    visibility: 'hidden',
    transition: `opacity ${timing.normal}, visibility ${timing.normal}`,
    zIndex: 1,
    whiteSpace: 'normal',
    textAlign: 'left',
  },
  ({ focus }) =>
    focus && {
      opacity: 1,
      visibility: 'visible',
    }
);

const TextFieldWrapper = styled.div<{
  size?: number;
  skin: TextFieldSkin;
  focus?: boolean;
  error?: ReactNode;
  multiline?: boolean;
}>(
  {
    position: 'relative',
    height: consts.inputHeightEm + 'em',
    alignItems: 'center',

    '&:hover': {
      [ErrorMessage as any]: {
        opacity: 1,
        visibility: 'visible',
      },
    },
  },

  ({ size }) => ({
    display: size ? 'inline-flex' : 'flex',
  }),

  ({ skin, focus, error, theme }) => {
    switch (skin) {
      case 'underline':
        return {
          color: theme.mixer(0.875),
          transitionProperty: 'color',
          transitionDuration: timing.normal,
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            borderRadius: 1,
            background: error ? theme.danger : theme.mixer(0.5),
            transitionProperty: 'background-color, box-shadow',
            transitionDuration: timing.normal,
          },
          '&:hover': {
            color: theme.foreground,
            '&::after': {
              background: error
                ? theme.raise(theme.danger, 0.3)
                : theme.mixer(0.75),
            },
          },
          ...(focus
            ? {
                '&&::after': {
                  background: theme.raise(
                    error ? theme.danger : theme.primary,
                    0.3
                  ),
                  boxShadow: `0 0 15px ${error ? theme.danger : theme.primary}`,
                },
              }
            : null),
        };
      case 'filled':
        return {
          borderRadius: 2,
          background: theme.mixer(0.875),
          color: theme.background,
          transitionProperty: 'background-color',
          transitionDuration: timing.normal,
          '&:hover': {
            background: theme.foreground,
          },
          ...(focus
            ? {
                background: theme.foreground,
              }
            : null),
          ...(error
            ? {
                border: `1px solid ${theme.danger}`,
              }
            : null),
        };
      case 'filled-inverted':
        return {
          border: `1px solid ${theme.mixer(0.125)}`,
          background: theme.background,
          color: theme.foreground,
          borderRadius: 2,
          transitionProperty: 'border-color, box-shadow',
          transitionDuration: timing.normal,
          '&:hover': {
            borderColor: theme.mixer(0.25),
          },
          ...(focus
            ? {
                '&, &:hover': {
                  borderColor: theme.primary,
                  boxShadow: `0 0 5px ${theme.primary}`,
                },
              }
            : null),
          ...(error
            ? {
                '&, &:hover': {
                  borderColor: theme.danger,
                  boxShadow: `0 0 5px ${theme.danger}`,
                },
              }
            : null),
        };
    }
  },

  ({ multiline }) =>
    multiline && {
      height: 'auto',
      minHeight: consts.inputHeightEm + 'em',
    }
);

const Input = styled.input<{
  skin?: TextFieldSkin;
  grouped?: 'left' | 'right' | 'top' | 'bottom';
  type?: string;
  multiline?: boolean;
}>(
  ({ theme }) => ({
    display: 'block',
    background: 'transparent',
    color: 'inherit',
    padding: 0,
    height: '100%',
    transitionProperty: 'color, box-shadow, color',
    transitionDuration: timing.normal,

    '&::placeholder': {
      color: theme.mixer(0.5),
    },

    '&[type="date"], &[type="time"]': {
      '&::-webkit-inner-spin-button': {
        position: 'relative',
        top: consts.inputHeightEm / 2 + 'em',
        transform: 'translateY(-50%)',
      },
    },
  }),

  ({ type }) =>
    type === 'number' && {
      paddingRight: '.2em',
    },

  ({ size }) =>
    !size && {
      width: '100%',
    },

  ({ grouped }) => {
    switch (grouped) {
      case 'left':
        return {
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        };
      case 'right':
        return {
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        };
      case 'top':
        return {
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        };
      case 'bottom':
        return {
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        };
      default:
        return null;
    }
  },

  ({ skin }) =>
    (skin === 'filled' || skin === 'filled-inverted') && {
      padding: '0 .8em',
    }
);

const TextArea = styled(Input.withComponent('textarea'))({
  height: 'auto',
  width: '100%',
  paddingTop: '.4em',
  paddingBottom: '.5em',
  resize: 'vertical',
  lineHeight: 1.28,
});

const MultilineInput = forwardRef<
  HTMLTextAreaElement,
  ComponentProps<typeof TextArea>
>((props, ref) => {
  const inputRef = useRef<HTMLTextAreaElement>();

  useEffect(() => {
    const inputElem = inputRef.current;
    if (inputElem) {
      inputElem.style.height = 'auto';
      const { scrollHeight } = inputElem;
      if (scrollHeight) {
        inputElem.style.height =
          (scrollHeight > 114 ? 114 : scrollHeight) + 'px';
      }
    }
  });

  return <TextArea ref={refs(inputRef, ref)} {...props} />;
});

export interface CommonTextFieldProps {
  left?: ReactNode;
  right?: ReactNode;
  error?: ReactNode;
  inputStyle?: CSSProperties;
}

export interface SinglelineTextFieldProps
  extends CommonTextFieldProps,
    ComponentProps<typeof Input> {
  multiline?: false;
  ref?: ForwardedRef<HTMLInputElement>;
}

export interface MultilineTextFieldProps
  extends CommonTextFieldProps,
    ComponentProps<typeof TextArea> {
  multiline: true;
  ref?: ForwardedRef<HTMLTextAreaElement>;
}

export type TextFieldProps = SinglelineTextFieldProps | MultilineTextFieldProps;

export default function TextField(props: SinglelineTextFieldProps): ReactNode;
export default function TextField(props: MultilineTextFieldProps): ReactNode;
export default function TextField(props: TextFieldProps) {
  const {
    className,
    style,
    inputStyle,
    skin = 'underline',
    multiline,
    left,
    right,
    readOnly,
    autoFocus,
    error,
    ...htmlProps
  } = props;
  const commonProps = {
    skin,
    readOnly,
    style: inputStyle,
  };

  const [focus, setFocus] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>();
  useEffect(() => {
    // Somehow React's autoFocus doesn't work, so handle it manually
    if (autoFocus && inputRef.current) {
      // This needs setTimeout to work
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, []);

  const isForInput = (_rest: any): _rest is ComponentProps<typeof Input> =>
    multiline !== true;
  const isForTextArea = (
    _rest: any
  ): _rest is ComponentProps<typeof TextArea> => multiline === true;

  let innerTextField: ReactElement | null = null;
  if (isForInput(htmlProps)) {
    const { ref, size, onFocus, onBlur, ...inputProps } = htmlProps;
    innerTextField = (
      <Input
        {...commonProps}
        {...inputProps}
        ref={refs(inputRef, ref)}
        size={size}
        onFocus={(e) => {
          setFocus(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocus(false);
          onBlur?.(e);
        }}
      />
    );
  }
  if (isForTextArea(htmlProps)) {
    const { ref, onFocus, onBlur, ...textAreaProps } = htmlProps;
    innerTextField = (
      <MultilineInput
        {...commonProps}
        {...textAreaProps}
        ref={refs(inputRef, ref)}
        onFocus={(e) => {
          setFocus(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocus(false);
          onBlur?.(e);
        }}
      />
    );
  }

  return (
    <TextFieldWrapper
      {...{ className, style, skin, error, multiline }}
      focus={!readOnly && focus}
    >
      {left}
      {innerTextField}
      {right}
      {!!error && (
        <ErrorMessage
          skin="error"
          position="bottom"
          align="start"
          focus={focus}
        >
          {error}
        </ErrorMessage>
      )}
    </TextFieldWrapper>
  );
}
