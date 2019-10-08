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
import userIcon from 'icons/user.svg';
import { legacyMode } from 'consts/misc';
import { apiGet } from 'lib/tritiumApi';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import searchIcon from 'images/search.sprite.svg';
import Icon from 'components/Icon';
import HorizontalLine from 'components/HorizontalLine';
import ErrorDialog from 'components/Dialogs/ErrorDialog';

// Internal Local
import TokenDetailsModal from './TokenDetailsModal';
import NewTokenModal from './NewTokenModal';
import Token from './Token';

// history.push from lib/wallet.js
const LogInDiv = () => (
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
);

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
    searchToken: '',
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
        tempMap.set('NXS', {
          address: '0000000000000000000000000',
          balance: 0,
          created: 1400000000,
          currentsupply: 1000000,
          decimals: 6,
          maxsupply: 1000000,
          modified: 1400000000,
          name: 'NXS',
          owner: '00000000000000000000000000000',
          pending: 0,
          unconfirmed: 0,
        });
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
      return <Token key={key} token={value} />;
    });
  }

  async openSearchedDetailsModal(props) {
    try {
      const token = await apiGet(
        props.tokenName
          ? `tokens/get/token?name=${props.tokenName}`
          : `tokens/get/token?address=${props.tokenAddress}`
      );
      openModal(TokenDetailsModal, { token });
    } catch (e) {
      console.log(e);
      openModal(ErrorDialog, {
        message: __('Can not find Token'),
        note: e.message + ' ' + e.code,
      });
    }
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
    const { searchToken } = this.state;

    return (
      <Panel icon={userIcon} title={__('Tokens')} bodyScrollable={false}>
        {loggedIn ? (
          <>
            <Button
              skin="primary"
              onClick={() => {
                openModal(NewTokenModal);
              }}
            >
              {'Test Open Token Creation'}
            </Button>
            <FormField connectLabel label={__('Search Tokens')}>
              <TextField
                type="search"
                name="tokenSearch"
                placeholder={__('Search for Token ( Name or Address)')}
                value={searchToken}
                onChange={evt => {
                  const value = evt.target.value;
                  console.log(evt.target.value);
                  this.setState({ searchToken: value });
                }}
                left={<Icon icon={searchIcon} className="space-right" />}
                right={
                  <Button
                    skin="plain"
                    onClick={() => {
                      //Temp for testnet, need better solution
                      this.openSearchedDetailsModal(
                        searchToken.startsWith('8')
                          ? {
                              tokenAddress: searchToken,
                            }
                          : { tokenName: searchToken }
                      );
                    }}
                  >
                    Search
                  </Button>
                }
              />
            </FormField>
            <br />
            <HorizontalLine />
            <h3>{__("User's Used Tokens")}</h3>
            {this.returnTokenList()}
          </>
        ) : (
          <LogInDiv />
        )}
      </Panel>
    );
  }
}

export default Tokens;
