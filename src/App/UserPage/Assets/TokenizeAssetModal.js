import { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import Spinner from 'components/Spinner';
import AutoSuggest from 'components/AutoSuggest';
import { confirmPin, openSuccessDialog } from 'lib/dialog';
import { errorHandler } from 'utils/form';
import { loadAssets, loadOwnedTokens } from 'lib/user';
import { callApi } from 'lib/tritiumApi';
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

@connect(({ user: { tokens } }) => ({
  tokenSuggestions:
    tokens &&
    tokens.map((token) => ({
      value: token.address,
      name: token.ticker,
      display: (
        <span>
          {token.ticker} -<span className="dim"> {token.address}</span>
        </span>
      ),
    })),
}))
@reduxForm({
  form: 'tokenize-asset',
  destroyOnUnmount: true,
  initialValues: {
    token: '',
  },
  validate: ({ token }) => {
    const errors = {};
    if (!token) {
      errors.token = __('Token is required');
    }
    return errors;
  },
  onSubmit: async ({ token }, dispatch, { asset }) => {
    const pin = await confirmPin();

    if (pin) {
      return await callApi('assets/tokenize/asset', {
        pin,
        address: asset.address,
        token,
      });
    }
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    if (!result) return; // Submission was cancelled
    loadAssets();
    props.closeModal();
    openSuccessDialog({
      message: __('Asset has been tokenized'),
    });
  },
  onSubmitFail: errorHandler(__('Error tokenizing asset')),
})
class TokenizeAssetForm extends Component {
  componentDidMount() {
    loadOwnedTokens();
  }

  setToken = (token) => {
    this.props.change('token', token);
  };

  render() {
    const { handleSubmit, asset, submitting, tokenSuggestions } = this.props;

    return (
      <form onSubmit={handleSubmit}>
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
                <Field
                  name="token"
                  component={({ input }) => {
                    const suggestion =
                      tokenSuggestions &&
                      tokenSuggestions.find(
                        (suggestion) => suggestion.value === input.value
                      );
                    const tokenName = suggestion && suggestion.name;
                    return !!tokenName && <TokenName>{tokenName}</TokenName>;
                  }}
                />
              }
            </span>
          }
        >
          <Field
            name="token"
            component={AutoSuggest.RF}
            suggestions={tokenSuggestions || []}
            filterSuggestions={filterSuggestions}
            onSelect={this.setToken}
            inputProps={{ placeholder: __('Token address'), autoFocus: true }}
          />
        </FormField>

        <Button
          skin="primary"
          wide
          uppercase
          className="mt3"
          type="submit"
          disabled={submitting}
        >
          {submitting ? (
            <span>
              <Spinner className="mr0_4" />
              <span className="v-align">{__('Tokenizing asset')}...</span>
            </span>
          ) : (
            __('Tokenize asset')
          )}
        </Button>
      </form>
    );
  }
}

const TokenizeAssetModal = ({ asset }) => (
  <ControlledModal maxWidth={600}>
    {(closeModal) => (
      <>
        <ControlledModal.Header>{__('Tokenize asset')}</ControlledModal.Header>
        <ControlledModal.Body>
          <TokenizeAssetForm closeModal={closeModal} asset={asset} />
        </ControlledModal.Body>
      </>
    )}
  </ControlledModal>
);

export default TokenizeAssetModal;
