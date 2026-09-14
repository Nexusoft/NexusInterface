// External
import { useRef, useEffect, useContext, ComponentProps } from 'react';
import { atom, useAtomValue } from 'jotai';
import prettyBytes from 'utils/prettyBytes';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// Internal
import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import { showBackgroundTask, removeModal } from 'lib/ui';
import { confirm } from 'lib/dialog';
import { settingAtoms } from 'lib/settings';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import ModalContext from 'context/modal';
import {
  bootstrapEvents,
  abortBootstrap,
  bootstrapStatusAtom,
} from 'lib/bootstrap';
import { timing } from 'styles';
import BootstrapBackgroundTask from 'components/BootstrapBackgroundTask';
import arrowUpLeftIcon from 'icons/arrow-up-left.svg';

__ = __context('Bootstrap');

const maximizeAnimation = keyframes`
  from { 
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
    top: 25%;
    left: 25%;
  }
  to { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
    top: 50%;
    left: 50%;
  }
`;

const minimizeAnimation = {
  transform: [
    'translate(-50%, -50%) scale(1)',
    'translate(-50%, -50%) scale(0.3)',
  ],
  opacity: [1, 0],
  top: ['50%', '25%'],
  left: ['50%', '25%'],
};

const fadeOut = {
  opacity: [1, 0],
};

const BootstrapModalComponent = styled(ControlledModal)<{
  maximizedFromBackground: boolean;
}>(
  ({ maximizedFromBackground }) =>
    maximizedFromBackground && {
      animation: `${maximizeAnimation} ${timing.quick} linear`,
    }
);

const Title = styled.div({
  fontSize: 28,
});

const ProgressBar = styled.div<{ percentage: number }>(
  ({ percentage, theme }) => ({
    height: 20,
    borderRadius: 10,
    border: `1px solid ${theme.mixer(0.5)}`,
    overflow: 'hidden',
    animation:
      percentage >= 100
        ? `pulse 1.25s infinite cubic-bezier(0.66, 0, 0, 1)`
        : undefined,
    '&::before': {
      content: '""',
      display: 'block',
      background: theme.primary,
      height: '100%',
      width: '100%',
      transformOrigin: 'left center',
      transform: `scaleX(${percentage / 100})`,
      transition: `transform ${timing.normal}`,
    },
  })
);

const MinimizeIcon = styled(Icon)(({ theme }) => ({
  position: 'absolute',
  top: 10,
  left: 10,
  fontSize: 10,
  cursor: 'pointer',
  color: theme.mixer(0.5),
  transition: `color ${timing.normal}`,
  '&:hover': {
    color: theme.mixer(0.75),
  },
}));

const percentageAtom = atom((get) => {
  const { step, details } = get(bootstrapStatusAtom);
  switch (step) {
    case 'backing_up':
    case 'preparing':
      return 0;
    case 'downloading':
      if (!details?.totalSize) return 0;
      const { downloaded, totalSize } = details;
      return Math.min(Math.round((1000 * downloaded) / totalSize), 1000) / 10;
    case 'extracting':
    case 'moving_db':
    case 'restarting_core':
    case 'rescanning':
    case 'cleaning_up':
      return 100;
    default:
      return 0;
  }
});

const statusMsgAtom = atom((get) => {
  const { step, details } = get(bootstrapStatusAtom);
  const locale = get(settingAtoms.locale);
  switch (step) {
    case 'backing_up':
      return __('Backing up your wallet...');
    case 'preparing':
      return __('Preparing...');
    case 'downloading':
      if (!details?.totalSize) return __('Downloading the database');
      const { downloaded, totalSize } = details;
      const percentage = get(percentageAtom);
      const sizeProgress = `(${prettyBytes(downloaded, {
        locale,
      })} / ${prettyBytes(totalSize, {
        locale,
      })})`;
      return `${__(
        'Downloading the database'
      )}... ${percentage}% ${sizeProgress}`;
    case 'extracting':
      return __('Decompressing the database...');
    case 'stopping_core':
      return __('Stopping Nexus Core...');
    case 'moving_db':
      return __('Moving the database...');
    case 'restarting_core':
      return __('Restarting Nexus Core...');
    case 'rescanning':
      return __('Rescanning Wallet...');
    case 'cleaning_up':
      return __('Cleaning up...');
    default:
      return '';
  }
});

async function confirmAbort() {
  const confirmed = await confirm({
    question: __('Are you sure you want to abort the process?'),
    labelYes: __('Yes, abort'),
    skinYes: 'danger',
    labelNo: __('No, let it continue'),
    skinNo: 'primary',
  });
  if (confirmed) {
    abortBootstrap();
  }
}

export default function BootstrapModal(
  props: ComponentProps<typeof BootstrapModalComponent>
) {
  const statusMsg = useAtomValue(statusMsgAtom);
  const percentage = useAtomValue(percentageAtom);
  const modalID = useContext(ModalContext);
  const modalRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const closeModalRef = useRef(() => {});

  useEffect(() => {
    bootstrapEvents.on('abort', closeModalRef.current);
    bootstrapEvents.on('error', closeModalRef.current);
    bootstrapEvents.on('success', closeModalRef.current);
    return () => {
      bootstrapEvents.off('abort', closeModalRef.current);
      bootstrapEvents.off('error', closeModalRef.current);
      bootstrapEvents.off('success', closeModalRef.current);
    };
  }, []);

  const minimize = () => {
    showBackgroundTask(BootstrapBackgroundTask);
    const duration = parseInt(timing.quick);
    const options = { duration, easing: 'linear', fill: 'both' as const };
    modalRef.current?.animate(minimizeAnimation, options);
    backgroundRef.current?.animate(fadeOut, options);
    setTimeout(() => removeModal(modalID), duration);
  };

  return (
    <BootstrapModalComponent
      {...props}
      modalRef={modalRef}
      backgroundRef={backgroundRef}
      onBackgroundClick={minimize}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          minimize();
        }
      }}
      assignClose={(close) => (closeModalRef.current = close)}
      escToClose={false}
    >
      <ControlledModal.Body>
        <Title>{__('Bootstrap Recent Database')}</Title>
        <p>{statusMsg}</p>
        <ProgressBar percentage={percentage} />
        <div className="flex space-between" style={{ marginTop: '2em' }}>
          <div />
          <Button skin="danger" onClick={confirmAbort}>
            {__('Abort')}
          </Button>
        </div>
        <Tooltip.Trigger tooltip="Minimize">
          <MinimizeIcon onClick={minimize} icon={arrowUpLeftIcon} />
        </Tooltip.Trigger>
      </ControlledModal.Body>
    </BootstrapModalComponent>
  );
}
