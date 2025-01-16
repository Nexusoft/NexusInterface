// External
import { useEffect, useRef } from 'react';
import { atom, useAtomValue } from 'jotai';
import styled from '@emotion/styled';

// Internal
import { openModal } from 'lib/ui';
import BackgroundTask from 'components/BackgroundTask';
import Icon from 'components/Icon';
import { bootstrapEvents, bootstrapStatusAtom } from 'lib/bootstrap';
import { animations, timing } from 'styles';
import workIcon from 'icons/work.svg';
import BootstrapModal from 'components/BootstrapModal';

__ = __context('Bootstrap');

const BootstrapBackgroundTaskComponent = styled(BackgroundTask)(
  {
    animation: `${animations.fadeIn} ${timing.normal} ease-out`,
  },
  ({ closing }) =>
    closing && {
      animation: `${animations.fadeOut} ${timing.normal} ease-in`,
    }
);

function getPercentage({ step, details }) {
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
    case 'stopping_core':
    case 'moving_db':
    case 'restarting_core':
    case 'rescanning':
    case 'cleaning_up':
      return 100;
    default:
      return 0;
  }
}

const statusMsgAtom = atom((get) => {
  const { step, details } = get(bootstrapStatusAtom);
  switch (step) {
    case 'backing_up':
      return __('Backing up...');
    case 'preparing':
      return __('Preparing...');
    case 'downloading':
      const percentage = getPercentage({ step, details });
      return `${__('Downloading')}... ${percentage}%`;
    case 'extracting':
      return __('Decompressing...');
    case 'stopping_core':
      return __('Stopping Core...');
    case 'moving_db':
      return __('Moving...');
    case 'restarting_core':
      return __('Restarting Core...');
    case 'rescanning':
      return __('Rescanning Wallet...');
    case 'cleaning_up':
      return __('Cleaning up...');
    default:
      return '';
  }
});

export default function BootstrapBackgroundTask({ index }) {
  const statusMsg = useAtomValue(statusMsgAtom);
  const closeTaskRef = useRef();
  useEffect(() => {
    bootstrapEvents.on('abort', closeTaskRef.current);
    bootstrapEvents.on('error', closeTaskRef.current);
    bootstrapEvents.on('success', closeTaskRef.current);
    return () => {
      bootstrapEvents.off('abort', closeTaskRef.current);
      bootstrapEvents.off('error', closeTaskRef.current);
      bootstrapEvents.off('success', closeTaskRef.current);
    };
  }, []);

  const maximize = () => {
    openModal(BootstrapModal, {
      maximizedFromBackground: true,
    });
    closeTaskRef.current();
  };

  return (
    <BootstrapBackgroundTaskComponent
      assignClose={(closeTask) => (closeTaskRef.current = closeTask)}
      onClick={maximize}
      index={index}
    >
      <Icon icon={workIcon} className="mr0_4" />
      {statusMsg}
    </BootstrapBackgroundTaskComponent>
  );
}
