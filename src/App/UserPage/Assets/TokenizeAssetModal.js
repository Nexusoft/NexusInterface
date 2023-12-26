import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import FormField from 'components/FormField';
import Spinner from 'components/Spinner';
import { formSubmit, required } from 'lib/form';
import { confirmPin, openSuccessDialog } from 'lib/dialog';
import { loadAssets, loadOwnedTokens } from 'lib/user';
import { callApi } from 'lib/api';
import memoize from 'utils/memoize';

__ = __context('TokenizeAsset');

const Value = styled.span(({ theme }) => ({
  color: theme.foreground,
}));

const TokenName = styled.span(({ theme }) => ({
  color: theme.primary,
  marginLeft: '.5em',
}));

const filterSuggestions = memoize((suggestions, inputValue) => {
  if (!suggestions) return [];
  const query = new String(inputValue || '').toLowerCase();
  return suggestions.filter((suggestion) => {
    const { name } = suggestion;
    return (
      !!name && typeof name === 'string' && name.toLowerCase().includes(query)
    );
  });
});

const selectTokenSuggestions = memoize(
  (tokens) =>
    tokens
      ? tokens.map((token) => ({
          value: token.address,
          name: token.ticker,
          display: (
            <span>
              {token.ticker} -<span className="dim"> {token.address}</span>
            </span>
          ),
        }))
      : [],
  (state) => [state.user.tokens]
);

const initialValues = {
  token: '',
};

export default function TokenizeAssetModal({ asset }) {
  const tokenSuggestions = useSelector(selectTokenSuggestions);
  useEffect(() => {
    loadOwnedTokens();
  }, []);

  return (
    <ControlledModal maxWidth={600}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Tokenize asset')}
          </ControlledModal.Header>
          <ControlledModal.Body>
            <Form
              name="tokenize-asset"
              initialValues={initialValues}
              onSubmit={formSubmit({
                submit: async ({ token }) => {
                  const pin = await confirmPin();
                  if (pin) {
                    return await callApi('assets/tokenize/asset', {
                      pin,
                      address: asset.address,
                      token,
                    });
                  }
                },
                onSuccess: async (result) => {
                  if (!result) return; // Submission was cancelled
                  loadAssets();
                  closeModal();
                  openSuccessDialog({
                    message: __('Asset has been tokenized'),
                  });
                },
                errorMessage: __('Error tokenizing asset'),
              })}
            >
              <FormField label={__('Asset name')}>
                <Value>{asset.name}</Value>
              </FormField>

              <FormField label={__('Asset address')}>
                <Value>{asset.address}</Value>
              </FormField>

              <FormField
                connectLabel
                label={
                  <span>
                    <span>{__('Token')}</span>
                    {
                      <Form.Field
                        name="token"
                        render={({ input }) => {
                          const suggestion = tokenSuggestions?.find(
                            (suggestion) => suggestion.value === input.value
                          );
                          const tokenName = suggestion?.name;
                          return (
                            !!tokenName && <TokenName>{tokenName}</TokenName>
                          );
                        }}
                      />
                    }
                  </span>
                }
              >
                <Form.AutoSuggest
                  name="token"
                  suggestions={tokenSuggestions}
                  filterSuggestions={filterSuggestions}
                  inputProps={{
                    placeholder: __('Token address'),
                    autoFocus: true,
                  }}
                  validate={required()}
                />
              </FormField>

              <Form.SubmitButton skin="primary" wide uppercase className="mt3">
                {({ submitting }) =>
                  submitting ? (
                    <span>
                      <Spinner className="mr0_4" />
                      <span className="v-align">
                        {__('Tokenizing asset')}...
                      </span>
                    </span>
                  ) : (
                    __('Tokenize asset')
                  )
                }
              </Form.SubmitButton>
            </Form>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
