// External
import React, { Component } from 'react';
import { reduxForm, Field, FieldArray } from 'redux-form';
import { connect } from 'react-redux';

// Internal
import {
  addNewContact,
  updateContact,
} from 'actions/addressBookActionCreators';
import rpc from 'lib/rpc';
import Text from 'components/Text';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Select from 'components/Select';
import Button from 'components/Button';
import UIController from 'components/UIController';
import { emailRegex } from 'utils/form';
import timeZones from 'data/timeZones';
import Addresses from './Addresses';

const tzOptions = timeZones.map(tz => ({
  value: tz.value,
  display: `(${tz.offset}) ${tz.description}`,
}));

const mapStateToProps = state => ({
  addressBook: state.addressBook,
});

const actionCreators = {
  addNewContact,
  updateContact,
};

function validateAddresses(addresses) {
  const addressesErrors = [];
  (addresses || []).forEach(({ address }, i) => {
    const addressErrors = {};
    if (!address) {
      addressErrors.address = (
        <Text id="AddEditContact.Errors.InvalidAddress" />
      );
    }
    if (Object.keys(addressErrors).length) {
      addressesErrors[i] = addressErrors;
    }
  });
  return addressesErrors;
}

function asyncValidateAddresses(isMine, addresses, errors) {
  return addresses.map(({ address }, i) =>
    rpc('validateaddress', [address])
      .then(result => {
        if (!result.isvalid) {
          errors[i] = {
            address: <Text id="AddEditContact.Errors.InvalidAddress" />,
          };
        } else if (isMine && !result.ismine) {
          errors[i] = {
            address: <Text id="AddEditContact.Errors.NotMineAddress" />,
          };
        } else if (!isMine && result.ismine) {
          errors[i] = {
            address: <Text id="AddEditContact.Errors.MineAddress" />,
          };
        }
      })
      .catch(err => {
        errors[i] = {
          address: <Text id="AddEditContact.Errors.InvalidAddress" />,
        };
      })
  );
}

/**
 * The form for adding or editing a Contact
 *
 * @class AddEditContactForm
 * @extends {Component}
 */
@connect(
  mapStateToProps,
  actionCreators
)
@reduxForm({
  destroyOnUnmount: false,
  validate: ({ name, mine, notMine, email }, props) => {
    const errors = {};

    if (!name || !name.trim()) {
      errors.name = <Text id="AddEditContact.Errors.NameRequired" />;
    } else if (
      (!props.edit || name !== props.oldName) &&
      props.addressBook[name]
    ) {
      errors.name = <Text id="AddEditContact.Errors.NameExists" />;
    }

    if (mine && notMine && mine.length + notMine.length === 0) {
      errors['_error'] = <Text id="AddEditContact.Errors.NoAddresses" />;
    }

    const mineErrors = validateAddresses(mine);
    if (mineErrors.length) {
      errors.mine = mineErrors;
    }

    const notMineErrors = validateAddresses(notMine);
    if (notMineErrors.length) {
      errors.notMine = notMineErrors;
    }

    if (email && !emailRegex.test(email.toLowerCase())) {
      errors.email = <Text id="AddEditContact.Errors.InvalidEmail" />;
    }

    return errors;
  },
  asyncBlurFields: ['mine[].address', 'notMine[].address'],
  asyncValidate: async ({ mine, notMine }) => {
    const mineErrors = [];
    const notMineErrors = [];
    const promises = [
      ...asyncValidateAddresses(true, mine, mineErrors),
      ...asyncValidateAddresses(false, notMine, notMineErrors),
    ];

    await Promise.all(promises);

    const asyncErrors = {};
    if (mineErrors.length) asyncErrors.mine = mineErrors;
    if (notMineErrors.length) asyncErrors.notMine = notMineErrors;
    if (Object.keys(asyncErrors).length) {
      throw asyncErrors;
    }
    return null;
  },
  onSubmit: (values, dispatch, props) => {
    const contact = { ...values };
    const addresses = [
      ...contact.notMine.map(addr => ({ ...addr, isMine: false })),
      ...contact.mine.map(addr => ({ ...addr, isMine: true })),
    ];
    delete contact.mine;
    delete contact.notMine;
    contact.addresses = addresses;

    if (props.edit) {
      props.updateContact(props.oldName, contact);
    } else {
      props.addNewContact(contact);
    }
  },
  onSubmitSuccess: (result, dispatch, props) => {
    props.destroy();
    props.closeModal();
    if (props.edit) {
      UIController.showNotification(
        <Text id="AddEditContact.EditSuccess" />,
        'success'
      );
    } else {
      UIController.showNotification(
        <Text id="AddEditContact.CreateSuccess" />,
        'success'
      );
    }
  },
})
class AddEditContactForm extends Component {
  inputRef = React.createRef();

