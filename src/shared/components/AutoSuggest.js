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
import { useState, memo, useRef, useEffect, forwardRef } from 'react';
import { findDOMNode } from 'react-dom';
import styled from '@emotion/styled';

// Internal
import TextField from 'components/TextField';
import Button from 'components/Button';
import Arrow from 'components/Arrow';
import { refs } from 'utils/misc';
import memoize from 'utils/memoize';
import { timing } from 'styles';

/**
 * `suggestions` can be an object in `{value: string, display: any}` shape,
 * or a string if value and display are the same
 */

const getValue = (suggestion) =>
  typeof suggestion === 'object' ? suggestion && suggestion.value : suggestion;
const getDisplay = (suggestion) =>
  typeof suggestion === 'object'
    ? suggestion && suggestion.display
    : suggestion;

const SuggestionComponent = styled.div(
  ({ theme }) => ({
    padding: '0.4em 0.8em',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: `background-color ${timing.normal}`,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    color: theme.foreground,
    position: 'relative',

    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      width: 12,
      transition: `opacity ${timing.normal}`,
      zIndex: 1,
    },
    '&::before': {
      background: `linear-gradient(to right, transparent, ${theme.background} 50%, ${theme.background})`,
      opacity: 1,
    },
    '&::after': {
      background: `linear-gradient(to right, transparent, ${theme.mixer(
        0.125
      )} 50%, ${theme.mixer(0.125)})`,
      opacity: 0,
    },
  }),
  ({ active, theme }) =>
    active && {
      background: theme.mixer(0.125),

      '&::before': {
        opacity: 0,
      },
      '&::after': {
        opacity: 1,
      },
    }
);

const Suggestion = memo(function ({
  index,
  activeIndex,
  suggestion,
  onSelect,
  inputRef,
  activate,
}) {
  const handleSelect = () => {
    onSelect?.(getValue(suggestion));
    // Fix selecting an option not triggering validation on blur event
    inputRef.current?.focus();
    setTimeout(() => {
      inputRef.current?.blur();
    }, 0);
  };

  const handleMouseEnter = () => {
    activate(index);
  };

  return (
    <SuggestionComponent
      active={index === activeIndex}
      onClick={handleSelect}
      onMouseEnter={handleMouseEnter}
    >
      {getDisplay(suggestion)}
    </SuggestionComponent>
  );
});

const AutoSuggestComponent = styled.div({
  position: 'relative',
});

const Suggestions = styled.div(
  ({ theme }) => ({
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    opacity: 0,
    maxHeight: 184,
    overflowY: 'auto',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    paddingBottom: 4,
    background: theme.background,
    boxShadow: `0 4px 4px rgba(0,0,0,.7)`,
    visibility: 'hidden',
    transition: `opacity ${timing.normal}, visibility ${timing.normal}`,
    zIndex: 1,
  }),
  ({ open }) =>
    open && {
      opacity: 1,
      visibility: 'visible',
    }
);

const ClearButton = styled(Button)(
  {
    padding: '0 .2em',
    marginLeft: '.5em',
    fontSize: '.8em',
  },
  ({ shown }) =>
    !shown && {
      display: 'none',
    }
);

const defaultFilterSuggestions = memoize((suggestions, inputValue) => {
  if (!suggestions) return [];
  const query = new String(inputValue || '').toLowerCase();
  return suggestions.filter((suggestion) => {
    const value = getValue(suggestion);
    return (
      !!value &&
      typeof value === 'string' &&
      value.toLowerCase().includes(query)
    );
  });
});

const AutoSuggest = forwardRef(
  (
    {
      filterSuggestions = defaultFilterSuggestions,
      suggestOn = 'focus',
      suggestions,
      onSelect,
      inputProps = {},
      inputComponent: Input = TextField,
      keyControl = true,
      emptyFiller,
      ...rest
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null);
    const currentSuggestions = filterSuggestions(suggestions, inputProps.value);

    const inputRef = useRef();
    const suggestionsRef = useRef();

    useEffect(() => {
      if (inputProps.value) {
        setActiveIndex(null);
      }
    }, [inputProps.value]);

    const handleInputFocus = (e) => {
      if (suggestOn === 'focus') {
        setOpen(true);
      }
      inputProps.onFocus?.(e);
    };

    const handleInputBlur = (e) => {
      setOpen(false);
      inputProps.onBlur?.(e);
    };

    const handleInputChange = (e) => {
      if (suggestOn === 'change') {
        setOpen(true);
      }
      inputProps.onChange?.(e);
    };

    const scrollToNewSelection = (index) => {
      setActiveIndex(index);
      if (index !== null) {
        const suggestionsEl = findDOMNode(suggestionsRef.current);
        const suggestionEl = suggestionsEl.children[index];
        suggestionEl.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
          behavior: 'smooth',
        });
      }
    };

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (activeIndex === null) {
            scrollToNewSelection(0);
          } else if (activeIndex < currentSuggestions.length - 1) {
            scrollToNewSelection(activeIndex + 1);
          } else {
            scrollToNewSelection(null);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (activeIndex === null) {
            scrollToNewSelection(currentSuggestions.length - 1);
          } else if (activeIndex !== 0) {
            scrollToNewSelection(activeIndex - 1);
          } else {
            scrollToNewSelection(null);
          }
          break;
        case 'Tab':
        case 'Enter':
          if (activeIndex !== null) {
            e.preventDefault();
            const activeSuggestion = currentSuggestions[activeIndex];
            const value = getValue(activeSuggestion);
            onSelect?.(value);
          }
          break;
      }
      inputProps.onKeyDown?.(e);
    };

    const clearInput = () => {
      onSelect?.('');
      focusInput();
    };

    const focusInput = () => {
      inputRef.current?.focus();
    };

    return (
      <AutoSuggestComponent {...rest}>
        <Input
          ref={refs(ref, inputRef)}
          right={
            <div className="flex center" style={{ alignSelf: 'stretch' }}>
              <ClearButton
                fitHeight
                skin="plain"
                onClick={clearInput}
                shown={!!inputProps?.value}
              >
                ✕
              </ClearButton>
              <Button fitHeight skin="plain" onClick={focusInput}>
                <Arrow direction="down" width={12} height={8} />
              </Button>
            </div>
          }
          {...inputProps}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={keyControl ? handleKeyDown : inputProps.onKeyDown}
          onChange={handleInputChange}
        />
        <Suggestions
          ref={suggestionsRef}
          open={open && (!!emptyFiller || currentSuggestions.length > 0)}
        >
          {currentSuggestions.map((suggestion, i) => (
            <Suggestion
              key={i}
              index={i}
              activeIndex={activeIndex}
              activate={setActiveIndex}
              suggestion={suggestion}
              onSelect={onSelect}
              inputRef={inputRef}
            />
          ))}
          {currentSuggestions.length === 0 && !!emptyFiller && (
            <SuggestionComponent>{emptyFiller}</SuggestionComponent>
          )}
        </Suggestions>
      </AutoSuggestComponent>
    );
  }
);

export default AutoSuggest;
