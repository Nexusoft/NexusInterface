// External
import React from 'react';
import { connect } from 'react-redux';
import { clipboard } from 'electron';
import styled from '@emotion/styled';

// Internal
import Text from 'components/Text';
import Tooltip from 'components/Tooltip';
import { showNotification } from 'actions/overlays';
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
  height: '100%',
  display: 'flex',
  alignItems: 'center',
});

const AddressCopy = styled.div(
  {
    flexGrow: 1,
    overflow: 'hidden',
  },
  ({ left, overflown }) =>
    left && {
      maskImage:
        'linear-gradient(to left, transparent 0%, black 10%, black 100%)',
      maskImage: overflown ? undefined : 'none',
    },
  ({ right, overflown }) =>
    right && {
      display: 'flex',
      justifyContent: 'flex-end',
      maskImage:
        'linear-gradient(to right, transparent 0%, black 10%, black 100%)',
      display: overflown ? undefined : 'none',
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
@connect(
  null,
  { showNotification }
)
export default class TruncateMiddleAddress extends React.Component {
  addressRef = React.createRef();
  contentRef = React.createRef();

  state = { overflown: false };

  /**
   *
   *
   * @memberof TruncateMiddleAddress
   */
  checkOverflow = () => {
    const containerWidth = this.addressRef.current.clientWidth;
    const contentWidth = this.contentRef.current.offsetWidth;

    if (contentWidth > containerWidth && !this.state.overflown) {
      this.setState({ overflown: true });
    }
    if (contentWidth <= containerWidth && this.state.overflown) {
      this.setState({ overflown: false });
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
    this.resizeObserver.observe(this.addressRef.current);
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
    this.resizeObserver.unobserve(this.addressRef.current);
  }

  /**
   * Copy address to clipboard
   *
   * @memberof TruncateMiddleAddress
   */
  copyAddress = () => {
    clipboard.writeText(this.props.address);
    this.props.showNotification(<Text id="Alert.AddressCopied" />, 'success');
  };

  /**
   * React Render
   *
   * @returns
   * @memberof TruncateMiddleAddress
   */
  render() {
    const { address, label, ...rest } = this.props;
    const { overflown } = this.state;
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
            <Address ref={this.addressRef}>
              <AddressCopy left overflown={overflown}>
                <AddressContent ref={this.contentRef}>{address}</AddressContent>
              </AddressCopy>
              <Ellipsis hidden={!overflown}>...</Ellipsis>
              <AddressCopy right overflown={overflown}>
                {address}
              </AddressCopy>
            </Address>
          </AddressWrapper>
        </Tooltip.Trigger>
      </TruncateMiddleAddressComponent>
    );
  }
}
