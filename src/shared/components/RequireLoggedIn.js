import { useAtomValue } from 'jotai';

import LoginModal from 'components/LoginModal';
import RequireCoreConnected from 'components/RequireCoreConnected';
import Button from 'components/Button';
import { openModal } from 'lib/ui';
import { loggedInAtom } from 'lib/session';

export default function RequireLoggedIn({ children }) {
  const loggedIn = useAtomValue(loggedInAtom);

  return (
    <RequireCoreConnected>
      {loggedIn ? (
        children
      ) : (
        <div className="mt3 text-center">
          <Button
            uppercase
            skin="primary"
            onClick={() => {
              openModal(LoginModal);
            }}
          >
            {__('Log in')}
          </Button>
        </div>
      )}
    </RequireCoreConnected>
  );
}
