import React from 'react';
import { connect } from 'react-redux';

import LoginModal from 'components/LoginModal';
import RequireCoreConnected from 'components/RequireCoreConnected';
import Button from 'components/Button';
import { openModal } from 'lib/ui';
import { isLoggedIn } from 'selectors';

const mapStateToProps = state => ({
  loggedIn: isLoggedIn(state),
});

const RequireLoggedIn = ({ loggedIn, children }) => (
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

export default connect(mapStateToProps)(RequireLoggedIn);
