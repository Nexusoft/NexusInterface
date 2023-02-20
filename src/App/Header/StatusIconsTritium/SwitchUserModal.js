import { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import ControlledModal from 'components/ControlledModal';
import Icon from 'components/Icon';
import { timing } from 'styles';
import { setActiveUser, selectActiveSession } from 'lib/user';
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

function User({
  session,
  username,
  active,
  switching,
  setSwitchingTo,
  closeModal,
}) {
  return (
    <UserWrapper
      active={active}
      switching={switching}
      onClick={async () => {
        setSwitchingTo(session);
        try {
          await setActiveUser(session);
        } finally {
          setSwitchingTo(null);
          closeModal();
        }
      }}
    >
      <Username>
        <Icon icon={userIcon} className="mr0_4" />
        <span>{username}</span>
      </Username>
      <Status active={active}>
        {active
          ? switching
            ? __('Switching...')
            : __('Active')
          : __('Switch')}
      </Status>
    </UserWrapper>
  );
}

export default function SwitchUserModal() {
  const sessions = useSelector((state) => state.sessions);
  const currentSession = useSelector(selectActiveSession);
  const [switchingTo, setSwitchingTo] = useState(null);

  return (
    <ControlledModal maxWidth={500}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>{__('Switch user')}</ControlledModal.Header>
          <ControlledModal.Body>
            {Object.values(sessions)
              .sort((a, b) => b.accessed - a.accessed)
              .map(({ session, username }) => (
                <User
                  key={session}
                  session={session}
                  username={username}
                  active={
                    switchingTo
                      ? switchingTo === session
                      : currentSession === session
                  }
                  switching={!!switchingTo}
                  setSwitchingTo={setSwitchingTo}
                  closeModal={closeModal}
                />
              ))}
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
