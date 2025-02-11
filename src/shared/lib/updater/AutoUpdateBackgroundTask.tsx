import { useRef } from 'react';
import { shell } from 'electron';

import BackgroundTask, { BackgroundTaskProps } from 'components/BackgroundTask';
import { showBackgroundTask } from 'lib/ui';
import { confirm } from 'lib/dialog';

__ = __context('AutoUpdate');

export default function AutoUpdateBackgroundTask(
  props: BackgroundTaskProps &
    (
      | {
          gitHub: true;
          quitAndInstall?: undefined;
          version: string;
        }
      | {
          gitHub?: false;
          quitAndInstall: () => void;
          version: string;
        }
    )
) {
  const { gitHub, quitAndInstall, version, ...rest } = props;
  const closeTaskRef = useRef(() => {});
  const confirmInstall = async () => {
    closeTaskRef.current();
    const confirmed = await confirm({
      question: __('Close the wallet and install update now?'),
      labelYes: __('Close and install'),
      labelNo: __('Install it later'),
    });
    if (confirmed) {
      quitAndInstall?.();
    } else {
      showBackgroundTask(AutoUpdateBackgroundTask, props);
    }
  };

  const goToGitHub = () => {
    closeTaskRef.current();
    shell.openExternal(
      `https://github.com/Nexusoft/NexusInterface/releases/tag/${version}`
    );
  };

  return (
    <BackgroundTask
      type="success"
      assignClose={(close) => {
        closeTaskRef.current = close;
      }}
      onClick={gitHub ? goToGitHub : confirmInstall}
      {...rest}
    >
      {gitHub
        ? __('New wallet version %{version} - Click here to download', {
            version,
          })
        : __('New wallet version %{version} - Click here to update', {
            version,
          })}
    </BackgroundTask>
  );
}
