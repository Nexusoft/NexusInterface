import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";


import * as TYPE from "../../actions/actiontypes";

import ContextMenuBuilder from "../../contextmenu";
import {remote} from "electron";

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

  componentDidMount()
    {
      window.addEventListener("contextmenu", this.setupcontextmenu, false);
    }
  
    componentWillUnmount()
    {
      window.removeEventListener("contextmenu",this.setupcontextmenu);
    }
  
    setupcontextmenu(e) {
      e.preventDefault();
      const contextmenu = new ContextMenuBuilder().defaultContext;
      //build default
      let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
      defaultcontextmenu.popup(remote.getCurrentWindow());
    }

    
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
        <h2>Send NXS</h2>

        <div className="panel" />
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SendRecieve);
