// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal Global
import { selectContact } from 'actions/addressbookActionCreators';
import Icon from 'components/Icon';
import Text from 'components/Text';
import Tooltip from 'components/Tooltip';
import { timing } from 'styles';
import { color } from 'utils';
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
  ({ active, theme }) =>
    active && {
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
  wordBreak: 'break-word',
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
    activeIndex: state.addressbook.selectedContactIndex,
  }),
  { selectContact }
)
class Contact extends React.PureComponent {
  /**
   * Get the contact's initial
   *
   * @param {*} name
   * @returns
   * @memberof Contact
   */
  getinitial = name => (name && name.length >= 1 ? name.charAt(0) : '');

  select = () => {
    this.props.selectContact(this.props.index);
  };

  /**
   * render
   *
   * @returns
   * @memberof Contact
   */
  render() {
    const { contact, index, activeIndex } = this.props;
    const addressesCount = contact.mine.length + contact.notMine.length;

    return (
      <ContactComponent onClick={this.select} active={index === activeIndex}>
        <ContactAvatar>{this.getinitial(contact.name)}</ContactAvatar>
        <ContactName>{contact.name}</ContactName>
        <Tooltip.Trigger
          tooltip={
            <Text
              id={
                addressesCount === 1
                  ? 'AddressBook.AddressesCountSingular'
                  : 'AddressBook.AddressesCountPlural'
              }
              data={{ count: addressesCount }}
            />
          }
        >
          <AddressesCount>{addressesCount}</AddressesCount>
        </Tooltip.Trigger>
      </ContactComponent>
    );
  }
}

export default Contact;

const NewContactButton = props => (
  <ContactComponent {...props}>
    <ContactAvatar>
      <Icon icon={plusIcon} style={{ fontSize: '.8em', opacity: 0.7 }} />
    </ContactAvatar>
    <ContactName style={{ opacity: 0.7 }}>
      <Text id="AddressBook.NewContact" />
    </ContactName>
  </ContactComponent>
);

export { NewContactButton };
