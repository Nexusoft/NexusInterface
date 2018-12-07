import React from 'react'

import { IntlProvider } from 'react-intl'
import { connect } from 'react-redux'
import intl from 'reducers/intl'

const mapStateToProps = state => {
  return {
    ...state.intl,
    ...state.common,
    ...state.settings,
  }
}

export function IntlWrapper(props) {
  return (
    <IntlProvider
      locale={props.settings.locale}
      messages={props.messages}
      {...props.intl}
    >
      {props.children}
    </IntlProvider>
  )
}

export default connect(mapStateToProps)(IntlWrapper)
