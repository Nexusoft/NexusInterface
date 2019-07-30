import React from 'react';
import styled from '@emotion/styled';
import { connect } from 'react-redux';

import Button from 'components/Button';
import { updateSettings } from 'actions/settings';

import FullScreen from './FullScreen';

const Buttons = styled.p({
  marginTop: '3em',
  display: 'flex',
  justifyContent: 'center',
});

const actionCreators = {
  disableExperimentalWarning: () =>
    updateSettings({ experimentalWarningDisabled: true }),
};

const ExperimentalWarning = ({ disableExperimentalWarning }) => (
  <FullScreen header={__('Warning')} width={600} style={{ fontSize: 18 }}>
    <p>
      {__(
        'IMPROPER USE OF THIS SOFTWARE COULD LEAD TO PERMANENT LOSS OF COIN.'
      )}
    </p>
    <p>{__('BACKUP OFTEN AND KEEP ENCRYPTION KEY SAFE.')}</p>
    <Buttons>
      <Button skin="primary" onClick={disableExperimentalWarning}>
        {__('I understand the risk')}
      </Button>
    </Buttons>
  </FullScreen>
);

export default connect(
  null,
  actionCreators
)(ExperimentalWarning);
