import React, { Component } from "react";
import { connect } from "react-redux";
import styles from "./style.css";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";

const mapStateToProps = state => {
  return {
    ...state.common
  };
};

const mapDispatchToProps = dispatch => ({});

class ContactList extends Component {

  // constructor(props)
  // {
  //   super(props);

  //   this.state =
  //   {
  //     selectedContactIndex: 0,
  //     addcontactmodalopen: false
  //   };
  // }

  buildList() 
  {

    // console.debug("ContactList props:");
    // console.debug(this.props);

    if (this.props.data) {

      const master = this.props.data;
      const masterArr = Object.keys(master);

      if(masterArr[0] === "")
        masterArr[0] = "My Addresses";

      // console.debug("ContactList list array:");
      // console.debug(masterArr);

      return masterArr.map(function(item, i){

        return (
        
        <li key={i} onClick={() => this.click(i)}>
          <svg viewBox="0 0 100 100">
            <text x='50' y='50' dy='.35em'>
              {item.charAt(0)}
            </text>
          </svg>
          {item}
        </li>

        )

      }.bind(this));
    }
  }

  click = (index) => {
    // console.log("COntactList: update index: " + index);
    this.props.onClick(index);
    // this.setState({selectedContactIndex: index});
  };

  addcontact = () => {

    this.props.onAdd();

  }

  render() {

    return (

      <div id="addressbook-contact-list">

        {/* <button className="button primary">My Addresses</button> */}

        <h4>Contacts</h4>

        <ul>

          {this.buildList()}

        </ul>

        <button className="button primary" onClick={this.addcontact}>Add Contact</button>

      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContactList);
