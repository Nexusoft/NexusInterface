import React from 'react';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import Button from 'components/Button';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import { apiPost } from 'lib/tritiumApi';
import { errorHandler } from 'utils/form';
import { removeModal, showNotification } from 'lib/ui';
import { openModal } from 'lib/ui';
import searchIcon from 'icons/search.svg';
import Icon from 'components/Icon';

// Internal Local
import TokenDetailsModal from './TokenDetailsModal';

__ = __context('User.Tokens.SearchToken');

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
    const params = {};
    // Just for test net need a better way to validate token name/address
    !searchValue.startsWith('8')
      ? (params.name = searchValue)
      : (params.address = searchValue);
    return await apiPost('tokens/get/token', params);
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    if (!result) return; // Submission was cancelled
    removeModal(props.modalId);
    openModal(TokenDetailsModal, { token: result });
  },
  onSubmitFail: errorHandler(__('Error searching for token')),
})
class SearchTokenModal extends React.Component {
  async openSearchedDetailsModal(props) {
    try {
      const token = await apiGet(
        props.tokenName
          ? `tokens/get/token?name=${props.tokenName}`
          : `tokens/get/token?address=${props.tokenAddress}`
      );
      openModal(TokenDetailsModal, { token });
    } catch (e) {
      console.log(e);
      openModal(ErrorDialog, {
        message: __('Can not find Token'),
        note: e.message + ' ' + e.code,
      });
    }
  }

  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <Modal
        assignClose={closeModal => {
          this.closeModal = closeModal;
        }}
        maxWidth={800}
      >
        <Modal.Header>{__('Lookup Token')}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <FormField connectLabel label={__('Name/Address')}>
              <Field
                name="searchValue"
                component={TextField.RF}
                placeholder={__('Lookup a Token on the network')}
                left={<Icon icon={searchIcon} className="space-right" />}
              />
            </FormField>
            <Button
              style={{ marginTop: '2em' }}
              skin="primary"
              type="submit"
              disabled={submitting}
            >
              {__('Lookup this token')}
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default SearchTokenModal;
