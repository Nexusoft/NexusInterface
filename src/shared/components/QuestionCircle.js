import React from 'react';
import styled from '@emotion/styled';

import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import questionIcon from 'icons/question-mark-circle.svg';

const QuestionMarkComponent = styled(Icon)({
  fontSize: '.8em',
  marginLeft: 6,
});

const QuestionMark = ({ tooltip }) => (
  <Tooltip.Trigger tooltip={tooltip}>
    <QuestionMarkComponent icon={questionIcon} />
  </Tooltip.Trigger>
);

export default QuestionMark;
