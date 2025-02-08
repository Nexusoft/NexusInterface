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

// External Dependencies
import {
  useRef,
  forwardRef,
  useState,
  useEffect,
  MutableRefObject,
  CSSProperties,
  ReactNode,
  ForwardedRef,
} from 'react';
import styled from '@emotion/styled';

// Internal Dependencies
import Button from 'components/Button';
import Arrow from 'components/Arrow';
import Overlay from 'components/Overlay';
import Tooltip from 'components/Tooltip';
import { timing, consts, animations } from 'styles';
import { refs } from 'utils/misc';

export type SelectSkin = 'underline' | 'filled' | 'filled-inverted';

export type SelectValue = string | number | boolean | null;

interface RealSelectOption<TValue extends SelectValue> {
  value: TValue;
  display?: ReactNode;
  indent?: boolean;
  isSeparator?: boolean;
  isDummy?: false;
}

interface DummyOption {
  value?: undefined;
  display?: undefined;
  indent?: undefined;
  isSeparator?: undefined;
  isDummy: true;
}

export type SelectOption<TValue extends SelectValue> =
  | RealSelectOption<TValue>
  | DummyOption;

// Minimum gap from the dropdown to the edges of the screen
const minScreenGap = 10;
// Options's horizontal padding
const optionHPadding = 12;

const ErrorMessage = styled(Tooltip)({
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
});

const SelectControl = styled.div<{
  skin: SelectSkin;
  active?: boolean;
  error?: ReactNode;
}>(
  {
    display: 'flex',
    alignItems: 'stretch',
    cursor: 'pointer',
    height: consts.inputHeightEm + 'em',
    position: 'relative',

    '&:hover': {
      [ErrorMessage as any]: {
        opacity: 1,
        visibility: 'visible',
      },
    },
  },

  ({ skin, active, theme, error }) => {
    switch (skin) {
      case 'underline':
        return {
          background: 'transparent',
          color: theme.mixer(0.875),
          transitionProperty: 'color, border-bottom-color',
          transitionDuration: timing.normal,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            borderRadius: 1,
            background: error ? theme.danger : theme.mixer(0.5),
            transitionProperty: 'background-color',
            transitionDuration: timing.normal,
          },
          '&:hover': {
            color: theme.foreground,
            borderBottomColor: theme.mixer(0.75),
            '&::after': {
              background: error
                ? theme.raise(theme.danger, 0.3)
                : theme.mixer(0.75),
            },
          },
          ...(active
            ? {
                color: theme.foreground,
                '&&::after': {
                  background: error
                    ? theme.raise(theme.danger, 0.3)
                    : theme.raise(theme.primary, 0.3),
                },
              }
            : null),
        };
      case 'filled':
        return {
          paddingLeft: '.8em',
          background: theme.mixer(0.875),
          color: theme.background,
          borderRadius: 2,
          transition: `background-color ${timing.normal}`,
          '&:hover': {
            background: theme.foreground,
          },
          ...(active
            ? {
                background: theme.foreground,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }
            : null),
        };
      case 'filled-inverted':
        return {
          paddingLeft: '.8em',
          border: `1px solid ${theme.mixer(0.125)}`,
          background: theme.background,
          color: theme.foreground,
          borderRadius: 2,
          transitionProperty: 'background-color',
          transitionDuration: timing.normal,
          '&:hover': {
            background: theme.mixer(0.125),
          },
          ...(active
            ? {
                background: theme.mixer(0.125),
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }
            : null),
          ...(error
            ? {
                borderColor: theme.danger,
              }
            : null),
        };
    }
  }
);

const CurrentValue = styled.div({
  flexGrow: 1,
  flexBasis: 0,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  whiteSpace: 'nowrap',
});

const Placeholder = styled.span(({ theme }) => ({
  color: theme.mixer(0.5),
}));

const OptionsComponent = styled.div<{
  skin: SelectSkin;
  ready?: boolean;
}>(
  {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 'auto',
    height: 'auto',
    visibility: 'hidden',
    overflowY: 'auto',
    borderRadius: 4,
    padding: '4px 0',
    margin: 0,
    boxShadow: `0 0 8px rgba(0,0,0,.7)`,
  },
  ({ skin, theme }) => {
    switch (skin) {
      case 'underline':
        return {
          background: theme.background,
          color: theme.foreground,
        };
      case 'filled':
        return {
          background: theme.foreground,
          color: theme.background,
        };
      case 'filled-inverted':
        return {
          background: theme.background,
          color: theme.foreground,
        };
    }
  },
  ({ ready }) =>
    ready && {
      visibility: 'visible',
      animation: `${animations.fadeIn} ${timing.quick} ease-out`,
    }
);

