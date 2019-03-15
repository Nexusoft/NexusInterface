// External
import React from 'react';
import { clipboard } from 'electron';
import styled from '@emotion/styled';

// Internal
import TextField from 'components/TextField';
import Text from 'components/Text';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import Button from 'components/Button';
import UIController from 'components/UIController';
import copyIcon from 'images/copy.sprite.svg';

const RawAddressComponent = styled.div({
  marginTop: '1em',
});

const AddressTextField = styled(TextField)(
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

const CopyButton = styled(Button)(({ theme }) => ({
  borderLeft: `1px solid ${theme.mixer(0.125)}`,
}));

/**
 * Nexus Address with Copy functionality
 *
 * @export
 * @class RawAddress
 * @extends {React.Component}
 */
export default class RawAddress extends React.Component {
  inputRef = React.createRef();

  /**
   * Copy address to clipboard
   *
   * @memberof RawAddress
   */
  copyAddress = () => {
    clipboard.writeText(this.props.address);
    this.inputRef.current.select();
    UIController.showNotification(<Text id="Alert.AddressCopied" />, 'success');
  };

  /**
   * React Render
   *
   * @returns
   * @memberof RawAddress
   */
  render() {
    const { address, label, ...rest } = this.props;
    return (
      <RawAddressComponent {...rest}>
        {!!label && <Label>{label}</Label>}
        <AddressTextField
          readOnly
          skin="filled-dark"
          value={address}
          inputRef={this.inputRef}
          right={
            <Tooltip.Trigger tooltip="Copy to clipboard">
              <CopyButton
                skin="filled-dark"
                fitHeight
                grouped="right"
                onClick={this.copyAddress}
              >
                <Icon icon={copyIcon} className="space-right" />
              </CopyButton>
            </Tooltip.Trigger>
          }
          hasLabel={!!label}
        />
      </RawAddressComponent>
    );
  }
}
