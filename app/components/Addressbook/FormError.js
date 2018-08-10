import React, { Component } from "react";
import { connect } from "react-redux";
import styles from "./style.css";
import * as TYPE from "../../actions/actiontypes";

const mapStateToProps = state => {
  return {
    ...state.common
  };
};

const mapDispatchToProps = dispatch => ({});

class FormError extends Component {

  render() {

    if (!this.props.error)
    {
      return null;
    }

    return (

        <div className="form-error">

          {this.props.error}
          
        </div>
      
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FormError);
