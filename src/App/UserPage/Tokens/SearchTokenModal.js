import React from 'react';
import { reduxForm, Field } from 'redux-form';

import Modal from 'components/Modal';
import Button from 'components/Button';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import { callApi } from 'lib/tritiumApi';
import { removeModal, openModal, openErrorDialog } from 'lib/ui';
import searchIcon from 'icons/search.svg';
import Icon from 'components/Icon';

// Internal Local
import TokenDetailsModal from './TokenDetailsModal';

__ = __context('User.Tokens.SearchToken');

const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{51}$/;

@reduxForm({
  form: 'search_tokens',
  destroyOnUnmount: true,
  initialValues: {
    searchValue: '',
  },
  validate: ({ searchValue }) => {
    const errors = {};
    if (!searchValue) {
      errors.searchValue = __('No Value');
    }
    return errors;
  },
  onSubmit: async ({ searchValue }) => {
    if (base58Regex.test(searchValue)) {
      try {
        // Test if searchValue is the token address
        return await callApi('tokens/get/token', {
          address: searchValue,
        });
      } catch (err) {}
    }

    // Assuming searchValue is token name
    try {
      return await callApi('tokens/get/token', { name: searchValue });
    } catch (err) {
      openErrorDialog({
        message: __('Error searching for token'),
        note: __('Unknown token name/address'),
      });
    }
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    if (!result) return; // Submission was cancelled
    removeModal(props.modalId);
    openModal(TokenDetailsModal, { token: result });
  },
})
class SearchTokenModal extends React.Component {
  async openSearchedDetailsModal(props) {
    try {
      const token = await apiPost(
        'tokens/get/token',
        props.tokenName
          ? { name: props.tokenName }
          : { address: props.tokenAddress }
      );
      openModal(TokenDetailsModal, { token });
    } catch (e) {
      console.log(e);
      openModal(ErrorDialog, {
        message: __('Cannot find Token'),
        note: e.message + ' ' + e.code,
      });
    }
  }

  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <Modal
        assignClose={(closeModal) => {
          this.closeModal = closeModal;
        }}
        maxWidth={800}
      >
        <Modal.Header>{__('Look up token')}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <FormField connectLabel label={__('Name or address')}>
              <Field
                name="searchValue"
                component={TextField.RF}
                placeholder={__('Token name/address')}
                left={<Icon icon={searchIcon} className="space-right" />}
              />
            </FormField>
            <Button
              style={{ marginTop: '2em' }}
              skin="primary"
              type="submit"
              disabled={submitting}
            >
              {__('Look up')}
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default SearchTokenModal;
