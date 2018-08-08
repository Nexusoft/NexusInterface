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

class ContactEdit extends Component {

  constructor(props)
  {
    super(props);

    this.state =
    {
      showEditAddress: false,
      editAddressLabel: null,
      editAddressAddr: null
    };
  }

  getinitial(name) 
  {

    if (name && name.length >= 1)
      return name.charAt(0);

    return "M";  // My Addresses

  }

  update = () =>
  {

    let name = document.getElementById("edit-account-name").value;
    let phone = document.getElementById("edit-account-phone").value;
    let timezone = JSON.parse(document.getElementById("edit-account-timezone").value);
    let address = document.getElementById("edit-account-address").value;
    let notes = document.getElementById("edit-account-notes").value;

    this.props.contact.name = name;
    this.props.contact.phoneNum = phone;
    this.props.contact.timeZone = timezone;
    this.props.contact.notes = notes;

    this.props.onUpdate(this.props.contact);

  }

  showeditaddress = () =>
  {
    // let label = document.getElementById("edit-address-label");
    // let addr = document.getElementById("edit-address-addr");

    // console.log(this.props.contact.notMine["14"]);

    // label.value = "did this work";
    // addr.value = "hopefully it did";

    this.setState(
      {
        showEditAddress: true,
        editAddressLabel: "test",
        editAddressAddr: "addr"
      }
    );
  }

  closeeditaddress = () =>
  {
    this.setState(
      {
        showEditAddress: false
      }
    );
  }

  render() {

    if (!this.props.show)
    {
      return null;
    }

    return (

      <div id="addressbook-contact-edit">

        <h4>Edit Contact: {this.props.contact.name}</h4>

        {/* <h4>

          <svg viewBox="0 0 100 100">
            <text x='50' y='50' dy='.35em'>
              {this.getinitial(this.props.contact.name)}
            </text>
          </svg>

          {(this.props.contact.name === "" ? "My Addresses" : this.props.contact.name)}

        </h4> */}

        <div className="field">
          <label htmlFor="edit-account-name">Name</label>
          <input id="edit-account-name" type="text" placeholder="Name" defaultValue={this.props.contact.name}/>
        </div>

        <div className="field">
          <label htmlFor="edit-account-name">Phone #</label>
          <input id="edit-account-phone" type="tel" placeholder="Phone #" defaultValue={this.props.contact.phoneNum}/>
        </div>

        <div className="field">
          <label htmlFor="edit-account-timezone">Time Zone</label>
          <select id="edit-account-timezone" defaultValue={this.props.contact.timeZone}>
            <option value="0">London, Casablanca, Accra</option>
            <option value="-60">Cabo Verde, Ittoqqortoormiit, Azores Islands</option>
            <option value="-120">Fernando de Noronha, South Sandwich Islands</option>
            <option value="-180">Buenos Aires, Montevideo, São Paulo</option>
            <option value="-210">St. John's, Labrador, Newfoundland</option>
            <option value="-240">Santiago, La Paz, Halifax</option>
            <option value="-300">New York, Lima, Toronto</option>
            <option value="-360">Chicago, Guatemala City, Mexico City</option>
            <option value="-420">Phoenix, Calgary, Ciudad Juárez</option>
            <option value="-480">Los Angeles, Vancouver, Tijuana</option>
            <option value="-540">Anchorage</option>
            <option value="-570">Marquesas Islands</option>
            <option value="-600">Papeete, Honolulu</option>
            <option value="-660">Niue, Jarvis Island, American Samoa</option>
            <option value="-720">Baker Island, Howland Island</option>
            <option value="840">Line Islands</option>
            <option value="780">Apia, Nukuʻalofa</option>
            <option value="765">Chatham Islands</option>
            <option value="720">Auckland, Suva</option>
            <option value="660">Noumea, Federated States of Micronesia</option>
            <option value="630">Lord Howe Island</option>
            <option value="600">Port Moresby, Sydney, Vladivostok</option>
            <option value="570">Adelaide</option>
            <option value="540">Seoul, Tokyo, Yakutsk</option>
            <option value="525">Eucla</option>
            <option value="510">Pyongyang</option>
            <option value="480">Beijing, Singapore, Manila</option>
            <option value="420">Jakarta, Bangkok, Ho Chi Minh City</option>
            <option value="390">Yangon</option>
            <option value="360">Almaty, Dhaka, Omsk</option>
            <option value="345">Kathmandu</option>
            <option value="330">Delhi, Colombo</option>
            <option value="300">Karachi, Tashkent, Yekaterinburg</option>
            <option value="270">Kabul</option>
            <option value="240">Baku, Dubai, Samara</option>
            <option value="210">Tehran</option>
            <option value="180">Istanbul, Moscow, Nairobi</option>
            <option value="120">Athens, Cairo, Johannesburg</option>
            <option value="60">Berlin, Lagos, Madrid</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="edit-account-notes">Notes</label>
          <textarea id="edit-account-notes" rows="4" defaultValue={this.props.contact.notes}></textarea>
        </div>

        <div className="field">
          <label htmlFor="edit-account-address">Nexus Address</label>
          <input id="edit-account-address" type="text"  placeholder="Nexus Address" />
        </div>

        <button className="button" onClick={this.update}>Update Contact</button>
        <button className="button" onClick={this.showeditaddress}>Edit Address</button>

          <Modal 
            open={this.state.showEditAddress} 
            onClose={this.closeeditaddress} 
            center 
            classNames={{ modal: 'modal' }}>

            <h2>Edit Address</h2>

            <div className="field">
              <label htmlFor="edit-address-label">Name</label>
              <input id="edit-address-label" type="text" placeholder="Label" defaultValue={this.state.editAddressLabel}/>
            </div>

            <div className="field">
              <label htmlFor="edit-address-addr">Name</label>
              <input id="edit-address-addr" type="text" placeholder="Address" defaultValue={this.state.editAddressAddr}/>
            </div>

          </Modal>

      </div>
      
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContactEdit);
