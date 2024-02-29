import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import FormField from 'components/FormField';
import Icon from 'components/Icon';
import { formSubmit, required } from 'lib/form';
import { callAPI } from 'lib/api';
import { openModal } from 'lib/ui';
import { openErrorDialog } from 'lib/dialog';
import searchIcon from 'icons/search.svg';
import { addressRegex } from 'consts/misc';

// Internal Local
import TokenDetailsModal from './TokenDetailsModal';

__ = __context('User.Tokens.SearchToken');

const initialValues = {
  searchValue: '',
};

export default function SearchTokenModal() {
  return (
    <ControlledModal maxWidth={600}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>{__('Look up token')}</ControlledModal.Header>
          <ControlledModal.Body>
            <Form
              name="search_tokens"
              initialValues={initialValues}
              onSubmit={formSubmit({
                submit: async ({ searchValue }) => {
                  if (addressRegex.test(searchValue)) {
                    try {
                      // Test if searchValue is the token address
                      return await callAPI('tokens/get/token', {
                        address: searchValue,
                      });
                    } catch (err) {}
                  }

                  // Assuming searchValue is token name
                  try {
                    return await callAPI('tokens/get/token', {
                      name: searchValue,
                    });
                  } catch (err) {
                    openErrorDialog({
                      message: __('Error searching for token'),
                      note: __('Unknown token name/address'),
                    });
                  }
                },
                onSuccess: async (result) => {
                  if (!result) return; // Submission was cancelled
                  closeModal();
                  openModal(TokenDetailsModal, { token: result });
                },
              })}
            >
              <FormField connectLabel label={__('Name or address')}>
                <Form.TextField
                  name="searchValue"
                  placeholder={__('Token name/address')}
                  left={<Icon icon={searchIcon} className="mr0_4" />}
                  validate={required()}
                />
              </FormField>
              <div className="flex justify-end">
                <Form.SubmitButton style={{ marginTop: '2em' }} skin="primary">
                  {__('Look up')}
                </Form.SubmitButton>
              </div>
            </Form>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
