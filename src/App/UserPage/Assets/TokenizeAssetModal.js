import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import Spinner from 'components/Spinner';
import AutoSuggest from 'components/AutoSuggest';
import confirmPin from 'utils/promisified/confirmPin';
import { errorHandler } from 'utils/form';
import { openSuccessDialog } from 'lib/ui';
import { loadAssets, loadOwnedTokens } from 'lib/user';
import { apiPost } from 'lib/tritiumApi';
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
  return suggestions.filter(suggestion => {
    const { value, display } = suggestion;
    return (
      !!display &&
      typeof display === 'string' &&
      display.toLowerCase().includes(query)
    );
  });
});

@connect(({ user: { tokens } }) => ({
  tokenSuggestions:
    tokens &&
    tokens.map(token => ({
      value: token.address,
      display: token.name ? (
        token.name
      ) : (
        <span className="dim">{token.address}</span>
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
      return await apiPost('assets/tokenize/asset', {
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
class TokenizeAssetForm extends React.Component {
  componentDidMount() {
    loadOwnedTokens();
  }

  setToken = token => {
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
                        suggestion => suggestion.value === input.value
                      );
                    const tokenName = suggestion && suggestion.display;
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
              <Spinner className="space-right" />
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
  <Modal maxWidth={600}>
    {closeModal => (
      <>
        <Modal.Header>{__('Tokenize asset')}</Modal.Header>
        <Modal.Body>
          <TokenizeAssetForm closeModal={closeModal} asset={asset} />
        </Modal.Body>
      </>
    )}
  </Modal>
);

export default TokenizeAssetModal;
