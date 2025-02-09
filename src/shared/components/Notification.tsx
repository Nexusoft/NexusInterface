// External
import { useRef, useEffect, ComponentProps } from 'react';
import styled from '@emotion/styled';

// Internal
import { removeNotification } from 'lib/ui';
import SnackBar, { SnackBarType } from 'components/SnackBar';
import { timing } from 'styles';

const outro = { opacity: [1, 0] };

const NotificationComponent = styled(SnackBar)({
  '&::after': {
    content: '"✕"',
    fontSize: 10,
    fontWeight: 'bold',
    position: 'absolute',
    top: 2,
    right: 5,
    opacity: 0,
    transition: `opacity ${timing.normal}`,
  },
  '&:hover': {
    '&::after': {
      opacity: 1,
    },
  },
});

export interface NotificationProps
  extends Omit<
    ComponentProps<typeof NotificationComponent>,
    'type' | 'onClick'
  > {
  notifID: string;
  autoClose?: number;
  onClick?: (close: () => void) => void;
  type?: SnackBarType;
}

export default function Notification({
  notifID,
  onClick,
  type = 'info',
  autoClose = 5000,
  ...rest
}: NotificationProps) {
  const notifRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    startAutoClose();
    return stopAutoClose;
  }, []);

  const closeWithAnimation = () => {
    if (notifID) {
      const duration = parseInt(timing.quick);
      stopAutoClose();
      notifRef.current?.animate(outro, {
        duration,
        easing: 'ease-in',
        fill: 'both',
      });
      setTimeout(() => {
        removeNotification(notifID);
      }, duration);
    }
  };

  const stopAutoClose = () => {
    clearTimeout(timerRef.current);
  };

  const startAutoClose = () => {
    if (autoClose) {
      stopAutoClose();
      timerRef.current = setTimeout(closeWithAnimation, autoClose);
    }
  };

  return (
    <NotificationComponent
      ref={notifRef}
      type={type}
      onClick={onClick ? () => onClick(closeWithAnimation) : closeWithAnimation}
      onMouseEnter={stopAutoClose}
      onMouseLeave={startAutoClose}
      {...rest}
    />
  );
}
