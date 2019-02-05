/*
Title: Time Zone Selector
Description: Support class for selecting your contacts timezone
Last Modified by: Brian Smith
*/

// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

// Internal Dependencies
import * as actionsCreators from 'actions/addressbookActionCreators';

// React-Redux mandatory methods
const mapDispatchToProps = dispatch =>
  bindActionCreators(actionsCreators, dispatch);
const mapStateToProps = state => {
  return { ...state.common, ...state.addressbook };
};

/**
 * Creates a Time Zone Selector Element
 *
 * @class TimeZoneSelector
 * @extends {Component}
 */
class TimeZoneSelector extends Component {
  // Mandatory React method
  render() {
    return (
      <span>
        <select
          className="editFeildDoNotClose"
          ref="editTimeZone"
          id="addContactTimeZoneSelect"
          onChange={e => {
            if (this.props.editTZ) {
              this.props.SaveTz(this.props.selected, parseInt(e.target.value));
            } else {
              this.props.EditProtoTZ(parseInt(e.target.value));
            }
          }}
          value={this.props.prototypeTimezone}
        >
          <option value="0"> (UTC + 0.00 hr) London, Casablanca, Accra</option>
          <option value="-60">
            (UTC - 1.00 hr) Cabo Verde, Ittoqqortoormiit, Azores Islands
          </option>
          <option value="-120">
            (UTC - 2.00 hr) Fernando de Noronha, South Sandwich Islands
          </option>
          <option value="-180">
            (UTC - 3.00 hr) Buenos Aires, Montevideo, São Paulo
          </option>
          <option value="-210">
            (UTC - 3.50 hr) St. John's, Labrador, Newfoundland
          </option>
          <option value="-240">
            (UTC - 4.00 hr) Santiago, La Paz, Halifax
          </option>
          <option value="-300">(UTC - 5.00 hr) New York, Lima, Toronto</option>
          <option value="-360">
            (UTC - 6.00 hr) Chicago, Guatemala City, Mexico City
          </option>
          <option value="-420">
            (UTC - 7.00 hr) Phoenix, Calgary, Ciudad Juárez
          </option>
          <option value="-480">
            (UTC - 8.00 hr) Los Angeles, Vancouver, Tijuana
          </option>
          <option value="-540">(UTC - 9.00 hr) Anchorage</option>
          <option value="-570">(UTC - 9.50 hr) Marquesas Islands</option>
          <option value="-600">(UTC - 10.00 hr) Papeete, Honolulu</option>
          <option value="-660">
            (UTC - 11.00 hr) Niue, Jarvis Island, American Samoa
          </option>
          <option value="-720">
            (UTC - 12.00 hr) Baker Island, Howland Island
          </option>
          <option value="840">(UTC + 14.00 hr) Line Islands</option>
          <option value="780">(UTC + 13.00 hr) Apia, Nukuʻalofa</option>
          <option value="765">(UTC + 12.75 hr) Chatham Islands</option>
          <option value="720">(UTC + 12.00 hr) Auckland, Suva</option>
          <option value="660">
            (UTC + 11.00 hr) Noumea, Federated States of Micronesia
          </option>
          <option value="630">(UTC + 10.50 hr) Lord Howe Island</option>
          <option value="600">
            (UTC + 10.00 hr) Port Moresby, Sydney, Vladivostok
          </option>
          <option value="570">(UTC + 9.50 hr) Adelaide</option>
          <option value="540">(UTC + 9.00 hr) Seoul, Tokyo, Yakutsk</option>
          <option value="525">(UTC + 8.75 hr) Eucla</option>
          <option value="510">(UTC + 8.50 hr) Pyongyang</option>
          <option value="480">
            (UTC + 8.00 hr) Beijing, Singapore, Manila
          </option>
          <option value="420">
            (UTC + 7.00 hr) Jakarta, Bangkok, Ho Chi Minh City
          </option>
          <option value="390">(UTC + 6.50 hr) Yangon</option>
          <option value="360">(UTC + 6.00 hr) Almaty, Dhaka, Omsk</option>
          <option value="345">(UTC + 5.75 hr) Kathmandu</option>
          <option value="330">(UTC + 5.50 hr) Delhi, Colombo</option>
          <option value="300">
            (UTC + 5.00 hr) Karachi, Tashkent, Yekaterinburg
          </option>
          <option value="270">(UTC + 4.50 hr) Kabul</option>
          <option value="240">(UTC + 4.00 hr) Baku, Dubai, Samara</option>
          <option value="210">(UTC + 3.50 hr) Tehran</option>
          <option value="180">(UTC + 3.00 hr) Istanbul, Moscow, Nairobi</option>
          <option value="120">
            (UTC + 2.00 hr) Athens, Cairo, Johannesburg
          </option>
          <option value="60">(UTC + 1.00 hr) Berlin, Lagos, Madrid</option>
        </select>
      </span>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TimeZoneSelector);
