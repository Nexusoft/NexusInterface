// External
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import qs from 'querystring';
import arrayMutators from 'final-form-arrays';

// Internal Global
import Form from 'components/Form';
import Icon from 'components/Icon';
import Button from 'components/Button';
import FormField from 'components/FormField';
import rpc from 'lib/rpc';
import { defaultSettings } from 'lib/settings/universal';
import { loadAccounts, updateAccountBalances } from 'lib/user';
import { openModal } from 'lib/ui';
import { required, formSubmit } from 'lib/form';
import { confirm, openSuccessDialog } from 'lib/dialog';
import sendIcon from 'icons/send.svg';

// Internal Local
import Recipients from './Recipients';
import {
  selectAccountOptions,
  getRegisteredFieldNames,
  getAccountBalance,
} from './selectors';
import PasswordModal from './PasswordModal';

__ = __context('Send');

const SendFormComponent = styled(Form)({
  maxWidth: 800,
  margin: '-.5em auto 0',
});

const SendFormButtons = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '2em',
});

// const formName = 'send';
// const valueSelector = formValueSelector(formName);
// const mapStateToProps = (state, ownProps) => {
//   const {
//     addressBook,
//     myAccounts,
//     settings: { minConfirmations },
//     core: {
//       info: { blocks, locked, minting_only },
//     },
//     form,
//   } = state;
//   const accountName = valueSelector(state, 'sendFrom');
//   const recipients = valueSelector(state, 'recipients');
//   const accBalance = getAccountBalance(accountName, myAccounts);
//   const hideSendAll =
//     recipients &&
//     (recipients.length > 1 ||
//       (recipients[0] && recipients[0].amount === accBalance));

//   return {
//     minConfirmations,
//     locked,
//     blocks,
//     minting_only,
//     accountOptions: selectAccountOptions(state),
//     addressNameMap: getAddressNameMap(addressBook),
//     fieldNames: getRegisteredFieldNames(
//       form[formName] && form[formName].registeredFields
//     ),
//     accBalance: hideSendAll ? undefined : accBalance,
//     initialValues: {
//       sendFrom: null,
//       recipients: [
//         {
//           address: sendTo || null,
//           amount: '',
//           fiatAmount: '',
//         },
//       ],
//       password: null,
//       message: '',
//     },
//   };
// };

const confirmPassword = () =>
  new Promise((resolve) => {
    openModal(PasswordModal, {
      onSubmit: resolve,
    });
  });

//   if (invalid) {
//     // Mark the form touched so that the validation errors will be shown.
//     // redux-form doesn't have the `touchAll` feature yet so we have to list all fields manually.
//     // redux-form also doesn't have the API to get all the field names yet so we have to connect to the store to retrieve it manually
//     touch(...fieldNames);
//     return;
//   }

// };

function SendMultipleButton() {
  return (
    <Form.FieldArray
      name="recipients"
      render={({ fields }) =>
        fields.length === 1 ? (
          <Button
            onClick={() => {
              fields.push({
                address: null,
                amount: '',
                fiatAmount: '',
              });
            }}
          >
            {__('Send To multiple recipients')}
          </Button>
        ) : (
          <div />
        )
      }
    />
  );
}

