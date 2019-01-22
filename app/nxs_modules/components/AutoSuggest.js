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

const Suggestion = styled.div(
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

export default class AutoSuggest extends React.Component {
  static defaultProps = {
    inputComponent: TextField,
  };

  state = {
    active: false,
    selected: null,
  };

  inputRef = React.createRef();

  getCurrentSuggestions = memoize((suggestions, inputValue) => {
    if (!suggestions) return [];
    const value = new String(inputValue || '').toLowerCase();
    return suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(value)
    );
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
    const { selected } = this.state;
    const currentSuggestions = this.getCurrentSuggestions(
      this.props.suggestions,
      this.props.inputProps && this.props.inputProps.value
    );

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
          this.setState({ selected: null });
        } else if (selected === 0) {
          this.setState({ selected: currentSuggestions.length - 1 });
        } else {
          this.setState({ selected: selected - 1 });
        }
        break;
      case 'Tab':
      case 'Enter':
        if (selected !== null) {
          e.preventDefault();
          this.props.inputProps.onChange &&
            this.props.onSelect(currentSuggestions[selected]);
        }
        break;
    }
    this.props.onKeyDown && this.props.onKeyDown(e);
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
    const { onSelect, inputProps, inputComponent: Input, ...rest } = this.props;
    const { active, selected } = this.state;
    const currentSuggestions = this.getCurrentSuggestions(
      this.props.suggestions,
      this.props.inputProps && this.props.inputProps.value
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
              key={suggestion}
              selected={selected === i}
              onClick={() => {
                onSelect && onSelect(suggestion);
              }}
            >
              {suggestion}
            </Suggestion>
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
