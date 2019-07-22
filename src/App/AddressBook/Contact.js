// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import { remote } from 'electron';

// Internal Global
import { selectContact, deleteContact } from 'actions/addressBook';
import Icon from 'components/Icon';
import Text, { translate } from 'components/Text';
import Tooltip from 'components/Tooltip';
import { openConfirmDialog, openModal } from 'actions/overlays';
import AddEditContactModal from 'components/AddEditContactModal';
import { timing } from 'styles';
import * as color from 'utils/color';
import ContextMenuBuilder from 'contextmenu';
import plusIcon from 'images/plus.sprite.svg';

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
@connect(
  state => ({
    selectedContactName: state.ui.addressBook.selectedContactName,
    locale: state.settings.locale,
    connections: state.core.info.connections,
  }),
  { selectContact, deleteContact, openModal, openConfirmDialog }
)
class Contact extends React.PureComponent {
  /**
   * Open a Dialog to confirm Contact Delete
   *
   * @memberof Contact
   */
  confirmDelete = () => {
    this.props.openConfirmDialog({
      question: _('Delete contact ${this.props.contact.name}?'),
      skinYes: 'danger',
      callbackYes: () => {
        this.props.deleteContact(this.props.contact.name);
      },
    });
  };

  /**
   * Open the Add Or Edit Contact Modal
   *
   * @memberof Contact
   */
  editContact = () => {
    this.props.openModal(AddEditContactModal, {
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
    const template = [...new ContextMenuBuilder().defaultContext];
    if (this.props.connections !== undefined) {
      template.push({
        label: _('Edit contact'),
        click: this.editContact,
      });
    }
    template.push({
      label: _('Delete Contact'),
      click: this.confirmDelete,
    });
    let contextMenu = remote.Menu.buildFromTemplate(template);
    contextMenu.popup(remote.getCurrentWindow());
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
    this.props.selectContact(this.props.contact.name);
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
          tooltip={
            <Text
              id={
                contact.addresses.length === 1
                  ? 'AddressBook.AddressesCountSingular'
                  : 'AddressBook.AddressesCountPlural'
              }
              data={{ count: contact.addresses.length }}
            />
          }
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
    <ContactName style={{ opacity: 0.7 }}>{_('New contact')}</ContactName>
  </ContactComponent>
);

export { NewContactButton };
