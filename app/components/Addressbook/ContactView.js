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

class ContactView extends Component {

  constructor(props)
  {
    super(props);

    this.state =
    {
      isEditing: false
    };
  }


  getinitial(name) 
  {

    if (name && name.length >= 1)
      return name.charAt(0);

    return "M";  // My Addresses

  }

  buildtheiraddresses() 
  {

    return Object.keys(this.props.contact.notMine).map(function(item, i){

      return (

        <div className="contact-address">
          <label>{item}</label>
          <span key={i} data-address={this.props.contact.notMine[item]} onClick={this.copyaddress}>
            {this.props.contact.notMine[item]}
          </span>
          <div className="tooltip bottom">Click to copy</div>
        </div>

      )

    }.bind(this));

  }

  edit = () =>
  {

    this.setState(
      {
        isEditing: true
      }
    );

  }

  save = () =>
  {

    // this.props.contact.name = this.refs.name;
    this.props.contact.phoneNum = this.refs.editPhoneNumber.value;
    this.props.contact.timeZone = parseInt(this.refs.editTimeZone.value);
    this.props.contact.notes = this.refs.editNotes.value;

    this.setState(
      {
        isEditing: false
      }
    );

    this.props.onUpdate(this.props.contact);

  }

  close = () =>
  {

    let container = document.getElementById("addressbook-contact-view");

    container.classList.add("close");

    var self = this;

    setTimeout(function() {
      container.classList.remove("close");
      self.props.onClose();
    }, 500);

  }
  
  addaddress = () =>
  {
  
    let label = this.refs.addContactAddressLabel.value;
    let address = this.refs.addContactAddress.value;

    if (label.trim() === "")
      return;

    // Validate that the address is a valid address
    RPC.PROMISE("validateaddress", [address])
    .then(payload => {

      if(!this.props.contact.newNotMine)
        this.props.contact.newNotMine = new Array();

      this.props.contact.newNotMine.push(
        {
          label: label.trim(),
          address: address.trim()
        }
      )

      console.log("valid address: ", label, address);

    })
    .catch(e => {

      console.log("invalid address: ", address);
      // this.setState(
      //   {
      //     addError: "Please enter a valid Nexus address"
      //   }
      // );

    });

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

    /// TIME
  /// takes in the offset and the mounting point and calculates local time and diplays the local time
  /// Input:
  ///     offSet || number || diffrence in min from GMT to calculate the time in that timezone
  ///     bottomPart || HTML element || mounting point

  formatTime(offSet)
  {

    let date = new Date();
    let utc = date.getTimezoneOffset();
    date.setMinutes(date.getMinutes() + utc);
    date.setMinutes(date.getMinutes() + offSet);

    let hours = date.getHours();
    let months = date.getMinutes();
    let ampm = "AM";
    if (hours >= 12) {
      ampm = "PM";
      hours = hours - 12;
    }
    if (hours === 0) {
      hours = "12";
    }
    if (months <= 9) {
      months = `0${months}`;
    }

    return `${hours}:${months} ${ampm}`;

  };

  renderNameHeader() {

    return (

      <h3>

        <svg viewBox="0 0 100 100">
          <text x='50' y='50' dy='.35em'>
            {this.getinitial(this.props.contact.name)}
          </text>
        </svg>

        {(this.props.contact.name)}

      </h3>

    )

  }

  renderTimeZone() {

    if (this.state.isEditing)
    {
      return (

        <div className="contact-detail">
          <label>Local Time</label>
          <span>
            <select ref="editTimeZone" defaultValue={this.props.contact.timeZone}>
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
          </span>
        </div>

      )
    }
    else if (this.props.contact.timeZone)
    {
      return (

        <div className="contact-detail">
          <label>Local Time</label>
          <span>{this.formatTime(this.props.contact.timeZone)}</span>
        </div>

      )
    }
  }

  renderPhoneNumber() {

    if (this.state.isEditing)
    {
      return (

        <div className="contact-detail">
          <label>Phone</label>
          <span><input ref="editPhoneNumber" type="tel" placeholder="Phone #" defaultValue={this.props.contact.phoneNum}/></span>
        </div>

      )
    }
    else if (this.props.contact.phoneNum)
    {
      return (

        <div className="contact-detail">
          <label>Phone</label>
          <span>{this.props.contact.phoneNum}</span>
        </div>

      )
    }
  }

  renderNotes() {

    if (this.state.isEditing)
    {
      return (

        <div className="contact-detail">
          <label>Notes</label>
          <span><textarea ref="editNotes" rows="4" defaultValue={this.props.contact.notes}></textarea></span>
        </div>

      )
    }
    else if (this.props.contact.notes)
    {
      return (

        <div className="contact-detail">
          <label>Notes</label>
          <span>{this.props.contact.notes}</span>
        </div>

      )
    }
  }

  renderAddresses() {

    if (this.state.isEditing)
    {

      return (

        <div>

          {this.buildtheiraddresses()}


          <div id="add-address-inputs">

            <input ref="addContactAddressLabel" type="text" placeholder="Label"/>
            <input ref="addContactAddress" type="text" placeholder="Nexus address"/>
            <button className="button" onClick={this.addaddress}>+</button>

          </div>

        </div>

      )
    }
    else
    {
      return (

        <div>

          {this.buildtheiraddresses()}

        </div>

      )
    }
  }

  renderEditButton() {

    if (!this.state.isEditing) {

      return (

        <button id="edit-contact" className="button" onClick={this.edit}>Edit Contact</button>

      )
    
    }
  }

  renderSaveButton() {

    if (this.state.isEditing) {

      return (

        <button id="save-contact" className="button primary" onClick={this.save}>Save Contact</button>

      )
    
    }
  }

  render() {

    if (!this.props.show || this.props.contact === null)
    {
      return null;
    }

    return (

      <div id="addressbook-contact-view">

          <a id="close-contact" onClick={this.close}>
            <svg className="close-button" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 36 36"><path d="M28.5 9.62L26.38 7.5 18 15.88 9.62 7.5 7.5 9.62 15.88 18 7.5 26.38l2.12 2.12L18 20.12l8.38 8.38 2.12-2.12L20.12 18z"></path></svg>
          </a>
          
          {this.renderNameHeader()}

          <h4>Contact Information</h4>

          {this.renderTimeZone()}
          {this.renderPhoneNumber()}
          {this.renderNotes()}

          <h4>Addresses</h4>

          {this.renderAddresses()}

          {this.renderEditButton()}
          {this.renderSaveButton()}

      </div>
      
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContactView);