export default function SendForm() {
  const minConfirmations = useSelector(
    (state) => state.settings.minConfirmations
  );
  const locked = useSelector((state) => state.core.info?.locked);
  const blocks = useSelector((state) => state.core.info?.blocks);
  const mintingOnly = useSelector((state) => state.core.info?.minting_only);
  const accountOptions = useSelector(selectAccountOptions);
  // accBalance: hideSendAll ? undefined : accBalance,

  const location = useLocation();
  // React-router's search field has a leading ? mark but
  // qs.parse will consider it invalid, so remove it
  const queryParams = qs.parse(location.search.substring(1));
  const sendTo = queryParams?.sendTo;

  useEffect(() => {
    loadAccounts();
  }, []);

  const lastBlocks = useRef(blocks);
  useEffect(() => {
    if (blocks !== lastBlocks.current) {
      updateAccountBalances();
      lastBlocks.current = blocks;
    }
  });

  return (
    <SendFormComponent
      form="send"
      persistState
      initialValues={{
        sendFrom: null,
        recipients: [
          {
            address: sendTo || null,
            amount: '',
            fiatAmount: '',
          },
        ],
        password: null,
        message: '',
      }}
      // validate: ({ sendFrom, recipients }) => {
      //   const errors = {};
      //   if (!sendFrom) {
      //     errors.sendFrom = __('No accounts selected');
      //   }

      //   if (!recipients || !recipients.length) {
      //     errors.recipients = {
      //       _error: __('There must be at least one recipient'),
      //     };
      //   } else {
      //     const recipientsErrors = [];

      //     recipients.forEach(({ address, amount }, i) => {
      //       const recipientErrors = {};
      //       if (!address) {
      //         recipientErrors.address = __('Address is required');
      //       }
      //       const floatAmount = parseFloat(amount);
      //       if (!floatAmount || floatAmount < 0) {
      //         recipientErrors.amount = __('Invalid amount');
      //       }
      //       if (Object.keys(recipientErrors).length) {
      //         recipientsErrors[i] = recipientErrors;
      //       }
      //     });

      //     if (recipientsErrors.length) {
      //       errors.recipients = recipientsErrors;
      //     }
      //   }

      //   return errors;
      // },
      // asyncBlurFields: ['recipients[].address'],
      // asyncValidate: async ({ recipients }) => {
      //   const recipientsErrors = [];
      //   await Promise.all(
      //     recipients.map(({ address }, i) =>
      //       rpc('validateaddress', [address])
      //         .then((result) => {
      //           if (!result.isvalid) {
      //             recipientsErrors[i] = {
      //               address: __('Invalid address'),
      //             };
      //           } else if (result.ismine) {
      //             recipientsErrors[i] = {
      //               address: __('This is an address registered to this wallet.'),
      //             };
      //           }
      //         })
      //         .catch((err) => {
      //           recipientsErrors[i] = {
      //             address: __('Invalid address'),
      //           };
      //         })
      //     )
      //   );
      //   if (recipientsErrors.length) {
      //     throw { recipients: recipientsErrors };
      //   }
      //   return null;
      // },
      onSubmit={formSubmit({
        submit: async ({ sendFrom, recipients, message }) => {
          const confirmed = await confirm({
            question: __('Send transaction?'),
          });
          if (!confirmed) return;

          let password = null;
          if (locked || mintingOnly) {
            password = await confirmPassword();
          }

          let minConf = parseInt(minConfirmations);
          if (isNaN(minConf)) {
            minConf = defaultSettings.minConfirmations;
          }

          if (recipients.length === 1) {
            const recipient = recipients[0];
            const params = [
              sendFrom,
              recipient.address,
              parseFloat(recipient.amount),
              minConf,
              message || null,
              null,
            ];
            if (password) params.push(password);
            // if (message) params.push(message);
            return await rpc('sendfrom', params);
          } else {
            const queue = recipients.reduce(
              (queue, r) => ({ ...queue, [r.address]: parseFloat(r.amount) }),
              {}
            );
            return await rpc('sendmany', [sendFrom, queue], minConf, message);
          }
        },
        onSuccess: (result, values, form) => {
          if (!result) return;
          form.reset();
          loadAccounts();
          openSuccessDialog({
            message: __('Transaction sent'),
          });
        },
        errorMessage: __('Error sending NXS'),
      })}
      mutators={{ ...arrayMutators }}
    >
      <FormField label={__('Send from')}>
        <Form.Select
          name="sendFrom"
          placeholder={__('Select an account')}
          options={accountOptions}
          validate={required()}
        />
      </FormField>

      <Form.FieldArray component={Recipients} name="recipients" />

      <FormField connectLabel label={__('Message')}>
        <Form.TextField
          name="message"
          multiline
          rows={1}
          placeholder={__('Enter your message')}
        />
      </FormField>

      <SendFormButtons>
        <SendMultipleButton />

        <Form.SubmitButton skin="primary">
          <Icon icon={sendIcon} className="mr0_4" />
          {__('Send')}
        </Form.SubmitButton>
      </SendFormButtons>
    </SendFormComponent>
  );
}
