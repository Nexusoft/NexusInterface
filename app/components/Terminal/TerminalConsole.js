import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { timingSafeEqual } from "crypto";
import * as RPC from "../../script/rpc";

export default class TerminalConsole extends Component {

  constructor(props){
    super(props);
    this.state = {
      //vars go here
      consoleoutput: [],
      currentInput: "",
      inputfield: null
      
    }

  }  

  componentDidMount(){
    //this.state.inputfield.focus(); 
  }

  /// Reset Nexus RPC Console
  /// Clean out the consoleoutput state
  resetnexusrpcconsole()
  {
    this.setState({
      consoleoutput:[]
    });
  }

  /// Process Output
  /// Process the consoleoutput and return JSX
  processOutput()
  {
    if ( this.state.inputfield != null)
    {
      this.state.inputfield.focus();
    }
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

  /// Process Input
  /// Process the input the user types in the rpc command input field
  processInput()
  {
    /// If Nothing Then just exit
    if (this.state.currentInput == "")
    {
      return;
    }
    /// This is not a RPC command, so catch this input and clear the console
    if (this.state.currentInput.toLowerCase() == "clear" )
    {
      this.resetnexusrpcconsole();
      return;
    }
    /// remove the command inputed
    this.state.inputfield.value = ""; 
    
    /// Get the old console output so we can concat on it.
    let tempConsoleOutput = [...this.state.consoleoutput];
    
    //console.log(this.state.currentInput);

    /// Split the input so that we can get the command and the arguments. THIS MIGHT BE AN ISSUE as I am just checking the US keyboard space
    let splitInput = this.state.currentInput.split(" ");
    /// this is the argument array
    let RPCArguments = [];


    /// Get all the words after the first one and place them into the RPCargs array
    for (let tempindex = 1; tempindex < splitInput.length; tempindex++) {
      let element = splitInput[tempindex];
      /// If this is a number we need to format it an int
      if (isNaN(Number(element)) === false)
      {
        element = parseInt(element);
      }
      RPCArguments.push(element);
    }
   
    /// Execute the command with the given args
    RPC.PROMISE(splitInput[0], RPCArguments).then(payload => {

      /// If a single object is given back, output it
      if(typeof payload === "string" || typeof payload === "number" ) {
        if (typeof payload === "string"){
          let temppayload = payload;
          /// If we find there are end line characters then we need to make these line breaks
          temppayload.split('\n').map((item, key) => {
            return tempConsoleOutput.push(<span key={key}>{item}<br/></span>);
          })
        }
        else
        {
          tempConsoleOutput.push(payload);
        }
      }
      /// If it is a object with multi variables then output them on each line 
      else {
        for (let aaa in payload)
        {
          //ddd.push(aaa + ": " + payload[aaa]);
          if (typeof payload[aaa] === "object")
            {
              tempConsoleOutput.push(aaa + ": " );
            }
            else{
              tempConsoleOutput.push(aaa + ": " + payload[aaa]);
            }
            
            //If it is a object then we need to display ever var on a new line.
            if (typeof payload[aaa] === "object"){
              for (let interalres in payload[aaa])
              {
                /// Probably need to do this in css but I add a tab to make it look cleaner
                tempConsoleOutput.push('       ' + interalres + ":" + payload[aaa][interalres]);
              }
            }

        }
      }
      /// Set the state to have this tempconsoleoutput
      this.setState(
      {
        consoleoutput: tempConsoleOutput,
        currentInput:""
      }
    );
    }).catch( error =>
      {
        /// If there is an error then return that error message and place it in the output.
        tempConsoleOutput.push(error);
        this.setState(
          {
            consoleoutput: tempConsoleOutput,
            currentInput:""
          });
      }
    );
  }

  /// Set Input Field
  /// Sets up the input field so we can reference it later
  setInputFeild = (e) =>
  {
    this.setState(
      {
        inputfield:e
      }
    )
  }

  ///Handle Enter Key Press
  /// Handles what happens when the user presses the enter key
  handleEnterKeyPress = (e) => {
    
    if (e.key === 'Enter') {
      this.processInput();
    }
  }

  /// On Input Field Change
  /// What happens when the value of the inputfield changes
  onInputfieldChange = (e) =>
  {
    this.setState(
      {
        currentInput: e.target.value
      });
  }


  render() {

    return (
      
      <div id="terminal-console">

        <div id="terminal-console-input">

          <input id="input-text" autoFocus ref={this.setInputFeild} type="text" value={this.currentInput} placeholder="Enter console commands here (ex: getinfo, help)" onChange={this.onInputfieldChange} onKeyPress={this.handleEnterKeyPress}/>
          <button id="input-submit" className="button primary" value="Execute" onClick={() => this.processInput()}>Execute</button>
          
        </div>

        <div id="terminal-console-output">

            {this.processOutput()}

        </div>

        <button id="terminal-console-reset" className="button" onClick={() => this.resetnexusrpcconsole()}>Clear Console</button>

      </div>

    );
  }
}
