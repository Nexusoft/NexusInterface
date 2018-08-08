import React, { Component } from "react";
import { connect } from "react-redux";
import styles from "./style.css";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";
import Modal from 'react-responsive-modal';

const mapStateToProps = state => {
  return {
    ...state.common
  };
};

const mapDispatchToProps = dispatch => ({});

class MyAddresses extends Component {

  buildmyaddresses() 
  {

    return Object.keys(this.props.contact.mine).map(function(item, i){

      return (

        <div className="contact-address">
          <label>{item}</label>
          <span key={i} data-address={this.props.contact.mine[item]} onClick={this.copyaddress}>
            {this.props.contact.mine[item]}
          </span>
          <div className="tooltip bottom">Click to copy</div>
        </div>

      )

    }.bind(this));

  }
  
  copyaddress(event) 
  {
    console.log("copying");
    event.preventDefault();

    let target = event.currentTarget;
    let address = target.dataset.address;
    
    // create a temporary input element and add it to the list item (no one will see it)
    let input = document.createElement("input");
    input.type = "text";
    target.appendChild(input);

    // set the value of the input to the selected address, then focus and select it
    input.value = address;
    input.focus();
    input.select();

    // copy it to clipboard
    document.execCommand("Copy", false, null);

    // remove the temporary element from the DOM
    input.remove();
    
    target.classList.add("copied");

    setTimeout(function() {
      target.classList.remove("copied");
    }, 5000);
  }

  close = () => {

    this.props.onClose();

  }

  render() {

    if (!this.props.show || this.props.contact === null)
    {
      return null;
    }

    return (

      <Modal 
      open={this.props.show} 
      onClose={this.close} 
      center 
      classNames={{ modal: 'modal' }}>

        <div id="addressbook-my-addresses">

          <h3>

            My Addresses

          </h3>

          <div>

            {this.buildmyaddresses()}

          </div>
          
          <button className="button" onClick={this.props.onAddReceiveAddress}>Add Receive Address</button>

        </div>

      </Modal>
      
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MyAddresses);
