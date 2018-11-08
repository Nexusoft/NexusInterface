import React, { Component } from "react";
import type { Children } from "react";
// import { IntlProvider } from "react-intl-redux";
// import { Provider } from "react-redux";
import rootReducer from "../reducers";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import intl from "../reducers/intl";
import { updateIntl } from "react-intl-redux";
// import messages from "./messages";
const store = require("../store/configureStore.dev");
const UPDATE_LOCALES = "UPDATE_LOCALES";
import { addLocaleData } from "react-intl";
import en from "react-intl/locale-data/en";
import it from "react-intl/locale-data/it";
import messages_de from "../translations/de.json";
import messages_en from "../translations/en.json";
import locale_en from "react-intl/locale-data/en";
import locale_de from "react-intl/locale-data/de";
import { intlReducer } from "react-intl-redux";
import IntlWrapper from "../containers/intlWrapper";

// addLocaleData([...locale_en, ...locale_de]);
// const language = navigator.language.split(/[-_]/)[0];

// const messages = {
//   de: messages_de,
//   en: messages_en
// };

class App extends Component {
  // props: {
  //   children: Children
  // };

  render() {
    return (
      <IntlWrapper>
        <div id="app">{this.props.children}</div>
      </IntlWrapper>
    );
  }
}
export default App;
