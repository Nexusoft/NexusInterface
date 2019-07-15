// External
import React from 'react';
import { connect } from 'react-redux';
import { clipboard } from 'electron';
import styled from '@emotion/styled';

// Internal
import Text from 'components/Text';
import Tooltip from 'components/Tooltip';
import { showNotification } from 'actions/globalUI';
import { consts, timing } from 'styles';

const SegmentedAddressComponent = styled.div({
  marginTop: '1em',
});

const Address = styled.div(
  ({ theme }) => ({
    width: '100%',
    background: theme.background,
    color: theme.foreground,
    border: `1px solid ${theme.mixer(0.125)}`,
    borderRadius: 2,
    fontFamily: consts.monoFontFamily,
    lineHeight: 1.3,
    padding: '.3em 1em',
    textAlign: 'center',
    whiteSpace: 'pre',
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
 * @class SegmentedAddress
 * @extends {React.Component}
 */
@connect(
  null,
  { showNotification }
)
export default class SegmentedAddress extends React.Component {
  addressRef = React.createRef();

  /**
   * Copy address to clipboard
   *
   * @memberof SegmentedAddress
   */
  copyAddress = () => {
    clipboard.writeText(this.props.address);
    this.props.showNotification(<Text id="Alert.AddressCopied" />, 'success');
  };

  /**
   *
   *
   * @memberof SegmentedAddress
   */
  renderAddress = () => {
    const { address } = this.props;
    const line1 = [
      address.substring(0, 6),
      address.substring(6, 11),
      address.substring(11, 16),
      address.substring(16, 21),
      address.substring(21, 26),
    ];
    const line2 = [
      ' ' + address.substring(26, 31),
      address.substring(31, 36),
      address.substring(36, 41),
      address.substring(41, 46),
      address.substring(46, 51),
    ];
    return `${line1.join(' ')}\n${line2.join(' ')}`;
  };

  /**
   * React Render
   *
   * @returns
   * @memberof SegmentedAddress
   */
  render() {
    const { address, label, ...rest } = this.props;
    return (
      <SegmentedAddressComponent {...rest}>
        {!!label && <Label>{label}</Label>}

        <Tooltip.Trigger tooltip="Click to copy to clipboard">
          <Address
            readOnly
            ref={this.addressRef}
            hasLabel={!!label}
            onClick={this.copyAddress}
          >
            {this.renderAddress()}
          </Address>
        </Tooltip.Trigger>
      </SegmentedAddressComponent>
    );
  }
}
