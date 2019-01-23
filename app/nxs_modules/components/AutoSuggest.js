// External
import React from 'react';
import memoize from 'memoize-one';
import styled from '@emotion/styled';

// Internal
import TextField from 'components/TextField';
import Button from 'components/Button';
import Arrow from 'components/Arrow';
import { timing, consts } from 'styles';
import { color } from 'utils';

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
    transition: `background-color ${timing.normal}, color ${timing.normal}`,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    height: consts.inputHeightEm + 'em',
    background: theme.background,
    color: theme.foreground,
    '&:hover': {
      background: theme.mixer(0.125),
    },
  }),
  ({ selected, theme }) =>
    selected && {
      background: theme.primary,
      color: theme.primaryAccent,
      '&:hover': {
        background: color.lighten(theme.primary, 0.3),
      },
    }
);

class Suggestion extends React.PureComponent {
  handleSelect = () => {
    const { suggestion, onSelect } = this.props;
    onSelect && onSelect(getValue(suggestion));
  };

  render() {
    return (
      <SuggestionComponent
        selected={this.props.selected}
        onClick={this.handleSelect}
      >
        {getDisplay(this.props.suggestion)}
      </SuggestionComponent>
    );
  }
}

const AutoSuggestComponent = styled.div({
  position: 'relative',
});

const Suggestions = styled.div(
  {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    opacity: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    paddingBottom: 4,
    boxShadow: `0 4px 4px rgba(0,0,0,.7)`,
    visibility: 'hidden',
    transition: `opacity ${timing.normal}, visibility ${timing.normal}`,
    zIndex: 1,
  },
  ({ active }) =>
    active && {
      opacity: 1,
      visibility: 'visible',
    }
);

export default class AutoSuggest extends React.Component {
  static defaultProps = {
    inputComponent: TextField,
  };

  state = {
    active: false,
    selected: null,
  };

  inputRef = React.createRef();

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
      this.setState({ selected: null });
    }
  }

  handleInputFocus = e => {
    this.setState({ active: true });
    this.props.onFocus && this.props.onFocus(e);
  };

  handleInputBlur = () => {
    this.setState({ active: false });
    this.props.onBlur && this.props.onBlur(e);
  };

  handleKeyDown = e => {
    const {
      filterSuggestions = this.defaultFilterSuggestions,
      suggestions,
      inputProps,
      onSelect,
    } = this.props;
    const { selected } = this.state;
    const inputValue = inputProps && inputProps.value;
    const currentSuggestions = filterSuggestions(suggestions, inputValue);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (selected === null) {
          this.setState({ selected: 0 });
        } else if (selected < currentSuggestions.length - 1) {
          this.setState({ selected: selected + 1 });
        } else {
          this.setState({ selected: null });
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (selected === null) {
          this.setState({ selected: currentSuggestions.length - 1 });
        } else if (selected !== 0) {
          this.setState({ selected: selected - 1 });
        } else {
          this.setState({ selected: null });
        }
        break;
      case 'Tab':
      case 'Enter':
        if (selected !== null) {
          e.preventDefault();
          const selectedSuggestion = currentSuggestions[selected];
          const value = getValue(selectedSuggestion);
          onSelect && onSelect(value);
        }
        break;
    }
    inputProps.onKeyDown && inputProps.onKeyDown(e);
  };

  focusInput = () => {
    this.inputRef.current.focus();
  };

  arrowButton = (
    <Button square skin="blank-light" onClick={this.focusInput}>
      <Arrow direction="down" width={12} height={8} />
    </Button>
  );

  render() {
    const {
      filterSuggestions = this.defaultFilterSuggestions,
      suggestions,
      onSelect,
      inputProps,
      inputComponent: Input,
      ...rest
    } = this.props;
    const { active, selected } = this.state;
    const currentSuggestions = filterSuggestions(
      suggestions,
      inputProps && inputProps.value
    );
    return (
      <AutoSuggestComponent {...rest}>
        <Input
          inputRef={this.inputRef}
          right={this.arrowButton}
          {...inputProps}
          onFocus={this.handleInputFocus}
          onBlur={this.handleInputBlur}
          onKeyDown={this.handleKeyDown}
        />
        <Suggestions active={active && currentSuggestions.length > 0}>
          {currentSuggestions.map((suggestion, i) => (
            <Suggestion
              key={i}
              suggestion={suggestion}
              selected={selected === i}
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
