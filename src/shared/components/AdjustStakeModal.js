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
import { removeModal, showNotification } from 'lib/ui';
import Link from 'components/Link';

const LimitNumber = styled(Link)(
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

  '& > input': {
    textAlign: 'center',
  },
});

const SliderWrapper = styled.div({
  marginTop: 10,
});

const StakeSlider = styled(Slider.RF)(({ theme, input, max }) => ({
  background: `linear-gradient(to right, ${theme.primary}, ${
    theme.primary
  } ${(100 * input.value) / max}%, ${theme.mixer(0.5)} ${(100 * input.value) /
    max}%)`,
}));

const Note = styled.div(({ theme }) => ({
  fontSize: 14,
  fontStyle: 'italic',
  color: theme.mixer(0.75),
  marginTop: 20,
}));

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

    removeModal(props.modalId);
    showNotification(__('Stake amount has been updated'), 'success');
  },
  onSubmitFail: errorHandler(__('Error setting stake amount')),
})
export default class AdjustStakeModal extends React.Component {
  render() {
    const {
      total,
      handleSubmit,
      submitting,
      currentStake,
      change,
    } = this.props;
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
                type="number"
                component={StakeTextField}
                skin="filled-inverted"
              />
              <LimitNumber
                as="a"
                onClick={() => {
                  change('stake', 0);
                }}
                align="left"
              >
                0
              </LimitNumber>
              <LimitNumber
                as="a"
                onClick={() => {
                  change('stake', total);
                }}
                align="right"
              >
                {formatNumber(total, 6)}
              </LimitNumber>
            </div>
            <SliderWrapper>
              <Field name="stake" component={StakeSlider} min={0} max={total} />
            </SliderWrapper>
            <Note>
              {__(
                'Note: This change will not take effect immediately but will stay pending until you get the next Trust transaction. The pending change will be recorded locally in this machine, therefore if you switch to another machine for staking, the change will not take effect.'
              )}
            </Note>
            <div className="mt2 flex space-between">
              <Button
                onClick={() => {
                  this.closeModal();
                }}
              >
                {__('Cancel')}
              </Button>
              <Field
                name="stake"
                component={({ input }) => (
                  <Button
                    skin="primary"
                    type="submit"
                    disabled={
                      submitting ||
                      // using == instead of === because input.value can be either string or number
                      input.value == currentStake
                    }
                  >
                    {__('Set stake amount')}
                  </Button>
                )}
              />
            </div>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}
