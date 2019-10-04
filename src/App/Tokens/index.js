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
import { openModal } from 'lib/ui';
import { isCoreConnected, isLoggedIn } from 'selectors';
import ContextMenuBuilder from 'contextmenu';

// Internal Local
import NewTokenModal from './NewTokenModal';

// Icons
import userIcon from 'images/user.sprite.svg';
import { legacyMode } from 'consts/misc';
import { history } from 'store';
import { apiGet } from 'lib/tritiumApi';

const mapStateToProps = state => ({
  addressBook: state.addressBook,
  coreConnected: isCoreConnected(state),
  loggedIn: isLoggedIn(state),
  accounts: state.core.accounts,
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
    usedTokens: [],
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

    this.gatherTokenInformation();
  }

  gatherTokenInformation() {
    const { accounts } = this.props;
    if (accounts === null) return;
    let tempMap = new Map();
    accounts.forEach(element => {
      if (tempMap.has(element.token_name || element.token)) return;

      if (!tempMap.has('NXS')) {
        tempMap.set('NXS', { name: 'NXS', maxsupply: '100000' });
        return;
      }
      const tokenInfo = this.asdfh(element);
      tempMap.set(element.token_name || element.token, tokenInfo);
    });
    this.setState({
      usedTokens: tempMap,
    });
  }

  async asdfh(element) {
    const info = await apiGet(
      element.token_name
        ? `tokens/get/token?name=${element.token_name}`
        : `tokens/get/token?address=${element.token}`
    );
    this.setState(prevState => {
      let usedTokens = prevState.usedTokens;
      usedTokens.set(element.token_name || element.token, info);
      return { usedTokens };
    });
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

  returnTokenList() {
    const { usedTokens } = this.state;
    console.log(usedTokens.keys());

    return Array.from(usedTokens, ([key, value]) => {
      console.log(key);
      console.log(value);
      return (
        <div>
          <span>{key}</span>
          <br />
          <span>{value.maxsupply}</span>
        </div>
      );
    });
  }

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Tokens
   */
  render() {
    console.error(this);
    const { loggedIn, match } = this.props;

    return (
      <Panel icon={userIcon} title={__('Tokens')} bodyScrollable={false}>
        {loggedIn ? (
          <div>
            {'Tokens'}
            <Button
              onClick={() => {
                openModal(NewTokenModal);
              }}
            >
              {'Test Open Token Creation'}
            </Button>
            {this.returnTokenList()}
          </div>
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
