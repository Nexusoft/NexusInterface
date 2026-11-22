import { modalSurface } from 'utils/modalStyles';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';

import LoginModal from 'components/LoginModal';
import RequireCoreConnected from 'components/RequireCoreConnected';
import Button from 'components/Button';
import Modal from 'components/Modal';
import Icon from 'components/Icon';
import lockIcon from 'icons/padlock.svg';
import { openModal } from 'lib/ui';
import { isLoggedIn } from 'selectors';
import { fade, mix, luminosity } from 'utils/color';

const LoginPrompt = styled(Modal)({
  width: 'calc(100% - 32px)',
  maxHeight: 'calc(100% - 32px)',
  display: 'block',
  textAlign: 'center',
  padding: 0,
  border: 0,
  borderRadius: 24,
  background: 'transparent',
  overflow: 'auto',
});

const LoginCard = styled.div(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: 'clamp(28px, 4vw, 44px) clamp(24px, 3vw, 40px)',
  color: theme.foreground,
  border: `1px solid ${fade(theme.primary, 0.78)}`,
  borderRadius: 24,
  background: `radial-gradient(ellipse at 50% 0%, ${fade(theme.primary, 0.88)}, transparent 70%), ${mix(theme.background, theme.primary, 0.025)}`,
  boxShadow: `inset 0 1px 0 ${fade(theme.foreground, 0.94)}`,
  ...(theme.modern && { ...modalSurface(theme), padding: 24, '@media (max-width: 480px)': { padding: 16 } }),
  '.login-icon': {
    display: 'grid',
    placeItems: 'center',
    width: 60,
    height: 60,
    marginBottom: 24,
    borderRadius: 18,
    color: theme.primary,
    border: `1px solid ${fade(theme.primary, 0.75)}`,
    background: fade(theme.primary, 0.9),
    boxShadow: `0 0 32px ${fade(theme.primary, 0.92)}`,
    '> svg': { width: 26, height: 26 },
  },
  '> h2': {
    margin: 0,
    fontSize: theme.modern ? 20 : 'clamp(22px, 2vw, 28px)',
    fontWeight: 600,
    lineHeight: 1.25,
    letterSpacing: '-0.6px',
  },
  '> p': {
    margin: '12px 0 28px',
    fontSize: 14,
    lineHeight: 1.6,
    color: theme.mixer(0.65),
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  minHeight: 46,
  width: '100%',
  maxWidth: 280,
  borderRadius: 12,
  border: `1px solid ${theme.primary}`,
  background: theme.primary,
  '&&, &&:active, &&:disabled': {
    background: theme.primary,
    color: luminosity(theme.primary) > 0.179 ? '#000000' : '#ffffff',
    textShadow: 'none',
  },
  fontSize: 14,
  fontWeight: 600,
  boxShadow: `0 6px 20px ${fade(theme.primary, 0.85)}`,
  transition: 'background 150ms ease, box-shadow 150ms ease',
  '&&:hover': {
    background: theme.raise(theme.primary, 0.12),
    color: luminosity(theme.raise(theme.primary, 0.12)) > 0.179 ? '#000000' : '#ffffff',
    boxShadow: `0 8px 24px ${fade(theme.primary, 0.75)}`,
  },
}));

export default function RequireLoggedIn({ children }) {
  const loggedIn = useSelector(isLoggedIn);
  const hasOpenModal = useSelector((state) => state.ui.modals.length > 0);
  const navigate = useNavigate();

  return (
    <RequireCoreConnected>
      {loggedIn ? (
        children
      ) : !hasOpenModal ? (
        <LoginPrompt
          visible
          portalContainer="#page-content"
          maxWidth={520}
          removeModal={() => navigate('/')}
          role="dialog"
          aria-modal="false"
          aria-label={__('Please login to view this module')}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              navigate('/');
            }
          }}
        >
          <LoginCard>
            <div className="login-icon" aria-hidden="true"><Icon icon={lockIcon} /></div>
            <h2>{__('Login required')}</h2>
            <p>{__('Please login to view this module')}</p>
            <LoginButton
              skin="filled-primary"
              onClick={() => {
                openModal(LoginModal);
              }}
            >
              {__('Log in')}
            </LoginButton>
          </LoginCard>
        </LoginPrompt>
      ) : null}
    </RequireCoreConnected>
  );
}
