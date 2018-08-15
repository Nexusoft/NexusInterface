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
      inputfield: null,
      commandList:[],
      autoComplete:[],
      testnum: 99999
    }

  }  

  componentDidMount(){
    //this.state.inputfield.focus(); 

    RPC.PROMISE("help", []).then(payload => {
      
      let CommandList = payload.split('\n');
      console.log(CommandList);
      this.setState(
        {
          commandList:CommandList
        }
      );
    });
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
      this.state.inputfield.value = ""; 
      return;
    }
    /// remove the command inputed
    this.state.inputfield.value = ""; 
    
    /// Get the old console output so we can concat on it.
    let tempConsoleOutput = [...this.state.consoleoutput];
  
    /// Split the input so that we can get the command and the arguments. THIS MIGHT BE AN ISSUE as I am just checking the US keyboard space
    let splitInput = this.state.currentInput.split(" ");

    let preSanatized = splitInput[0];

    preSanatized = preSanatized.replace(/[^a-zA-Z0-9]/g, "");

    splitInput[0] = preSanatized;

    /// this is the argument array
    let RPCArguments = [];


    /// Get all the words after the first one and place them into the RPCargs array
    for (let tempindex = 1; tempindex < splitInput.length; tempindex++) {
      let element = splitInput[tempindex];
      /// If this is a number we need to format it an int
      if (isNaN(Number(element)) === false)
      {
        element = parseFloat(element);
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
        for (let outputObject in payload)
        {
          //ddd.push(aaa + ": " + payload[aaa]);
          if (typeof payload[outputObject] === "object")
            {
              tempConsoleOutput.push(outputObject + ": " );
            }
            else{
              tempConsoleOutput.push(outputObject + ": " + payload[outputObject]);
            }
            
            //If it is a object then we need to display ever var on a new line.
            if (typeof payload[outputObject] === "object"){
              for (let interalres in payload[outputObject])
              {
                /// Probably need to do this in css but I add a tab to make it look cleaner
                tempConsoleOutput.push('       ' + interalres + ":" + payload[outputObject][interalres]);
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

  /// Handle arrow key press
  /// Handles what happens when the user presses arrow keys for the auto complete
  handleAutocompleteArrowKeyPress = (e) => {
    ///NOT WORKING COME BACK TO THIS 


    /*
    console.log(this.state.currentInput);
    console.log(e.target.value);

    let pdpdpdp = this.state.testnum;
    
    if (pdpdpdp == 9999)
    {
      pdpdpdp = -1;
    }

    if (e.key === 'ArrowDown')
    {
      pdpdpdp++;
    }

    if (e.key === 'ArrowUp')
    {
      pdpdpdp--; 
    }
    if (e.target.value == "")
    {
      pdpdpdp = 9999;
    }

    let tempcommand = this.state.autoComplete[pdpdpdp]

    if ( tempcommand != null)
    {
      console.log(tempcommand.props.children[0]);
      e.target.value = tempcommand.props.children[0];
      this.setState(
        {
          testnum:-1
        }
      )
    }

    

    this.setState(
      {
        testnum:pdpdpdp
      }
    , () => {console.log(this.state.testnum)}); 

      */
  }

  /// On Input Field Change
  /// What happens when the value of the inputfield changes
  onInputfieldChange = (e) =>
  {
    this.inputfield = e.target;
    this.setState(
      {
        currentInput: e.target.value
      }, () => this.returnAutocomplete() );
      
  }

  /// On Auto Complete Click
  /// What happens when you click on an auto complete link
  onAutoCompleteClick(inItem)
  {
    const inputRef = this.state.inputfield;
    inputRef.focus();
    this.setState(
      {
        currentInput:inItem,
        autoComplete: []
      }
    );
  }

  /// Return Auto Complete
  /// Returns the list of commands that should be displayed for the auto complete section
  returnAutocomplete()
  {
  

    const CommandList = this.state.commandList;
    const CurrentInput = this.state.currentInput;
    let tempCompandList = [];

    ///Just incase 
    if (CurrentInput == "")
    {
      this.setState(
        {
          autoComplete: []
        }
      );
      return;
    }


    CommandList.forEach(element => {
        if ( element.startsWith(CurrentInput))
        {
          tempCompandList.push(element);
        }
    });
    let tempAutoComplete = [];
    tempCompandList.map((item, key) => {
      return tempAutoComplete.push(<a key={key} onMouseDown={ () => this.onAutoCompleteClick(item)}>{item}<br/></a>);
    })



    this.setState(
      {
        autoComplete: tempAutoComplete
      }
    );
  }

  /// Remove Auto Complete Div
  /// Removes all divs from the array
  removeAutoCompleteDiv = (e) =>
  {
    this.setState(
      {
        autoComplete: []
      }
    );
  }


  render() {

    return (
      
      <div id="terminal-console">

        <div id="terminal-console-input">

          <input id="input-text" autoFocus ref={this.setInputFeild} type="text" value={this.currentInput} placeholder="Enter console commands here (ex: getinfo, help)" onChange={this.onInputfieldChange} onKeyPress={this.handleEnterKeyPress} onKeyDown={this.handleAutocompleteArrowKeyPress} onBlur={this.removeAutoCompleteDiv}/>
          <button id="input-submit" className="button primary" value="Execute" onClick={() => this.processInput()}>Execute</button>
        
         <div key="autocomplete" style={{position:'absolute',  top:'100%', zIndex: 99, background: 'black'}}>
        {this.state.autoComplete} </div>
        </div>
       
        <div id="terminal-console-output">

            {this.processOutput()}

        </div>

        <button id="terminal-console-reset" className="button" onClick={() => this.resetnexusrpcconsole()}>Clear Console</button>

      </div>

    );
  }
}
