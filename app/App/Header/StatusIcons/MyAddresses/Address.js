// External
import React from 'react';
import { clipboard } from 'electron';
import styled from '@emotion/styled';

// Internal
import TextField from 'components/TextField';
import Text, { translate } from 'components/Text';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import Button from 'components/Button';
import UIController from 'components/UIController';
import copyIcon from 'images/copy.sprite.svg';

const AddressTextField = styled(TextField)({
  flexGrow: 1,
  marginTop: '1em',
});

const CopyButton = styled(Button)(({ theme }) => ({
  borderLeft: `1px solid ${theme.mixer(0.125)}`,
}));

export default class Address extends React.Component {
  inputRef = React.createRef();

  copyAddress = () => {
    clipboard.writeText(this.props.address);
    this.inputRef.current.select();
    UIController.showNotification(<Text id="Alert.Copied" />, 'success');
  };

  render() {
    const { address } = this.props;
    return (
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
              <Icon icon={copyIcon} spaceRight />
            </CopyButton>
          </Tooltip.Trigger>
        }
      />
    );
  }
}
