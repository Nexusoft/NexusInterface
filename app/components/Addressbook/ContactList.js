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

  build() 
  {

    if (this.props.contacts) {

      const contacts = Object.keys(this.props.contacts).sort();

      return contacts.map(function(item, i){

        if (i === 0)
          return null;
          
        let contact = this.props.contacts[item];

        return (
        
        <li key={i} onClick={() => this.select(item)}>

          <span className="contact-avatar">
            <svg viewBox="0 0 100 100">
              <text x='50' y='50' dy='.35em'>
                {this.getinitial(item)}
              </text>
            </svg>
          </span>
          <span className="contact-name">{(item === "" ? "My Addresses" : item)}</span>
          <span className="contact-phone">{contact.phoneNum}</span>
          <span className="contact-addresses">{Object.keys(contact.notMine).length} Addresses</span>

        </li>

        )

      }.bind(this));
    }
    
  }

  getinitial(name) 
  {

    if (name && name.length >= 1)
      return name.charAt(0);

    return "M";  // My Addresses

  }

  select = (item) => {

    // get this by item name instead of index since we sorted the names list
    let index = Object.keys(this.props.contacts).indexOf(item);

    this.props.onSelect(index);

  }

  render() {

    return (

      <div id="addressbook-contacts">

        <ul>

          {this.build()}

        </ul>

      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContactList);
