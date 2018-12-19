// External Dependencies
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal Dependencies
import Button from 'components/common/Button';
import Arrow from 'components/common/Arrow';
import Overlay from 'components/common/Overlay';
import { colors, timing } from 'styles';

const optionHeight = 36;

const ComboBoxWrapper = styled.div({});

const ComboBoxControl = styled.div(
  {
    display: 'flex',
    alignItems: 'stretch',
    backgroundColor: colors.lighterGray,
    color: colors.dark,
    height: optionHeight,
    borderRadius: 2,
    cursor: 'pointer',
    transition: `background-color ${timing.normal}`,

    '&:hover': {
      backgroundColor: colors.light,
    },
  },
  ({ opening }) =>
    opening && {
      backgroundColor: colors.light,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    }
);

const CurrentValue = styled.div({
  flexGrow: 1,
  flexBasis: 0,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '.8em',
});

const ArrowButton = styled(Button)({
  paddingTop: 0,
  paddingBottom: 0,
});

const Options = styled.ul({
  position: 'absolute',
  overflowY: 'auto',
  backgroundColor: colors.light,
  padding: 0,
  margin: 0,
});

const Option = styled.li({
  height: optionHeight,
  display: 'flex',
  alignItems: 'center',
  padding: '0 .8em',
  overflow: 'visible',
  color: colors.dark,
  cursor: 'pointer',
  transition: `background-color ${timing.normal}`,

  '&:hover': {
    backgroundColor: colors.lighterGray,
  },
});

export default class ComboBox extends Component {
  state = {
    open: false,
    // Options dropdown's size and position
    top: 0,
    left: 0,
    width: 200,
  };

  option = value => this.props.options.find(o => o.value === value);

  open = () => {
    const {
      top,
      left,
      width,
      height,
    } = this.controlRef.getBoundingClientRect();
    this.setState({ open: true, top: top + height, left, width });
  };

  close = () => {
    this.setState({ open: false });
  };

  render() {
    const { options, value, onChange } = this.props;
    const { open, top, left, width } = this.state;

    return (
      <ComboBoxWrapper>
        <ComboBoxControl
          ref={el => (this.controlRef = el)}
          opening={open}
          onClick={this.open}
        >
          <CurrentValue>{this.option(value).display}</CurrentValue>
          <Button blank dark>
            <Arrow down width={12} height={8} />
          </Button>
        </ComboBoxControl>

        {open && (
          <Overlay onBackgroundClick={this.close}>
            <Options style={{ top, left, width }}>
              {options.map(option => (
                <Option
                  key={option.value}
                  onClick={() => {
                    console.log('onCLick', option.value);
                    this.close();
                    onChange(option.value);
                  }}
                >
                  {option.display}
                </Option>
              ))}
            </Options>
          </Overlay>
        )}
      </ComboBoxWrapper>
    );
  }
}
