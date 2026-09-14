// External
import { ReactNode } from 'react';
import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';

// Internal
import Notification from 'components/Notification';
import {
  modalsAtom,
  notificationsAtom,
  backgroundTasksAtom,
  ModalDescriptor,
  NotificationDescriptor,
  BackgroundTaskDescriptor,
} from 'lib/ui';
import ModalContext from 'context/modal';
import TaskContext from 'context/task';
import { zIndex } from 'styles';

const SnackBars = styled.div({
  position: 'fixed',
  top: 20,
  left: 20,
  zIndex: zIndex.snackBars,
});

const Modals = ({ modals }: { modals: ModalDescriptor[] }) => (
  <>
    {modals.map(({ id, component: Comp, props }) => (
      <ModalContext.Provider key={id} value={id}>
        <Comp {...props} />
      </ModalContext.Provider>
    ))}
  </>
);

const BackgroundTasks = ({ tasks }: { tasks: BackgroundTaskDescriptor[] }) => (
  <SnackBars>
    {tasks.map(({ id, component: Comp, props }, i) => (
      <TaskContext.Provider key={id} value={id}>
        <Comp index={i} {...props} />
      </TaskContext.Provider>
    ))}
  </SnackBars>
);

const Notifications = ({
  notifications,
  taskCount,
}: {
  notifications: NotificationDescriptor[];
  taskCount: number;
}) => (
  <SnackBars>
    {notifications.map(({ id, type, content, ...props }, i) => (
      <Notification
        key={id}
        notifID={id}
        type={type}
        index={taskCount + i}
        {...props}
      >
        {content}
      </Notification>
    ))}
  </SnackBars>
);

export default function Wallet({ children }: { children: ReactNode }) {
  const modals = useAtomValue(modalsAtom);
  const notifications = useAtomValue(notificationsAtom);
  const backgroundTasks = useAtomValue(backgroundTasksAtom);

  return (
    <>
      <div>{children}</div>
      <Modals modals={modals} />
      <BackgroundTasks tasks={backgroundTasks} />
      <Notifications
        notifications={notifications}
        taskCount={backgroundTasks.length}
      />
    </>
  );
}
