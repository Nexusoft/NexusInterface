import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { timingSafeEqual } from "crypto";
import * as RPC from "../../script/rpc";

export default class Terminal extends Component {

  constructor(props){
    super(props);
    this.state = {
      //vars go here
      consoleoutput: [],
      deamonoutput: [],
      currentInput: "Input commands here, input help for list of commands",
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

  processOutput()
  {
    let ffff = ["aaa","bbbb","cccc","dddddd","fffff","gggggg"];
    let num = 0;
    return  this.state.consoleoutput.map((i) => 
    {
      num++;
      return (
        <div key = {num}>
        {i}
        </div>
      )
    });
  
  }

  processInput
  {
    let ffff = ["aaa","bbbb","cccc","dddddd","fffff","gggggg"];
    let ddd = [...this.state.consoleoutput];
    console.log(this.state.currentInput);
    RPC.PROMISE(this.state.currentInput, []).then(payload => {
      console.log(payload);
      for (let aaa in payload)
      {
        //ddd.push(aaa + ": " + payload[aaa]);
        if (typeof payload[aaa] === "object")
          {
            ddd.push(aaa + ": " );
          }
          else{
            ddd.push(aaa + ": " + payload[aaa]);
          }
          //outputcall.appendChild(line);
          //If it is a object then we need to display ever var on a new line.
          if (typeof payload[aaa] === "object"){
            for (let interalres in payload[aaa])
            {
             // let line = document.createElement("div");
              ddd.push('       ' + interalres + ":" + payload[aaa][interalres]);
              //outputcall.appendChild(line);
            }
          }

      }this.setState(
      {
        consoleoutput: ddd,
        currentInput:"Input commands here, input help for list of commands"
      }
    );
    });
   //ddd.concat(ffff);
   //ddd.push(ffff[0]);
   console.log(ddd)
    
    console.log(this.state);

   


  }

  _handleKeyPress = (e) => {
    
    if (e.key === 'Enter') {
      e.target.value = "";
      this.processInput()
    }
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

  onInputfieldChange = (e) =>
  {
    console.log(e.target.value);
    this.setState(
      {
        currentInput: e.target.value
      });
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
      <div id="nxs-console-module" style={{height:'100%', width:'100%', overflow:'hidden'}}>
        RPC Console:
        <button id={"nxs-console-resetbutton"}  onClick={() => this.resetnexusrpcconsole()}> Reset</button>
        <div id="nxs-console-output" style={div1style}>
            {this.processOutput()}
            <div id="nxs-console-input" style={{textAlign: "left"}}>
                <input id="input-text" style={{...this.state.textinputstyle}} type="text" value={this.currentInput} placeholder="Input commands here, input help for list of commands" onFocus={() => this.textInputOnFocus()} onBlur={ () => this.textInputOnBlur()} onChange={this.onInputfieldChange} onKeyPress={this._handleKeyPress}/>
                <button id="input-submit" style={{width: "18%", background: "black", color:"white", borderColor:"red"}} type="submit" value="Execute" onClick={() => this.processInput()}>Execute</button>
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
