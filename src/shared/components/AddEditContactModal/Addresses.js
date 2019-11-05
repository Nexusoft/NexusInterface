// External
import React from 'react';
import { Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import Button from 'components/Button';
import TextField from 'components/TextField';
import { timing } from 'styles';
import plusIcon from 'icons/plus.svg';

const RemoveButton = styled.div(({ theme }) => ({
  position: 'absolute',
  left: 3,
  bottom: 8,
  cursor: 'pointer',
  width: '1.2em',
  height: '1.2em',
  fontSize: '.8em',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: theme.mixer(0.75),
  opacity: 1,
  transition: `color ${timing.normal}, opacity ${timing.normal}`,
  '&:hover': {
    color: theme.mixer(0.875),
  },
}));

const NXSAddress = styled.div({
  display: 'flex',
  alignItems: 'center',
  margin: '0 -30px',
  padding: '0 30px',
  position: 'relative',
});

const AddressWrapper = styled.div({
  flexGrow: 5,
  flexBasis: 0,
  marginRight: '1em',
});

const LabelWrapper = styled.div({
  flexGrow: 2,
  flexBasis: 0,
});

const AddButton = styled(Button)(({ theme }) => ({
  // fontSize: '.9em',
  // '&, &:active, &&:disabled': {
  //   color: theme.mixer(0.5),
  // },
  // '&:hover': {
  //   color: theme.mixer(0.75),
  // },
}));

const PlusIcon = styled(Icon)({
  fontSize: '.8em',
});

/**
 * Input list for addresses
 *
 * @class Addresses
 * @extends {React.Component}
 */
class Addresses extends React.Component {
  lastInputRef = React.createRef();
  justAdded = false;

  componentDidUpdate() {
    // Focus the address input after it has just been added
    if (this.justAdded) {
      this.justAdded = false;
      this.lastInputRef.current.focus();
    }
  }

  addNewAddress = () => {
    this.props.fields.push({ address: '', label: '' });
    this.justAdded = true;
  };

  getAddressLabel = name =>
    this.props.isMine
      ? name
        ? __('My Nexus address for %{name}', { name })
        : __('My Nexus address')
      : name
      ? __("%{name}'s Nexus address", { name })
      : __('Their Nexus address');

  /**
   * React Render
   *
   * @returns
   * @memberof Addresses
   */
  render() {
    const { fields } = this.props;

    return (
      <div className="mt2">
        {fields.map((fieldName, i) => (
          <NXSAddress key={i}>
            <Tooltip.Trigger tooltip={__('Remove address')}>
              <RemoveButton
                onClick={() => {
                  fields.remove(i);
                }}
              >
                ✕
              </RemoveButton>
            </Tooltip.Trigger>

            <AddressWrapper>
              <Field
                name="name"
                component={({ input }) => (
                  <Field
                    name={`${fieldName}.address`}
                    component={TextField.RF}
                    placeholder={this.getAddressLabel(input.value)}
                    inputRef={
                      i === fields.length - 1 ? this.lastInputRef : undefined
                    }
                  />
                )}
              />
            </AddressWrapper>

            <LabelWrapper>
              <Field
                name={`${fieldName}.label`}
                component={TextField.RF}
                placeholder={__('Label (optional)')}
              />
            </LabelWrapper>
          </NXSAddress>
        ))}

        <div className="mt1">
          <AddButton skin="hyperlink" onClick={this.addNewAddress}>
            <PlusIcon icon={plusIcon} className="space-right" />
            <span className="v-align">
              <Field
                name="name"
                component={({ input }) => this.getAddressLabel(input.value)}
              />
            </span>
          </AddButton>
        </div>
      </div>
    );
  }
}
export default Addresses;
