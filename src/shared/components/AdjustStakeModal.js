import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import Slider from 'components/Slider';
import Button from 'components/Button';
import TextField from 'components/TextField';
import { apiPost } from 'lib/tritiumApi';
import confirm from 'utils/promisified/confirm';
import confirmPin from 'utils/promisified/confirmPin';
import { errorHandler } from 'utils/form';
import { formatNumber } from 'lib/intl';

const LimitNumber = styled.span(
  {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  ({ align }) =>
    align === 'left' && {
      left: 0,
    },
  ({ align }) =>
    align === 'right' && {
      right: 0,
    }
);

const StakeTextField = styled(TextField.RF)({
  width: 120,
  margin: '0 auto',
});

const SliderWrapper = styled.div({
  marginTop: 10,
});

@connect(({ core: { stakeInfo } }) => ({
  currentStake: stakeInfo && stakeInfo.stake,
  total: stakeInfo && stakeInfo.stake + stakeInfo.balance,
  initialValues: {
    stake: stakeInfo && stakeInfo.stake,
  },
}))
@reduxForm({
  form: 'adjust_stake',
  destroyOnUnmount: true,
  validate: ({ stake }, props) => {
    const errors = {};
    const num = Number(stake);

    if (Number.isNaN(num)) {
      errors.stake = __('Invalid number');
    } else if (num < 0 || num > props.total) {
      errors.stake = __('Out of range');
    }

    return errors;
  },
  onSubmit: async ({ stake }, dispatch, props) => {
    if (stake < props.currentStake) {
      const confirmed = await confirm({
        question: __('Reduce stake amount?'),
        note: __('Reducing stake amount might make your Stake Rate decrease'),
        // labelYes: __('Reduce stake amount'),
        skinYes: 'danger',
        // labelNo: __('Cancel'),
      });
      if (!confirmed) return;
    }

    const pin = await confirmPin();
    if (pin) {
      return await apiPost('finance/set/stake', { pin, amount: stake });
    }
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    if (!result) return; // Submission was cancelled

    props.removeModal(props.modalId);
    props.showNotification(__('Stake amount has been updated'), 'success');
  },
  onSubmitFail: errorHandler(__('Error setting stake amount')),
})
export default class AdjustStakeModal extends React.Component {
  render() {
    const { total, handleSubmit, submitting } = this.props;
    return (
      <Modal
        style={{ maxWidth: 600 }}
        assignClose={closeModal => {
          this.closeModal = closeModal;
        }}
      >
        <Modal.Header>{__('Adjust stake amount')}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <Field
                name="stake"
                component={StakeTextField}
                skin="filled-inverted"
              />
              <LimitNumber align="left">0</LimitNumber>
              <LimitNumber align="right">{formatNumber(total)}</LimitNumber>
            </div>
            <SliderWrapper>
              <Field name="stake" component={Slider.RF} min={0} max={total} />
            </SliderWrapper>
            <div className="mt2 flex space-between">
              <Button
                onClick={() => {
                  this.closeModal();
                }}
              >
                {__('Cancel')}
              </Button>
              <Button skin="primary" type="submit" disabled={submitting}>
                {__('Set stake amount')}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}
