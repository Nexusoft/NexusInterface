// Internal
import SecuritySettingsLayout from './SecuritySettingsLayout';
import ChangePassword from './ChangePassword';
import ImportPrivKey from './ImportPrivKey';
import ViewPrivKeyForAddress from './ViewPrivKeyForAddress';

export default function Encrypted() {
  return (
    <div>
      <SecuritySettingsLayout>
        <ChangePassword />
        <ImportPrivKey />
      </SecuritySettingsLayout>
      <ViewPrivKeyForAddress />
    </div>
  );
}
