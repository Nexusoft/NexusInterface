// External
import { useRef, useContext, useEffect, ComponentProps } from 'react';

// Internal
import { removeBackgroundTask } from 'lib/ui';
import SnackBar from 'components/SnackBar';
import TaskContext from 'context/task';
import { timing } from 'styles';

const outro = { opacity: [1, 0] };

export interface BackgroundTaskProps extends ComponentProps<typeof SnackBar> {
  assignClose?: (close: () => void) => void;
}

export default function BackgroundTask({
  type = 'work',
  children,
  assignClose,
  ...rest
}: BackgroundTaskProps) {
  const snackBarRef = useRef<HTMLDivElement>(null);
  const taskID = useContext(TaskContext);

  const animatedClose = () => {
    if (taskID) {
      const duration = parseInt(timing.quick);
      snackBarRef.current?.animate(outro, {
        duration,
        fill: 'both',
      });
      setTimeout(() => {
        removeBackgroundTask(taskID);
      }, duration);
    }
  };

  useEffect(() => {
    assignClose?.(animatedClose);
  }, []);

  return (
    <SnackBar type={type} ref={snackBarRef} onClick={animatedClose} {...rest}>
      {children}
    </SnackBar>
  );
}
