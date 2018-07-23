import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";

const mapStateToProps = state => {
  return { ...state.common, ...state.transactions };
};

const mapDispatchToProps = dispatch => ({
  SetSendAgainData: returnData => 
  { 
    dispatch({type:TYPE.SET_TRANSACTION_SENDAGAIN,payload:returnData}) 
  } 

});

class SendRecieve extends Component {
  render() {
    ///THIS IS NOT THE RIGHT AREA, this is for auto completing when you press a transaction 
    if ( this.props.sendagain != undefined && this.props.sendagain != null) 
    { 
      console.log(this.props.sendagain); 
      this.props.SetSendAgainData( 
        null 
      ); 
    } 

    
    return (
      
      <div id="send-receive">
        <h2>Send / Receive</h2>

        <div className="panel" />
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SendRecieve);
