// External
import React, { Component } from 'react';
import Text from 'components/Text';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import FormField from 'components/FormField';
import Select from 'components/Select';
import UIController from 'components/UIController';

const timeZones = [
  { value: '0', display: '(UTC + 0.00 hr) London, Casablanca, Accra' },
  {
    value: '-60',
    display: '(UTC - 1.00 hr) Cabo Verde, Ittoqqortoormiit, Azores Islands ',
  },
  {
    value: '-120',
    display: '(UTC - 2.00 hr) Fernando de Noronha, South Sandwich Islands ',
  },
  {
    value: '-180',
    display: '(UTC - 3.00 hr) Buenos Aires, Montevideo, São Paulo ',
  },
  {
    value: '-210',
    display: "(UTC - 3.50 hr) St. John's, Labrador, Newfoundland ",
  },
  { value: '-240', display: '(UTC - 4.00 hr) Santiago, La Paz, Halifax ' },
  { value: '-300', display: '(UTC - 5.00 hr) New York, Lima, Toronto' },
  {
    value: '-360',
    display: '(UTC - 6.00 hr) Chicago, Guatemala City, Mexico City ',
  },
  {
    value: '-420',
    display: '(UTC - 7.00 hr) Phoenix, Calgary, Ciudad Juárez ',
  },
  {
    value: '-480',
    display: '(UTC - 8.00 hr) Los Angeles, Vancouver, Tijuana ',
  },
  { value: '-540', display: '(UTC - 9.00 hr) Anchorage' },
  { value: '-570', display: '(UTC - 9.50 hr) Marquesas Islands' },
  { value: '-600', display: '(UTC - 10.00 hr) Papeete, Honolulu' },
  {
    value: '-660',
    display: '(UTC - 11.00 hr) Niue, Jarvis Island, American Samoa ',
  },
  { value: '-720', display: '(UTC - 12.00 hr) Baker Island, Howland Island ' },
  { value: '840', display: '(UTC + 14.00 hr) Line Islands' },
  { value: '780', display: '(UTC + 13.00 hr) Apia, Nukuʻalofa' },
  { value: '765', display: '(UTC + 12.75 hr) Chatham Islands' },
  { value: '720', display: '(UTC + 12.00 hr) Auckland, Suva' },
  {
    value: '660',
    display: '(UTC + 11.00 hr) Noumea, Federated States of Micronesia ',
  },
  { value: '630', display: '(UTC + 10.50 hr) Lord Howe Island' },
  {
    value: '600',
    display: '(UTC + 10.00 hr) Port Moresby, Sydney, Vladivostok ',
  },
  { value: '570', display: '(UTC + 9.50 hr) Adelaide' },
  { value: '540', display: '(UTC + 9.00 hr) Seoul, Tokyo, Yakutsk' },
  { value: '525', display: '(UTC + 8.75 hr) Eucla' },
  { value: '510', display: '(UTC + 8.50 hr) Pyongyang' },
  { value: '480', display: '(UTC + 8.00 hr) Beijing, Singapore, Manila ' },
  {
    value: '420',
    display: '(UTC + 7.00 hr) Jakarta, Bangkok, Ho Chi Minh City ',
  },
  { value: '390', display: '(UTC + 6.50 hr) Yangon' },
  { value: '360', display: '(UTC + 6.00 hr) Almaty, Dhaka, Omsk' },
  { value: '345', display: '(UTC + 5.75 hr) Kathmandu' },
  { value: '330', display: '(UTC + 5.50 hr) Delhi, Colombo' },
  {
    value: '300',
    display: '(UTC + 5.00 hr) Karachi, Tashkent, Yekaterinburg ',
  },
  { value: '270', display: '(UTC + 4.50 hr) Kabul' },
  { value: '240', display: '(UTC + 4.00 hr) Baku, Dubai, Samara' },
  { value: '210', display: '(UTC + 3.50 hr) Tehran' },
  { value: '180', display: '(UTC + 3.00 hr) Istanbul, Moscow, Nairobi' },
  { value: '120', display: '(UTC + 2.00 hr) Athens, Cairo, Johannesburg ' },
  { value: '60', display: '(UTC + 1.00 hr) Berlin, Lagos, Madrid' },
];

/**
 * The Add or Edit Contact Modal
 *
 * @class AddEditContactModal
 * @extends {Component}
 */
class AddEditContactModal extends Component {
  render() {
    const { editEntry } = this.props;

    return (
      <Modal>
        {closeModal => (
          <>
            <Modal.Header>
              {editEntry ? (
                <Text id="AddressBook.EditContact" />
              ) : (
                <Text id="AddressBook.addContact" />
              )}
            </Modal.Header>
            <Modal.Body>
              <FormField connectLabel label={<Text id="AddressBook.Name" />}>
                <TextField
                  value={this.props.prototypeName}
                  onChange={e => this.props.EditProtoName(e.target.value)}
                  placeholder="Name"
                  required
                />
              </FormField>

              <FormField connectLabel label={<Text id="AddressBook.Phone" />}>
                <TextField
                  type="tel"
                  onChange={e => this.phoneNumberHandler(e.target.value)}
                  value={this.props.prototypePhoneNumber}
                  placeholder="Phone #"
                />
              </FormField>

              <FormField
                connectLabel
                label={<Text id="AddressBook.LocalTime" />}
              >
                <Select
                  options={timeZones}
                  onChange={e => {
                    if (this.props.editTZ) {
                      this.props.SaveTz(
                        this.props.selected,
                        parseInt(e.target.value)
                      );
                    } else {
                      this.props.EditProtoTZ(parseInt(e.target.value));
                    }
                  }}
                  value={this.props.prototypeTimezone}
                />
              </FormField>

              <FormField connectLabel label={<Text id="AddressBook.Notes" />}>
                <TextField
                  multiline
                  value={this.props.prototypeNotes}
                  onChange={e => this.props.EditProtoNotes(e.target.value)}
                  rows="1"
                />
              </FormField>

              <FormField
                connectLabel
                label={<Text id="AddressBook.NXSAddress" />}
              >
                <TextField
                  value={this.props.prototypeAddress}
                  onChange={e => this.props.EditProtoAddress(e.target.value)}
                  placeholder="Address"
                />
              </FormField>

              <Button
                skin="primary"
                onClick={() => {
                  let name = this.props.prototypeName.trim();
                  if (name !== '*' && name !== 'default') {
                    this.props.AddContact(
                      this.props.prototypeName,
                      this.props.prototypeAddress,
                      this.props.prototypePhoneNumber,
                      this.props.prototypeNotes,
                      this.props.prototypeTimezone
                    );
                  } else {
                    UIController.showNotification(
                      <Text id="Alert.nodefaultname" />,
                      'error'
                    );
                  }
                }}
              >
                {index === -1 ? (
                  <Text id="AddressBook.addContact" />
                ) : (
                  <Text id="AddressBook.EditContact" />
                )}
              </Button>
              <Button onClick={closeModal}>
                <Text id="AddressBook.Cancel" />
              </Button>
            </Modal.Body>
          </>
        )}
      </Modal>
    );
  }
}

export default AddEditContactModal;
