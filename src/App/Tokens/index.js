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
import { history } from 'lib/wallet';
import { openModal } from 'lib/ui';
import { isCoreConnected, isLoggedIn } from 'selectors';
import ContextMenuBuilder from 'contextmenu';

// Internal Local

// Icons
import userIcon from 'icons/user.svg';
import { legacyMode } from 'consts/misc';

const mapStateToProps = state => ({
  addressBook: state.addressBook,
  coreConnected: isCoreConnected(state),
  loggedIn: isLoggedIn(state),
});

/**
 * The Address Book Page
 *
 * @class Tokens
 * @extends {Component}
 */
@connect(mapStateToProps)
class Tokens extends Component {
  state = {
    activeIndex: 0,
  };

  /**
   * componentDidMount
   *
   * @memberof Tokens
   */
  componentDidMount() {
    if (legacyMode) {
      history.push('/');
    }
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
    GA.SendScreen('Tokens');
  }

  /**
   * componentWillUnmount
   *
   * @memberof Tokens
   */
  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  /**
   * Set up the context menu
   *
   * @param {*} e
   * @memberof Tokens
   */
  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Tokens
   */
  render() {
    const { loggedIn, match } = this.props;

    return (
      <Panel icon={userIcon} title={__('Tokens')} bodyScrollable={false}>
        {loggedIn ? (
          <div>{'Tokens'}</div>
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

export default Tokens;
