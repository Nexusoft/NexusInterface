import { reduxForm, Field } from 'redux-form';

import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import { callApi } from 'lib/tritiumApi';
import { removeModal, openModal } from 'lib/ui';
import { openErrorDialog } from 'lib/dialog';
import searchIcon from 'icons/search.svg';
import Icon from 'components/Icon';
import { addressRegex } from 'consts/misc';

// Internal Local
import TokenDetailsModal from './TokenDetailsModal';

__ = __context('User.Tokens.SearchToken');

const formOptions = {
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
    if (addressRegex.test(searchValue)) {
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
};

function SearchTokenModal({ handleSubmit, submitting }) {
  return (
    <ControlledModal maxWidth={600}>
      <ControlledModal.Header>{__('Look up token')}</ControlledModal.Header>
      <ControlledModal.Body>
        <form onSubmit={handleSubmit}>
          <FormField connectLabel label={__('Name or address')}>
            <Field
              name="searchValue"
              component={TextField.RF}
              placeholder={__('Token name/address')}
              left={<Icon icon={searchIcon} className="mr0_4" />}
            />
          </FormField>
          <div className="flex justify-end">
            <Button
              style={{ marginTop: '2em' }}
              skin="primary"
              type="submit"
              disabled={submitting}
            >
              {__('Look up')}
            </Button>
          </div>
        </form>
      </ControlledModal.Body>
    </ControlledModal>
  );
}

export default reduxForm(formOptions)(SearchTokenModal);
