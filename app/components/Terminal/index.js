import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";

export default class Terminal extends Component {

  constructor(props){
    super(props);
    this.state = {
      //vars go here
      consoleoutput: [],
      deamonoutput: [],
      textinputstyle:{
        width: "80%",
        backgroundColor: "black",
        color: "gray"
      }
    }

  }  

  resetnexusrpcconsole()
  {
    this.setState({
      consoleoutput:[]
    });
  }

  processInput()
  {

  }

  textInputOnFocus()
  {
    let tempDivStyle = this.state.textinputstyle;
    tempDivStyle.color = 'white';

    this.setState(
      {
        textinputstyle:tempDivStyle
      }
    );
  }

  textInputOnBlur()
  {
    let tempDivStyle = this.state.textinputstyle;
    tempDivStyle.color = 'gray';

    this.setState(
      {
        textinputstyle:tempDivStyle
      }
    );
  }


  render() {
    let div1style = 
    {
      textAlign: "left",
      height:"75%",
      overflowY:"scroll",
      backgroundColor:"black",
    };
    return (
      <div id="nxs-console-module" style={{height:'100%', overflow:'hidden'}}>
      RPC Console:
      <button id={"nxs-console-resetbutton"}  onClick={() => this.resetnexusrpcconsole()}> Reset</button>
      <div id="nxs-console-output" style={div1style}>
           {this.props.consoleoutput}
          <div id="nxs-console-input" style={{textAlign: "left"}}>
              <input id="input-text" style={{...this.state.textinputstyle}} type="text" placeholder="Input commands here, input help for list of commands" onFocus={() => this.textInputOnFocus()} onBlur={ () => this.textInputOnBlur()}/>
              <button id="input-submit" style={{width: "18%", background: "black", color:"white", borderColor:"red"}} type="submit" value="Execute" onClick={() => this.processInput()}> </button>
          </div>
      </div>
      Deamon Output:
      <div id="nxs-deamon" style={{textAlign:'left', height:'75%', overflowY:'scroll', backgroundColor:'black'}}>
      {this.props.deamonoutput}
      </div>
  </div>
    );
  }
}
