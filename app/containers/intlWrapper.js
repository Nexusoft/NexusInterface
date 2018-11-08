import React from "react";
import PropTypes from "prop-types";
import { IntlProvider } from "react-intl";
import { connect } from "react-redux";
// import messages from "./messages";
import intl from "../reducers/intl";

const mapStateToProps = state => {
  return {
    ...state.intl,
    ...state.common,
    ...state.settings
  };
};

export function IntlWrapper(props) {
  return (
    <IntlProvider
      locale={props.settings.locale}
      messages={props.settings.messages[props.settings.locale]}
      {...props.intl}
    >
      {props.children}
    </IntlProvider>
  );
}

IntlWrapper.props = {
  children: PropTypes.element.isRequired,
  lang: PropTypes.string.isRequired,

  textComponent: (PropTypes.node = "span")
};

// Retrieve data from store as props
// function mapStateToProps(store) {
//   return {
//     intl: store.intl
//   };
// }

export default connect(mapStateToProps)(IntlWrapper);