  /**
   * componentDidMount
   *
   * @memberof AddEditContactForm
   */
  componentDidMount() {
    // Not sure why but calling focus directly doesn't work
    setTimeout(() => {
      this.inputRef.current.focus();
    }, 0);
  }

  /**
   * render
   *
   * @returns
   * @memberof AddEditContactForm
   */
  render() {
    const {
      edit,
      handleSubmit,
      error,
      closeModal,
      reset,
      pristine,
      submitting,
    } = this.props;

    return (
      <form onSubmit={handleSubmit}>
        <Text id="AddEditContact.NamePlaceholder">
          {text => (
            <FormField connectLabel label={<Text id="AddEditContact.Name" />}>
              <Field
                name="name"
                component={TextField.RF}
                placeholder={text}
                inputRef={this.inputRef}
              />
            </FormField>
          )}
        </Text>

        <FieldArray name="notMine" component={Addresses} isMine={false} />

        <FieldArray name="mine" component={Addresses} isMine={true} />

        {error && <div className="error mt1">{error}</div>}

        <div className="mt2">
          <Text id="AddEditContact.EmailPlaceholder">
            {text => (
              <FormField
                connectLabel
                label={<Text id="AddEditContact.Email" />}
              >
                <Field
                  name="email"
                  component={TextField.RF}
                  type="email"
                  placeholder={text}
                />
              </FormField>
            )}
          </Text>

          <Text id="AddEditContact.PhonePlaceholder">
            {text => (
              <FormField
                connectLabel
                label={<Text id="AddEditContact.Phone" />}
              >
                <Field
                  name="phoneNumber"
                  component={TextField.RF}
                  placeholder={text}
                />
              </FormField>
            )}
          </Text>

          <FormField connectLabel label={<Text id="AddEditContact.TimeZone" />}>
            <Field
              name="timeZone"
              component={Select.RF}
              options={tzOptions}
              placeholder={<Text id="AddEditContact.TimeZonePlaceholder" />}
            />
          </FormField>

          <Text id="AddEditContact.NotesPlaceholder">
            {text => (
              <FormField
                connectLabel
                label={<Text id="AddEditContact.Notes" />}
              >
                <Field
                  name="notes"
                  component={TextField.RF}
                  placeholder={text}
                  multiline
                  rows={1}
                />
              </FormField>
            )}
          </Text>
        </div>

        <div className="mt2 flex space-between" style={{ marginBottom: '1em' }}>
          <div>
            <Button onClick={closeModal}>
              <Text id="AddEditContact.Cancel" />
            </Button>
            <Button
              onClick={reset}
              disabled={pristine}
              style={{ marginLeft: '1em' }}
            >
              <Text id="AddEditContact.Reset" />
            </Button>
          </div>
          <Button skin="primary" type="submit" disabled={submitting}>
            {edit ? (
              <Text id="AddEditContact.SaveChanges" />
            ) : (
              <Text id="AddEditContact.Create" />
            )}
          </Button>
        </div>
      </form>
    );
  }
}

export default AddEditContactForm;
