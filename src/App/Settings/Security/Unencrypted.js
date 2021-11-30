// Internal
import SecuritySettingsLayout from './SecuritySettingsLayout';
import EncryptWallet from './EncryptWallet';
import ImportPrivKey from './ImportPrivKey';
import ViewPrivKeyForAddress from './ViewPrivKeyForAddress';

export default function Unencrypted() {
  return (
    <div>
      <SecuritySettingsLayout>
        <EncryptWallet />
        <ImportPrivKey />
      </SecuritySettingsLayout>
      <ViewPrivKeyForAddress />
    </div>
  );
}
