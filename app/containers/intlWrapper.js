import React from "react";
import PropTypes from "prop-types";
import { IntlProvider } from "react-intl";
import { connect } from "react-redux";
// import messages from "./messages";
import intl from "../reducers/intl";

const mapStateToProps = state => {
  return {
    ...state.intl,
    ...state.common
  };
};

export function IntlWrapper(props) {
  console.log(props.locale);
  return (
    <IntlProvider
      locale={props.locale}
      messages={props.messages[props.locale]}
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
