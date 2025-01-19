import { useAtomValue, useSetAtom } from 'jotai';
import styled from '@emotion/styled';

import ControlledModal from 'components/ControlledModal';
import Icon from 'components/Icon';
import { timing } from 'styles';
import {
  sessionsQuery,
  activeSessionIdAtom,
  selectedSessionIdAtom,
} from 'lib/session';
import userIcon from 'icons/user.svg';

const UserWrapper = styled.div(({ theme, active, switching }) => ({
  padding: '15px 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: active || switching ? 'default' : 'pointer',
  userSelect: 'none',
  background: active ? theme.primary : undefined,
  color: active ? theme.primaryAccent : undefined,
  transition: `background-color ${timing.normal}`,
  '&:hover':
    active || switching
      ? undefined
      : {
          background: theme.mixer(0.125),
        },
  [`&:hover ${Status}`]:
    active || switching
      ? undefined
      : {
          opacity: 0.65,
        },
}));

const Username = styled.div({
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
});

const Status = styled.div(({ active }) => ({
  opacity: active ? 0.65 : 0,
  transition: `opacity ${timing.normal}`,
}));

function User({ sessionId, username, active, closeModal }) {
  const selectSessionId = useSetAtom(selectedSessionIdAtom);
  return (
    <UserWrapper
      active={active}
      onClick={
        active
          ? undefined
          : () => {
              selectSessionId(sessionId);
              closeModal();
            }
      }
    >
      <Username>
        <Icon icon={userIcon} className="mr0_4" />
        <span>{username}</span>
      </Username>
      <Status active={active}>{active ? __('Active') : __('Switch')}</Status>
    </UserWrapper>
  );
}

export default function SwitchUserModal() {
  const sessions = sessionsQuery.use();
  const activeSessionId = useAtomValue(activeSessionIdAtom);

  return (
    <ControlledModal maxWidth={500}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>{__('Switch user')}</ControlledModal.Header>
          <ControlledModal.Body>
            {!!sessions &&
              Object.values(sessions)
                .sort((a, b) => b.accessed - a.accessed)
                .map(({ session: sessionId, username, genesis }) => (
                  <User
                    key={sessionId}
                    sessionId={sessionId}
                    username={username}
                    genesis={genesis}
                    active={activeSessionId === sessionId}
                    closeModal={closeModal}
                  />
                ))}
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
