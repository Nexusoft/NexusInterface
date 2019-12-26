// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import { ipcRenderer } from 'electron';

// Internal Global
import { selectContact, deleteContact } from 'lib/addressBook';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import { openConfirmDialog, openModal } from 'lib/ui';
import { popupContextMenu } from 'lib/contextMenu';
import AddEditContactModal from 'components/AddEditContactModal';
import { isCoreConnected } from 'selectors';
import { timing } from 'styles';
import * as color from 'utils/color';
import { defaultMenu } from 'lib/contextMenu';
import plusIcon from 'icons/plus.svg';

__ = __context('AddressBook');

const ContactComponent = styled.div(
  ({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '.4em 30px',
    transitionProperty: 'background, color',
    transitionDuration: timing.normal,
    cursor: 'pointer',

    '&:hover': {
      background: theme.mixer(0.05),
    },
  }),
  ({ selected, theme }) =>
    selected && {
      '&, &:hover': {
        background: color.fade(theme.primary, 0.4),
        color: theme.primaryAccent,
      },
    }
);

const ContactAvatar = styled.div(({ theme }) => ({
  width: '2em',
  height: '2em',
  borderRadius: '50%',
  background: theme.mixer(0.25),
  color: theme.foreground,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexShrink: 0,
  marginRight: '1em',
}));

const ContactName = styled.div({
  flexGrow: 1,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const AddressesCount = styled.div(({ theme }) => ({
  fontSize: '.75em',
  padding: '0 6px',
  borderRadius: 2,
  background: theme.mixer(0.125),
  color: theme.mixer(0.875),
  flexShrink: 0,
}));

/**
 * Contact Item
 *
 * @class Contact
 * @extends {PureComponent}
 */
@connect(state => ({
  selectedContactName: state.ui.addressBook.selectedContactName,
  locale: state.settings.locale,
  coreConnected: isCoreConnected(state),
}))
class Contact extends React.PureComponent {
  /**
   * Open a Dialog to confirm Contact Delete
   *
   * @memberof Contact
   */
  confirmDelete = () => {
    openConfirmDialog({
      question: __('Delete contact %{name}?', {
        name: this.props.contact.name,
      }),
      skinYes: 'danger',
      callbackYes: () => {
        deleteContact(this.props.contact.name);
      },
    });
  };

  /**
   * Open the Add Or Edit Contact Modal
   *
   * @memberof Contact
   */
  editContact = () => {
    openModal(AddEditContactModal, {
      edit: true,
      contact: this.props.contact,
    });
  };

  /**
   * Build the context menu for this component
   *
   * @memberof Contact
   */
  showContextMenu = e => {
    e.preventDefault();
    e.stopPropagation();
    const template = [...defaultMenu];
    if (this.props.coreConnected) {
      template.push({
        id: 'edit-contact',
        label: __('Edit contact'),
        click: this.editContact,
      });
    }
    template.push({
      id: 'delete-contact',
      label: __('Delete contact'),
      click: this.confirmDelete,
    });
    popupContextMenu(template);
  };

  /**
   * Get the contact's initial
   *
   * @param {*} name
   * @returns
   * @memberof Contact
   */
  getinitial = name => (name && name.length >= 1 ? name.charAt(0) : '');

  /**
   * Select a Contact
   *
   * @memberof Contact
   */
  select = () => {
    selectContact(this.props.contact.name);
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Contact
   */
  render() {
    const { contact, selectedContactName } = this.props;

    return (
      <ContactComponent
        onClick={this.select}
        selected={contact.name === selectedContactName}
        onContextMenu={this.showContextMenu}
      >
        <ContactAvatar>{this.getinitial(contact.name)}</ContactAvatar>
        <ContactName>{contact.name}</ContactName>
        <Tooltip.Trigger
          tooltip={__(
            '%{smart_count} address |||| %{smart_count} addresses',
            contact.addresses.length
          )}
        >
          <AddressesCount>{contact.addresses.length}</AddressesCount>
        </Tooltip.Trigger>
      </ContactComponent>
    );
  }
}

export default Contact;

/**
 * Returns the New Contact Button for the AddressBook
 *
 * @param {*} props
 * @memberof Contact
 */
const NewContactButton = props => (
  <ContactComponent {...props}>
    <ContactAvatar>
      <Icon icon={plusIcon} style={{ fontSize: '.8em', opacity: 0.7 }} />
    </ContactAvatar>
    <ContactName style={{ opacity: 0.7 }}>{__('New contact')}</ContactName>
  </ContactComponent>
);

export { NewContactButton };
