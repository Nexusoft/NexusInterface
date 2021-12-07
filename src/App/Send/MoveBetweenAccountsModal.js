// External
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';

// Internal
import rpc from 'lib/rpc';
import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import Link from 'components/Link';
import { openErrorDialog, openSuccessDialog, confirm } from 'lib/dialog';
import { removeModal } from 'lib/ui';
import { formSubmit, required } from 'lib/form';
import { loadAccounts } from 'lib/user';
import {
  selectAccountOptions,
  validateAddress,
  notSameAccount,
} from './selectors';
import AmountField from './AmountField';

__ = __context('Send');

const AccountSelectors = styled.div({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gridTemplateRows: 'auto auto',
  gridGap: '1em .5em',
  alignItems: 'center',
});

const Label = styled.label({
  paddingRight: '2em',
});

const Buttons = styled.div({
  marginTop: '1em',
  display: 'flex',
  justifyContent: 'flex-end',
});

const initialValues = {
  sendFrom: null,
  sendTo: null,
  amount: '',
  fiatAmount: '',
};

export default function MoveBetweenAccountsModal() {
  const minConfirmations = useSelector(
    (state) => state.settings.minConfirmations
  );
  const locked = useSelector((state) => state.core.info?.locked);
  const accountOptions = useSelector(selectAccountOptions);
  return (
    <ControlledModal maxWidth={650}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Move NXS between accounts')}
          </ControlledModal.Header>

          <ControlledModal.Body>
            <Form
              name="moveBetweenAccounts"
              persistState
              initialValues={initialValues}
              onSubmit={formSubmit({
                submit: async ({ sendFrom, sendTo, amount }) => {
                  if (locked) {
                    const {
                      payload: { id: modalId },
                    } = openErrorDialog({
                      message: __('You are not logged in'),
                      note: (
                        <>
                          <p>
                            {__(
                              'You need to log in to your wallet before sending transactions'
                            )}
                          </p>
                          <Link
                            to="/Settings/Security"
                            onClick={() => {
                              removeModal(modalId);
                              closeModal();
                            }}
                          >
                            {__('Log in now')}
                          </Link>
                        </>
                      ),
                    });
                    return;
                  }

                  const confirmed = await confirm({
                    question: __('Move NXS'),
                  });
                  if (!confirmed) return;

                  let conf = parseInt(minConfirmations);
                  if (isNaN(conf)) {
                    conf = defaultSettings.minConfirmations;
                  }

                  const params = [sendFrom, sendTo, parseFloat(amount)];
                  return rpc('move', params, conf);
                },
                onSuccess: (result, values, form) => {
                  closeModal();
                  form.reset();
                  loadAccounts();
                  openSuccessDialog({
                    message: __('NXS moved successfully'),
                  });
                },
                errorMessage: __('Error moving NXS'),
              })}
            >
              <AccountSelectors>
                <Label>{__('From account')}</Label>
                <Form.Select
                  name="sendFrom"
                  options={accountOptions}
                  placeholder={__('Select an account')}
                  validate={required()}
                />

                <Label>{__('To account')}</Label>
                <Form.Select
                  name="sendTo"
                  options={accountOptions}
                  placeholder={__('Select an account')}
                  validate={(required(), notSameAccount, validateAddress)}
                />
              </AccountSelectors>

              <AmountField />

              <Buttons>
                <Form.SubmitButton skin="primary">
                  {__('Move NXS')}
                </Form.SubmitButton>
              </Buttons>
            </Form>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
