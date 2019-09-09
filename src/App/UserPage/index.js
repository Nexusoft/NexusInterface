// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';
import styled from '@emotion/styled';
import GA from 'lib/googleAnalytics';

// Internal Global
import Button from 'components/Button';
import Panel from 'components/Panel';
import LoginModal from 'components/LoginModal';
import { openModal } from 'actions/overlays';
import AddEditContactModal from 'components/AddEditContactModal';
import { isCoreConnected } from 'selectors';
import ContextMenuBuilder from 'contextmenu';

// Internal Local
import UserBrief from './UserBrief';
import TabContent from './TabContent';

// Icons
import userIcon from 'images/user.sprite.svg';

const UserPageLayout = styled.div({
  display: 'flex',
  alignItems: 'stretch',
  height: '100%',
});

const mapStateToProps = state => ({
  username: state.core.userStatus && state.core.userStatus.username,
  addressBook: state.addressBook,
  coreConnected: isCoreConnected(state),
});

const actionCreators = { openModal };

/**
 * The Address Book Page
 *
 * @class UserPage
 * @extends {Component}
 */
@connect(
  mapStateToProps,
  actionCreators
)
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
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
    GA.SendScreen('UserPage');
  }

  /**
   * componentWillUnmount
   *
   * @memberof UserPage
   */
  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  /**
   * Set up the context menu
   *
   * @param {*} e
   * @memberof UserPage
   */
  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  /**
   * Opens Add/Edit Contact Modal
   *
   * @memberof UserPage
   */
  showAddContact = () => {
    this.props.openModal(AddEditContactModal);
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof UserPage
   */
  render() {
    const { username, openModal, match } = this.props;

    return (
      <Panel icon={userIcon} title={__('User')} bodyScrollable={false}>
        {!!username ? (
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
