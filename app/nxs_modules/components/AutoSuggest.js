// External
import React from 'react';
import { findDOMNode } from 'react-dom';
import memoize from 'memoize-one';
import styled from '@emotion/styled';

// Internal
import TextField from 'components/TextField';
import Button from 'components/Button';
import Arrow from 'components/Arrow';
import { timing, consts } from 'styles';

/**
 * `suggestions` can be an object in `{value: string, display: any}` shape,
 * or a string if value and display are the same
 */

const getValue = suggestion =>
  typeof suggestion === 'object' ? suggestion && suggestion.value : suggestion;
const getDisplay = suggestion =>
  typeof suggestion === 'object'
    ? suggestion && suggestion.display
    : suggestion;

const SuggestionComponent = styled.div(
  ({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: `background-color ${timing.normal}`,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    height: consts.inputHeightEm + 'em',
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
      background: `linear-gradient(to right, transparent, ${
        theme.background
      } 50%, ${theme.background})`,
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

class Suggestion extends React.PureComponent {
  handleSelect = () => {
    const { suggestion, onSelect } = this.props;
    onSelect && onSelect(getValue(suggestion));
  };

  handleMouseEnter = () => {
    this.props.activate(this.props.index);
  };

  render() {
    const { index, activeIndex, suggestion } = this.props;
    return (
      <SuggestionComponent
        active={index === activeIndex}
        onClick={this.handleSelect}
        onMouseEnter={this.handleMouseEnter}
      >
        {getDisplay(suggestion)}
      </SuggestionComponent>
    );
  }
}

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

export default class AutoSuggest extends React.Component {
  static defaultProps = {
    inputComponent: TextField,
  };

  state = {
    open: false,
    activeIndex: null,
  };

  inputRef = React.createRef();
  suggestionsRef = React.createRef();

  defaultFilterSuggestions = memoize((suggestions, inputValue) => {
    if (!suggestions) return [];
    const query = new String(inputValue || '').toLowerCase();
    return suggestions.filter(suggestion => {
      const value = getValue(suggestion);
      return (
        !!value &&
        typeof value === 'string' &&
        value.toLowerCase().includes(query)
      );
    });
  });

  componentDidUpdate(prevProps) {
    if (
      prevProps.inputProps &&
      this.props.inputProps &&
      prevProps.inputProps.value !== this.props.inputProps.value
    ) {
      this.setState({ activeIndex: null });
    }
  }

  handleInputFocus = e => {
    this.setState({ open: true });
    this.props.inputProps.onFocus && this.props.inputProps.onFocus(e);
  };

  handleInputBlur = e => {
    this.setState({ open: false });
    this.props.inputProps.onBlur && this.props.inputProps.onBlur(e);
  };

  scrollToNewSelection = index => {
    this.setState({ activeIndex: index });
    if (index !== null) {
      const suggestionsEl = findDOMNode(this.suggestionsRef.current);
      const suggestionEl = suggestionsEl.children[index];
      suggestionEl.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: 'smooth',
      });
    }
  };

  handleKeyDown = e => {
    const {
      filterSuggestions = this.defaultFilterSuggestions,
      suggestions,
      inputProps,
      onSelect,
    } = this.props;
    const { activeIndex } = this.state;
    const inputValue = inputProps && inputProps.value;
    const currentSuggestions = filterSuggestions(suggestions, inputValue);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (activeIndex === null) {
          this.scrollToNewSelection(0);
        } else if (activeIndex < currentSuggestions.length - 1) {
          this.scrollToNewSelection(activeIndex + 1);
        } else {
          this.scrollToNewSelection(null);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (activeIndex === null) {
          this.scrollToNewSelection(currentSuggestions.length - 1);
        } else if (activeIndex !== 0) {
          this.scrollToNewSelection(activeIndex - 1);
        } else {
          this.scrollToNewSelection(null);
        }
        break;
      case 'Tab':
      case 'Enter':
        if (activeIndex !== null) {
          e.preventDefault();
          const activeSuggestion = currentSuggestions[activeIndex];
          const value = getValue(activeSuggestion);
          onSelect && onSelect(value);
        }
        break;
    }
    inputProps.onKeyDown && inputProps.onKeyDown(e);
  };

  clearInput = () => {
    this.props.onSelect && this.props.onSelect('');
    this.focusInput();
  };

  focusInput = () => {
    this.inputRef.current.focus();
  };

  controls = () => (
    <div className="flex center" style={{ alignSelf: 'stretch' }}>
      <ClearButton
        fitHeight
        skin="blank-light"
        onClick={this.clearInput}
        shown={this.props.inputProps && this.props.inputProps.value}
      >
        ✕
      </ClearButton>
      <Button fitHeight skin="blank-light" onClick={this.focusInput}>
        <Arrow direction="down" width={12} height={8} />
      </Button>
    </div>
  );

  activate = index => {
    this.setState({ activeIndex: index });
  };

  render() {
    const {
      filterSuggestions = this.defaultFilterSuggestions,
      suggestions,
      onSelect,
      inputProps,
      inputComponent: Input,
      ...rest
    } = this.props;
    const { open, activeIndex } = this.state;
    const currentSuggestions = filterSuggestions(
      suggestions,
      inputProps && inputProps.value
    );
    return (
      <AutoSuggestComponent {...rest}>
        <Input
          inputRef={this.inputRef}
          right={this.controls()}
          {...inputProps}
          onFocus={this.handleInputFocus}
          onBlur={this.handleInputBlur}
          onKeyDown={this.handleKeyDown}
        />
        <Suggestions
          ref={this.suggestionsRef}
          open={open && currentSuggestions.length > 0}
        >
          {currentSuggestions.map((suggestion, i) => (
            <Suggestion
              key={i}
              index={i}
              activeIndex={activeIndex}
              activate={this.activate}
              suggestion={suggestion}
              onSelect={onSelect}
            />
          ))}
        </Suggestions>
      </AutoSuggestComponent>
    );
  }
}

const AutoSuggestReduxForm = ({ input, inputProps, meta, ...rest }) => (
  <AutoSuggest
    inputProps={{ ...input, error: meta.touched && meta.error, ...inputProps }}
    {...rest}
  />
);
AutoSuggest.RF = AutoSuggestReduxForm;
