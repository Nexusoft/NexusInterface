// External
import { useRef, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import prettyBytes from 'utils/prettyBytes';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// Internal
import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import { showBackgroundTask, removeModal } from 'lib/ui';
import { confirm } from 'lib/dialog';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import ModalContext from 'context/modal';
import { bootstrapEvents, abortBootstrap } from 'lib/bootstrap';
import memoize from 'utils/memoize';
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

const BootstrapModalComponent = styled(ControlledModal)(
  ({ maximizedFromBackground }) =>
    maximizedFromBackground && {
      animation: `${maximizeAnimation} ${timing.quick} linear`,
    }
);

const Title = styled.div({
  fontSize: 28,
});

const ProgressBar = styled.div(({ percentage, theme }) => ({
  height: 20,
  borderRadius: 10,
  border: `1px solid ${theme.mixer(0.5)}`,
  overflow: 'hidden',
  animation:
    percentage >= 100
      ? `pulse 1.25s infinite cubic-bezier(0.66, 0, 0, 1)`
      : null,
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
}));

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

const getPercentage = ({ step, details }) => {
  switch (step) {
    case 'backing_up':
    case 'preparing':
      return 0;
    case 'downloading':
      const { downloaded, totalSize } = details || {};
      return totalSize
        ? Math.min(Math.round((1000 * downloaded) / totalSize), 1000) / 10
        : 0;
    case 'extracting':
    case 'moving_db':
    case 'restarting_core':
    case 'rescanning':
    case 'cleaning_up':
      return 100;
    default:
      return 0;
  }
};

const selectPercentage = memoize(getPercentage, (state) => [state.bootstrap]);

const getStatusMsg = ({ step, details }, locale) => {
  switch (step) {
    case 'backing_up':
      return __('Backing up your wallet...');
    case 'preparing':
      return __('Preparing...');
    case 'downloading':
      const { downloaded, totalSize } = details || {};
      const percentage = getPercentage({ step, details });
      const sizeProgress = totalSize
        ? `(${prettyBytes(downloaded, locale)} / ${prettyBytes(
            totalSize,
            locale
          )})`
        : '';
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
};

const selectStatusMsg = memoize(getStatusMsg, (state) => [
  state.bootstrap,
  state.settings.locale,
]);

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

export default function BootstrapModal(props) {
  const statusMsg = useSelector(selectStatusMsg);
  const percentage = useSelector(selectPercentage);
  const modalID = useContext(ModalContext);

  const modalRef = useRef();
  const backgroundRef = useRef();
  const closeModalRef = useRef();

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
    const options = { duration, easing: 'linear', fill: 'both' };
    modalRef.current.animate(minimizeAnimation, options);
    backgroundRef.current.animate(fadeOut, options);
    setTimeout(() => removeModal(modalID), duration);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      minimize();
    }
  };

  return (
    <BootstrapModalComponent
      modalRef={modalRef}
      backgroundRef={backgroundRef}
      onBackgroundClick={minimize}
      onKeyDown={handleKeyDown}
      assignClose={(close) => (closeModalRef.current = close)}
      escToClose={false}
      {...props}
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
