// External
import React, { Component } from 'react';
import { reduxForm, Field, FieldArray } from 'redux-form';
import { connect } from 'react-redux';

// Internal
import { addNewContact, updateContact } from 'actions/addressBook';
import rpc from 'lib/rpc';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Select from 'components/Select';
import Button from 'components/Button';
import { showNotification } from 'actions/overlays';
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
  showNotification,
};

function validateAddresses(addresses) {
  const addressesErrors = [];
  (addresses || []).forEach(({ address }, i) => {
    const addressErrors = {};
    if (!address) {
      addressErrors.address = _('Invalid address');
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
            address: _('Invalid address'),
          };
        } else if (isMine && !result.ismine) {
          errors[i] = {
            address: _('This is not one of your addresses.'),
          };
        } else if (!isMine && result.ismine) {
          errors[i] = {
            address: _('This is one of your addresses.'),
          };
        }
      })
      .catch(err => {
        errors[i] = {
          address: _('Invalid address'),
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
      errors.name = _('Name is required.');
    } else if (
      (!props.edit || name !== props.oldName) &&
      props.addressBook[name]
    ) {
      errors.name = _('A contact with the same name already exists.');
    }

    if (mine && notMine && mine.length + notMine.length === 0) {
      errors['_error'] = _('There must be at least one address.');
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
      errors.email = _('Invalid email');
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
      props.showNotification(_('Contact has been updated'), 'success');
    } else {
      props.showNotification(
        _('New contact has been added to address book'),
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
        <FormField connectLabel label={_('Name')}>
          <Field
            name="name"
            component={TextField.RF}
            placeholder={_('Contact Name')}
            inputRef={this.inputRef}
          />
        </FormField>

        <FieldArray name="notMine" component={Addresses} isMine={false} />

        <FieldArray name="mine" component={Addresses} isMine={true} />

        {error && <div className="error mt1">{error}</div>}

        <div className="mt2">
          <FormField connectLabel label={_('Email Address')}>
            <Field
              name="email"
              component={TextField.RF}
              type="email"
              placeholder={_('Email address')}
            />
          </FormField>

          <FormField connectLabel label={_('Phone Number')}>
            <Field
              name="phoneNumber"
              component={TextField.RF}
              placeholder={_('Phone Number')}
            />
          </FormField>

          <FormField connectLabel label={_('Time Zone')}>
            <Field
              name="timeZone"
              component={Select.RF}
              options={tzOptions}
              placeholder={_('Select a time zone')}
            />
          </FormField>

          <FormField connectLabel label={_('Notes')}>
            <Field
              name="notes"
              component={TextField.RF}
              placeholder={_('Notes')}
              multiline
              rows={1}
            />
          </FormField>
        </div>

        <div className="mt2 flex space-between" style={{ marginBottom: '1em' }}>
          <div>
            <Button onClick={closeModal}>{_('Cancel')}</Button>
            <Button
              onClick={reset}
              disabled={pristine}
              style={{ marginLeft: '1em' }}
            >
              {_('Reset')}
            </Button>
          </div>
          <Button skin="primary" type="submit" disabled={submitting}>
            {edit ? _('Save changes') : _('Create')}
          </Button>
        </div>
      </form>
    );
  }
}

export default AddEditContactForm;
