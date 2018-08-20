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

    return Object.keys(this.props.contacts["myAccount"].mine).map(function(item, i){

      return (

        <tr className="contact-address">
          <td>{item}</td>
          <td className="address" key={i} data-address={this.props.contacts["myAccount"].mine[item]} onClick={this.copyaddress}>
            {this.props.contacts["myAccount"].mine[item]}
            <div className="tooltip left">Click to copy</div>
          </td>
        </tr>

      )

    }.bind(this));

  }
  
  copyaddress(event) 
  {
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

  add = () => {

    this.props.onAddReceiveAddress(this.refs.addReceiveAddressLabel.value);

  }

  close = () => {

    this.props.onClose();

  }

  render() {

    if (!this.props.show || this.props.contacts === null)
    {
      return null;
    }

    return (

      <Modal 
      open={this.props.show} 
      onClose={this.close} 
      center 
      classNames={{ modal: 'modal addressbook-add-receive-addr-modal' }}>

        <div id="addressbook-my-addresses">

          <h3>

            My Addresses

          </h3>

          <div id="addressbook-my-addresses-inputs">

            <input ref="addReceiveAddressLabel" autoFocus type="text" placeholder="Label for new address"/>
            <button className="button primary" onClick={this.add}>Add Address</button>

          </div>

          <div id="my-addresses-list">

            <table>

              <thead>
                <th>Label</th>
                <th>Address</th>
              </thead>

              <tbody>
                {this.buildmyaddresses()}
              </tbody>

            </table>

          </div>

          <button className="button" onClick={this.close}>Close</button>

        </div>

      </Modal>
      
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MyAddresses);
