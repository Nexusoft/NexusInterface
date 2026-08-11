// External
import { useAtomValue } from 'jotai';

// Internal
import { updateSettings, settingsAtom } from 'lib/settings';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import { TextField } from 'components/TextField';

__ = __context('Settings.Application');

export default function SettingsApp() {
  const { backupDirectory } = useAtomValue(settingsAtom);

  const browseBackupDir = async () => {
    const folderPaths =
      await window.nexusElectron.dialogs.selectBackupDirectory();
    if (folderPaths && folderPaths.length > 0) {
      updateSettings({ backupDirectory: folderPaths[0] });
    }
  };

  return (
    <SettingsField connectLabel label={__('Backup directory')}>
      {(inputId) => (
        <div className="flex stretch">
          <TextField
            id={inputId}
            value={backupDirectory}
            readOnly
            style={{ flexGrow: 1 }}
          />
          <Button
            fitHeight
            onClick={browseBackupDir}
            style={{ marginLeft: '1em' }}
          >
            {__('Browse')}
          </Button>
        </div>
      )}
    </SettingsField>
  );
}
