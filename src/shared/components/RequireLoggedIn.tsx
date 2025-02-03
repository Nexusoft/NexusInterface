import { useAtomValue } from 'jotai';

import Button from 'components/Button';
import LoginModal from 'components/LoginModal';
import RequireCoreConnected from 'components/RequireCoreConnected';
import { loggedInAtom } from 'lib/session';
import { openModal } from 'lib/ui';
import { ReactNode } from 'react';

export default function RequireLoggedIn({ children }: { children: ReactNode }) {
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
