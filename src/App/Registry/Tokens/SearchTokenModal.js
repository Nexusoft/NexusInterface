import RegistryModalHeader from '../RegistryModalHeader';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { fade } from 'utils/color';
import Button from 'components/Button';
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

const LookupModal = styled(ControlledModal)(({ theme }) => theme.modern && ({
  '.lookup-intro': { margin: '0 0 22px', fontSize: 13, lineHeight: 1.7, color: theme.mixer(0.7) },
  '.lookup-input': {
    minHeight: 48, borderRadius: 10,
    border: `1px solid ${fade(theme.primary, 0.75)}`,
    background: fade(theme.foreground, 0.96),
    '&:focus-within': { borderColor: theme.primary, boxShadow: `0 0 0 3px ${fade(theme.primary, 0.9)}` },
    input: { fontSize: 14 },
    svg: { color: theme.primary, width: 16, height: 16 },
  },
  '.lookup-hint': { margin: '10px 0 0', fontSize: 12, lineHeight: 1.6, color: theme.mixer(0.6) },
  '.lookup-actions': {
    display: 'flex', justifyContent: 'flex-end', gap: 12,
    marginTop: 28, paddingTop: 20, borderTop: `1px solid ${fade(theme.primary, 0.85)}`,
    button: { minHeight: 44, height: 'auto', padding: '10px 20px', borderRadius: 10 },
  },
  'button:focus-visible': { outline: `2px solid ${theme.primary}`, outlineOffset: 3 },
  '@media (max-width: 480px)': { '.lookup-actions': { flexDirection: 'column-reverse', button: { width: '100%' } } },
}));

const initialValues = {
  searchValue: '',
};

export default function SearchTokenModal() {
  const { modern } = useTheme();
  return (
    <LookupModal maxWidth={modern ? 560 : 600}>
      {(closeModal) => (
        <>
          <RegistryModalHeader section="Tokens">{__('Look up token')}</RegistryModalHeader>
          <ControlledModal.Body>
            {modern && <p className="lookup-intro">{__('Find a token on the network to view its details.')}</p>}
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
              <FormField connectLabel capitalizeLabel={!modern} label={__('Token name or address')}>
                <Form.TextField
                  name="searchValue"
                  skin={modern ? 'filled-inverted' : undefined}
                  className={modern ? 'lookup-input' : undefined}
                  placeholder={__('Enter a token name or paste an address')}
                  left={<Icon icon={searchIcon} className="mr0_4" />}
                  validate={required()}
                />
              </FormField>
              {modern && <p className="lookup-hint">{__('Use the full token name or register address.')}</p>}
              <div className={modern ? 'lookup-actions' : 'flex justify-end'}>
                {modern && <Button skin="primary" type="button" onClick={closeModal}>{__('Cancel')}</Button>}
                <Form.SubmitButton style={modern ? undefined : { marginTop: '2em' }} skin="primary">
                  {__('Look up')}
                </Form.SubmitButton>
              </div>
            </Form>
          </ControlledModal.Body>
        </>
      )}
    </LookupModal>
  );
}
