// External
import React from 'react';
import { connect } from 'react-redux';
import { clipboard } from 'electron';
import styled from '@emotion/styled';

// Internal
import TextField from 'components/TextField';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import Button from 'components/Button';
import { showNotification } from 'actions/overlays';
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
@connect(
  null,
  { showNotification }
)
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
    this.props.showNotification(
      _('Address has been copied to clipboard'),
      'success'
    );
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
          skin="filled-inverted"
          value={address}
          inputRef={this.inputRef}
          right={
            <Tooltip.Trigger tooltip={_('Copy to clipboard')}>
              <CopyButton
                skin="filled-inverted"
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
