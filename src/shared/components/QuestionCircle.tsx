import { ComponentProps } from 'react';
import styled from '@emotion/styled';

import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import questionIcon from 'icons/question-mark-circle.svg';

const QuestionMarkComponent = styled(Icon)({
  fontSize: '.8em',
  marginLeft: 6,
});

export default function QuestionMark(
  props: ComponentProps<typeof Tooltip.Trigger>
) {
  return (
    <Tooltip.Trigger {...props}>
      <QuestionMarkComponent icon={questionIcon} />
    </Tooltip.Trigger>
  );
}