const Option = styled.div<{
  skin: SelectSkin;
  selected?: boolean;
  selectable?: boolean;
}>(
  {
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${optionHPadding}px`,
    overflow: 'hidden',
    transition: `background-color ${timing.normal}`,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    height: consts.inputHeightEm + 'em',
  },
  ({ selectable }) => ({
    cursor: selectable ? 'pointer' : undefined,
  }),
  ({ skin, selected, theme, selectable }) => {
    switch (skin) {
      case 'underline':
        return {
          background: selected ? theme.primary : undefined,
          color: selected ? theme.primaryAccent : undefined,
          '&:hover': {
            background: selected
              ? theme.primary
              : selectable
              ? theme.mixer(0.125)
              : undefined,
          },
        };
      case 'filled':
        return {
          '&:hover': {
            background: selectable ? theme.mixer(0.875) : undefined,
          },
        };
      case 'filled-inverted':
        return {
          background: selected ? theme.primary : undefined,
          color: selected ? theme.primaryAccent : undefined,
          '&:hover': {
            background: selected
              ? theme.primary
              : selectable
              ? theme.mixer(0.125)
              : undefined,
          },
        };
    }
  }
);

function Options<TValue extends SelectValue>({
  controlRef,
  skin,
  options,
  close,
  value,
  onChange,
}: {
  controlRef: MutableRefObject<HTMLDivElement | undefined>;
  skin: SelectSkin;
  options: SelectOption<TValue>[];
  close: () => void;
  value: TValue;
  onChange: (value: TValue) => void;
}) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const elemRef = useRef<HTMLDivElement>();
  const scrollTopRef = useRef<number>();
  const styleRef = useRef<CSSProperties>({
    fontSize: controlRef.current
      ? window
          .getComputedStyle(controlRef.current)
          .getPropertyValue('font-size')
      : undefined,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!anchorRef.current || !controlRef.current || !elemRef.current) return;
    const styles = { ...styleRef.current };

    // Horizontally align Options dropdown with the Select control
    const controlRect = controlRef.current.getBoundingClientRect();
    if (skin === 'underline') {
      styles.left = controlRect.left - optionHPadding;
      styles.width = controlRect.width + optionHPadding;
    } else {
      styles.left = controlRect.left;
      styles.width = controlRect.width;
    }

    // Vertically align Selected Option with the Select control
    const thisRect = elemRef.current.getBoundingClientRect();
    const selectedRect = anchorRef.current.getBoundingClientRect();
    const selectedOptTop = selectedRect.top - (thisRect.top || 0);
    styles.top = controlRect.top - selectedOptTop;

    styles.height = thisRect.height || 0;

    // Prevent the Options dropdown to outreach the top of the screen
    if (styles.top < minScreenGap) {
      scrollTopRef.current = minScreenGap - styles.top;
      styles.height = styles.top + styles.height - minScreenGap;
      styles.top = minScreenGap;
    }

    // Prevent the Options dropdown to outreach the screen
    if (styles.top + styles.height > window.innerHeight - minScreenGap) {
      styles.height = window.innerHeight - minScreenGap - styles.top;
    }

    styleRef.current = styles;
    setReady(true);
  }, []);

  const select = (option: SelectOption<TValue>) => {
    close();
    if (!option.isDummy) {
      onChange(option.value);
    }
  };

  const selectedIndex = options.findIndex((o) => o.value === value);
  const anchorIndex = selectedIndex !== -1 ? selectedIndex : 0;
  return (
    <Overlay onBackgroundClick={close}>
      <OptionsComponent
        skin={skin}
        ref={(el) => {
          if (el && scrollTopRef.current) {
            el.scrollTop = scrollTopRef.current;
            scrollTopRef.current = undefined;
          }
          elemRef.current = el || undefined;
        }}
        style={styleRef.current}
        ready={ready}
      >
        {options.map((option, i) => (
          <Option
            key={option.isDummy ? i : String(option.value)}
            skin={skin}
            onClick={!option.isSeparator ? () => select(option) : () => null}
            selected={option.value === value && !option.isDummy}
            selectable={!option.isSeparator}
            ref={i === anchorIndex ? anchorRef : undefined}
          >
            {option.indent && <>&nbsp;&nbsp;</>}{' '}
            {option.display || option.value}
          </Option>
        ))}
      </OptionsComponent>
    </Overlay>
  );
}

interface SelectProps<TValue extends SelectValue> {
  options?: SelectOption<TValue>[];
  skin?: SelectSkin;
  value: TValue;
  error?: ReactNode;
  onChange: (value: TValue) => void;
  placeholder?: string;
}

function RawSelect<TValue extends SelectValue>(
  {
    options,
    skin = 'underline',
    value,
    error,
    onChange,
    placeholder,
    ...rest
  }: SelectProps<TValue>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const controlRef = useRef<HTMLDivElement>();
  const [open, setOpen] = useState(false);

  options = options?.length
    ? options
    : [
        {
          isDummy: true,
        },
      ];

  const selectedOption = options.find((o) => o.value === value);

  return (
    <>
      <SelectControl
        ref={refs(controlRef, ref)}
        active={open}
        onClick={() => {
          setOpen(true);
        }}
        skin={skin}
        error={error}
        {...rest}
      >
        <CurrentValue>
          {selectedOption ? (
            selectedOption.display || selectedOption.value
          ) : (
            <Placeholder>{placeholder}</Placeholder>
          )}
        </CurrentValue>
        <Button fitHeight skin={skin === 'filled' ? 'plain-inverted' : 'plain'}>
          <Arrow direction="down" width={12} height={8} />
        </Button>
        {!!error && (
          <ErrorMessage skin="error" position="bottom" align="start">
            {error}
          </ErrorMessage>
        )}
      </SelectControl>

      {open && (
        <Options
          {...{ skin, value, onChange }}
          options={options}
          close={() => {
            setOpen(false);
          }}
          controlRef={controlRef}
        />
      )}
    </>
  );
}

const Select = forwardRef(RawSelect);

export default Select;
