import styled from '@emotion/styled';
import { useField } from 'react-final-form';
import { useTheme } from '@emotion/react';

import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import { formSubmit, checkAll, useFieldValue } from 'lib/form';
import { callAPI } from 'lib/api';
import { confirm, confirmPin } from 'lib/dialog';
import { formatNumber } from 'lib/intl';
import { stakeInfoQuery } from 'lib/session';
import { showNotification } from 'lib/ui';
import { NativeLink } from 'components/Link';
import memoize from 'utils/memoize';
import UT from 'lib/usageTracking';

__ = __context('AdjustStake');

const LimitNumber = styled(NativeLink)<{
  align: 'left' | 'right';
}>(
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

const StakeTextField = styled(Form.TextField)({
  width: 170,
  margin: '0 auto',

  '& > input': {
    textAlign: 'center',
  },
});

const SliderWrapper = styled.div({
  marginTop: 10,
});

const Note = styled.div(({ theme }) => ({
  fontSize: 14,
  fontStyle: 'italic',
  color: theme.mixer(0.75),
  marginTop: 20,
}));

function StakeSlider({ min, max }: { min: number; max: number }) {
  const theme = useTheme();
  const stake = useFieldValue('stake');
  const percentage = (stake / max) * 100;
  return (
    <Form.Slider
      name="stake"
      min={min}
      max={max}
      style={{
        background: `linear-gradient(to right, ${theme.primary}, ${
          theme.primary
        } ${percentage}%, ${theme.mixer(0.5)} ${percentage}%)`,
      }}
    />
  );
}

function LimitNumbers({ total }: { total: number }) {
  const { input } = useField('stake', { subscription: {} });
  return (
    <>
      <LimitNumber
        onClick={() => {
          input.onChange(0);
        }}
        align="left"
      >
        0
      </LimitNumber>
      <LimitNumber
        onClick={() => {
          input.onChange(total);
        }}
        align="right"
      >
        {formatNumber(total, 6)}
      </LimitNumber>
    </>
  );
}

const isNumber = (value: any) =>
  Number.isNaN(Number(value)) ? __('Invalid number') : undefined;

const isInRange = (total: number) => (value: number) =>
  value < 0 || value > total ? __('Out of range') : undefined;

const getInitialValues = memoize(
  (initialStake?: number, currentStake?: number) => ({
    stake: typeof initialStake === 'number' ? initialStake : currentStake || 0,
  })
);

export default function AdjustStakeModal({
  initialStake,
  onClose,
  onComplete,
}: {
  initialStake?: number;
  onClose: () => void;
  onComplete?: () => void;
}) {
  const { stake: currentStake, balance } = stakeInfoQuery.use() || {};
  const total = currentStake && balance ? currentStake + balance : 0;

  return (
    <ControlledModal maxWidth={600} onClose={onClose}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Set stake amount')}
          </ControlledModal.Header>
          <ControlledModal.Body>
            <Form
              name="adjust_stake"
              initialValues={getInitialValues(initialStake, currentStake)}
              onSubmit={formSubmit({
                submit: async ({ stake }) => {
                  if (currentStake && stake < currentStake) {
                    const confirmed = await confirm({
                      question: __('Reduce stake amount?'),
                      note: __(
                        'Reducing stake amount might make your Stake Rate decrease'
                      ),
                      skinYes: 'danger',
                    });
                    if (!confirmed) return undefined;
                  }

                  const pin = await confirmPin();
                  if (pin) {
                    return await callAPI('finance/set/stake', {
                      pin,
                      amount: stake,
                    });
                  }
                  return undefined;
                },
                onSuccess: async (result, { stake }) => {
                  if (!result) return; // Submission was cancelled

                  if (currentStake && stake < currentStake) {
                    UT.AdjustStake('reduce');
                  } else {
                    UT.AdjustStake('increase');
                  }

                  closeModal();
                  showNotification(
                    __('Stake amount has been updated'),
                    'success'
                  );
                  onComplete?.();
                },
                errorMessage: __('Error setting stake amount'),
              })}
            >
              <div className="relative">
                <StakeTextField
                  name="stake"
                  type="number"
                  skin="filled-inverted"
                  validate={checkAll(isNumber, isInRange(total))}
                />
                <LimitNumbers total={total} />
              </div>
              <SliderWrapper>
                <StakeSlider min={0} max={total} />
              </SliderWrapper>
              <Note>
                {__(
                  'Note: This change will not take effect immediately but will stay pending until you get the next Trust transaction. The pending change will be recorded locally in this machine, therefore if you switch to another machine for staking, the change will not take effect.'
                )}
              </Note>
              <div className="mt2 flex space-between">
                <Button
                  onClick={() => {
                    closeModal();
                  }}
                >
                  {__('Cancel')}
                </Button>
                <Form.SubmitButton skin="primary">
                  {__('Set stake amount')}
                </Form.SubmitButton>
              </div>
            </Form>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
