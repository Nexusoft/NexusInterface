import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { timingSafeEqual } from "crypto";
import * as RPC from "../../script/rpc";

/////////////////////////////////////////////////
///   Terminal Component
/////////////////////////////////////////////////
export default class Terminal extends Component {

  constructor(props){
    super(props);
    this.state = {
      //vars go here
      consoleoutput: [],
      deamonoutput: ["Started in Manual Deamon Mode"],
      currentInput: "",
      textinputstyle:{
        width: "80%",
        backgroundColor: "black",
        color: "gray"
      },
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

  /// Process Deamon Output
  /// Process the deamonoutput and return the JSX
  processDeamonOutput()
  {
    //TODO: if Manual deamon mode always show manual deamonmode"
    let num = 0;
    return this.state.deamonoutput.map((i) =>
    {
      num++;
      return (
        <div key= {'Deamonout_' + num}>
        {i}
        </div>
      )
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
      e.target.value = "";
      this.processInput()
    }
  }

  /// Text Input On Focus
  /// The function that happens when you click into the input field
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


  /// Text Input On Blur
  /// The Function that happens when you click OUT of the input field
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

  /// On Input Field Change
  /// What happens when the value of the inputfield changes
  onInputfieldChange = (e) =>
  {
    if (e.target.value == "")
    {
      this.textInputOnBlur();
    }
    else
    {
      this.textInputOnFocus();
    }
    this.setState(
      {
        currentInput: e.target.value
      });
  }

  /// Render
  /// The React Render Function
  render() {

    //TODO: Remove this and figure out better solution for CSS
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
                <input id="input-text" ref={this.setInputFeild} style={{...this.state.textinputstyle}} type="text" value={this.currentInput} placeholder="Input commands here, input help for list of commands" onFocus={() => this.textInputOnFocus()} onBlur={ () => this.textInputOnBlur()} onChange={this.onInputfieldChange} onKeyPress={this.handleEnterKeyPress}/>
                <button id="input-submit" style={{width: "18%", background: "black", color:"white", borderColor:"red"}} type="submit" value="Execute" onClick={() => this.processInput()}>Execute</button>
            </div>
        </div>
        Deamon Output:
        <div id="nxs-deamon" style={{textAlign:'left', height:'75%', overflowY:'scroll', backgroundColor:'black'}}>
          {this.processDeamonOutput()}
        </div>
      </div>
    );
  }
}
