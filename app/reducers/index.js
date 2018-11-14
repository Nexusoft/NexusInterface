import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";

import overview from "./overview";
import list from "./list";
import market from "./market";
import transactions from "./transactions";
import common from "./common";
import login from "./login";
import exchange from "./exchange";
import sendRecieve from "./sendRecieve";
import addressbook from "./addressbook";
import terminal from "./terminal";
import settings from "./settings";

import intl from "./intl";
import { addLocaleData } from "react-intl";
import ru from "react-intl/locale-data/ru";
import en from "react-intl/locale-data/en";
import { FormattedMessage } from "react-intl";
// import { intlReducer } from "react-intl-redux";
import itLocaleData from "react-intl/locale-data/it";
import enLocaleData from "react-intl/locale-data/en";
import ruLocaleData from "react-intl/locale-data/ru";

addLocaleData([...itLocaleData, ...ruLocaleData]);
addLocaleData(ru);
addLocaleData(en);

export default function createRootReducer(history: {}) {
  const routerReducer = connectRouter(history)(() => {});

  return connectRouter(history)(
    combineReducers({
      intl,
      overview,
      routerReducer,
      list,
      login,
      market,
      sendRecieve,
      transactions,
      exchange,
      common,
      addressbook,
      terminal,
      settings
    })
  );
}
