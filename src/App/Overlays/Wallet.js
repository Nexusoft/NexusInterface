// External
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import Notification from 'components/Notification';
import ModalContext from 'context/modal';
import TaskContext from 'context/task';
import { zIndex } from 'styles';

const SnackBars = styled.div({
  position: 'fixed',
  top: 20,
  left: 20,
  zIndex: zIndex.snackBars,
});

const Modals = ({ modals }) => (
  <>
    {modals.map(({ id, component: Comp, props }) => (
      <ModalContext.Provider key={id} value={id}>
        <Comp {...props} modalId={id} />
      </ModalContext.Provider>
    ))}
  </>
);

const BackgroundTasks = ({ tasks }) => (
  <SnackBars>
    {tasks.map(({ id, component: Comp, props }, i) => (
      <TaskContext.Provider key={id} value={id}>
        <Comp index={i} {...props} taskId={id} />
      </TaskContext.Provider>
    ))}
  </SnackBars>
);

const Notifications = ({ notifications, taskCount }) => (
  <SnackBars>
    {notifications.map(({ id, type, children, content, ...props }, i) => (
      <Notification
        key={id}
        notifID={id}
        type={type}
        index={taskCount + i}
        {...props}
      >
        {children || content}
      </Notification>
    ))}
  </SnackBars>
);

export default function Wallet({ children }) {
  const modals = useSelector((state) => state.ui.modals);
  const notifications = useSelector((state) => state.ui.notifications);
  const backgroundTasks = useSelector((state) => state.ui.backgroundTasks);

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
