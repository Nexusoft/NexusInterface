// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import GA from 'lib/googleAnalytics';

// Internal Global
import Button from 'components/Button';
import Panel from 'components/Panel';
import LoginModal from 'components/LoginModal';
import { openModal } from 'lib/ui';
import AddEditContactModal from 'components/AddEditContactModal';
import { isCoreConnected, isLoggedIn } from 'selectors';
import { history } from 'lib/wallet';
import { legacyMode } from 'consts/misc';
import userIcon from 'icons/user.svg';

// Internal Local
import UserBrief from './UserBrief';
import TabContent from './TabContent';
import UserOptions from './UserOptions';

const UserPageLayout = styled.div({
  display: 'flex',
  alignItems: 'stretch',
  height: '100%',
});

const mapStateToProps = state => ({
  addressBook: state.addressBook,
  coreConnected: isCoreConnected(state),
  loggedIn: isLoggedIn(state),
});

/**
 * The Address Book Page
 *
 * @class UserPage
 * @extends {Component}
 */
@connect(mapStateToProps)
class UserPage extends Component {
  state = {
    activeIndex: 0,
  };

  /**
   * componentDidMount
   *
   * @memberof UserPage
   */
  componentDidMount() {
    if (legacyMode) {
      history.push('/');
    }
    GA.SendScreen('UserPage');
  }

  /**
   * Opens Add/Edit Contact Modal
   *
   * @memberof UserPage
   */
  showAddContact = () => {
    openModal(AddEditContactModal);
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof UserPage
   */
  render() {
    const { loggedIn, match } = this.props;

    return (
      <Panel
        icon={userIcon}
        title={__('User')}
        bodyScrollable={false}
        controls={loggedIn ? <UserOptions /> : undefined}
      >
        {loggedIn ? (
          <UserPageLayout>
            <UserBrief match={match} />
            <TabContent match={match} />
          </UserPageLayout>
        ) : (
          <div style={{ marginTop: 50, textAlign: 'center' }}>
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
      </Panel>
    );
  }
}

export default UserPage;
