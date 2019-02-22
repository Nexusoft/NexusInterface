// External
import React from 'react';
import { clipboard } from 'electron';
import styled from '@emotion/styled';

// Internal
import Text from 'components/Text';
import Tooltip from 'components/Tooltip';
import UIController from 'components/UIController';
import { timing, consts } from 'styles';

const TruncateMiddleAddressComponent = styled.div({
  marginTop: '1em',
});

const AddressWrapper = styled.div(
  ({ theme }) => ({
    width: '100%',
    height: consts.inputHeightEm + 'em',
    background: theme.background,
    color: theme.foreground,
    border: `1px solid ${theme.mixer(0.125)}`,
    borderRadius: 2,
    padding: '0 .8em',
    cursor: 'pointer',
    userSelect: 'none',
    transition: `background ${timing.normal}`,

    '&:hover': {
      background: theme.mixer(0.05),
    },
  }),
  ({ hasLabel }) =>
    hasLabel && {
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
    }
);

const Address = styled.div({
  width: '100%',
  display: 'flex',
});

const AddressCopy = styled.div(
  {
    flexGrow: 1,
    overflow: 'hidden',
  },
  ({ left }) =>
    left && {
      maskImage:
        'linear-gradient(to left, transparent 0%, black 10%, black 100%)',
    },
  ({ left, overflow }) =>
    left &&
    !overflow && {
      maskImage: 'none',
    },
  ({ right }) =>
    right && {
      display: 'flex',
      justifyContent: 'flex-end',
      maskImage:
        'linear-gradient(to right, transparent 0%, black 10%, black 100%)',
    },
  ({ right, overflow }) =>
    right &&
    !overflow && {
      display: 'none',
    }
);

const AddressContent = styled.div({
  whiteSpace: 'nowrap',
  width: 'max-content',
});

const Ellipsis = styled.div(
  {
    flexShrink: 0,
    letterSpacing: 1,
    opacity: 0.5,
  },
  ({ hidden }) =>
    hidden && {
      display: 'none',
    }
);

const Label = styled.div(({ theme }) => ({
  borderTopLeftRadius: 2,
  borderTopRightRadius: 2,
  background: theme.mixer(0.125),
  fontSize: '.9em',
  padding: '.1em .4em',
}));

/**
 * Nexus Address with Copy functionality
 *
 * @export
 * @class TruncateMiddleAddress
 * @extends {React.Component}
 */
export default class TruncateMiddleAddress extends React.Component {
  wrapperRef = React.createRef();
  addressRef = React.createRef();

  state = { overflow: false };

  /**
   *
   *
   * @memberof TruncateMiddleAddress
   */
  checkOverflow = () => {
    const addressWidth = this.addressRef.current.offsetWidth;
    const wrapperWidth = this.wrapperRef.current.clientWidth;

    if (addressWidth > wrapperWidth && !this.state.overflow) {
      this.setState({ overflow: true });
    }
    if (addressWidth <= wrapperWidth && this.state.overflow) {
      this.setState({ overflow: false });
    }
  };

  resizeObserver = new ResizeObserver(this.checkOverflow);

  /**
   *
   *
   * @memberof TruncateMiddleAddress
   */
  componentDidMount() {
    this.checkOverflow();
    this.resizeObserver.observe(this.wrapperRef.current);
  }

  /**
   *
   *
   * @memberof TruncateMiddleAddress
   */
  componentDidUpdate() {
    this.checkOverflow();
  }

  /**
   *
   *
   * @memberof TruncateMiddleAddress
   */
  componentWillUnmount() {
    this.resizeObserver.unobserve(this.wrapperRef.current);
  }

  /**
   * Copy address to clipboard
   *
   * @memberof TruncateMiddleAddress
   */
  copyAddress = () => {
    clipboard.writeText(this.props.address);
    UIController.showNotification(<Text id="Alert.Copied" />, 'success');
  };

  /**
   * React Render
   *
   * @returns
   * @memberof TruncateMiddleAddress
   */
  render() {
    const { address, label, ...rest } = this.props;
    const { overflow } = this.state;
    return (
      <TruncateMiddleAddressComponent {...rest}>
        {!!label && <Label>{label}</Label>}

        <Tooltip.Trigger tooltip="Click to copy to clipboard">
          <AddressWrapper
            hasLabel={!!label}
            inputProps={{
              style: { cursor: 'pointer' },
            }}
            onClick={this.copyAddress}
          >
            <Address ref={this.wrapperRef}>
              <AddressCopy left overflow={overflow}>
                <AddressContent ref={this.addressRef}>{address}</AddressContent>
              </AddressCopy>
              <Ellipsis hidden={!overflow}>...</Ellipsis>
              <AddressCopy right overflow={overflow}>
                {address}
              </AddressCopy>
            </Address>
          </AddressWrapper>
        </Tooltip.Trigger>
      </TruncateMiddleAddressComponent>
    );
  }
}
