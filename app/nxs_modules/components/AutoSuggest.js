// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import TextField from 'components/TextField';
import Button from 'components/Button';
import Arrow from 'components/Arrow';
import { timing, consts } from 'styles';

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

const Suggestion = styled.div(({ theme }) => ({
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
}));

export default class AutoSuggest extends React.Component {
  static defaultProps = {
    inputComponent: TextField,
  };

  static getDerivedStateFromProps({ suggestions, inputProps }) {
    const value = inputProps.value || '';
    return {
      currentSuggestions: suggestions.filter(suggestion =>
        suggestion.includes(value)
      ),
    };
  }

  state = {
    active: false,
    currentSuggestions: [],
  };

  inputRef = React.createRef();

  handleInputFocus = e => {
    this.setState({ active: true });
    this.props.onFocus && this.props.onFocus(e);
  };

  handleInputBlur = () => {
    this.setState({ active: false });
    this.props.onBlur && this.props.onBlur(e);
  };

  focusInput = () => {
    this.inputRef.current.focus();
  };

  arrowButton = () => {
    return (
      <Button square skin="blank-light" onClick={this.focusInput}>
        <Arrow direction="down" width={12} height={8} />
      </Button>
    );
  };

  render() {
    const { onSelect, inputProps, inputComponent: Input, ...rest } = this.props;
    return (
      <AutoSuggestComponent {...rest}>
        <Input
          inputRef={this.inputRef}
          right={this.arrowButton()}
          {...inputProps}
          onFocus={this.handleInputFocus}
          onBlur={this.handleInputBlur}
        />
        <Suggestions active={this.state.active}>
          {this.state.currentSuggestions.map(suggestion => (
            <Suggestion
              key={suggestion}
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
