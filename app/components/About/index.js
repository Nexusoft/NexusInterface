import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import styles from "./style.css";
import * as TYPE from "../../actions/actiontypes";
import packageJson from "../../../package.json";


//dontneed
import * as actionsCreators from "../../actions/marketActionCreators";
import { bindActionCreators } from "redux";

import nexusLogo from "../../images/logo-full.svg";
import updateicon from "../../images/unlock.png";

const mapStateToProps = state => {
  return { ...state.overview };
};

const mapDispatchToProps = dispatch =>
bindActionCreators(actionsCreators, dispatch);

class About extends Component {
    
    componentDidMount() {
     
    }
    componentWillUnmount()
    {

    }

    getCurrentYear()
    {
      let temp = new Date();
      return temp.getFullYear();
    }

    getInterfaceVersionNumber()
    {
      return packageJson.version;
    }

    getDeamonVersionNumber()
    {
      return this.props.version;
    }

    render() {
        return (
          <div id="About" className="animated fadeIn">
            <h1> ABOUT NEXUS WALLET </h1>
            <row>
              <column>
                  <img src={nexusLogo}/><br/>
                  <row>
                    <column>
                      <b>Interface Version:</b> {this.getInterfaceVersionNumber()} <br/>
                      <b>Build Date: </b> July 19th 2018 <br/> 
                    </column>
                    <column>
                      <b>Deamon Version:</b> {this.getDeamonVersionNumber()} <br/>
                      <b>Build Date: </b> July 19th 2018 <br/> 
                    </column>
                  </row>
                  <br/>
                  <br/>
                  <b>Copyright {this.getCurrentYear()} </b> Nexus,Videlicet,Peercoin <br/>
                  <br/>
                  <b>THIS IS EXPERIMENTAL SOFTWARE AND THE NEXUS EMBASSY HOLDS NO LIABILITY FOR THE USE OF THIS SOFTWARE</b>
              </column>
              <column>
                  <h2>License Agreement</h2>
                  <blockquote>
                          Copyright {this.getCurrentYear()} Nexus 
                          <br/>
                          Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
                          <br/>    
                          The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
                          <br/>    
                          THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
                  </blockquote>
                  <br/>
                  
              </column>
            </row>
            <div style={{textAlign:"center"}}>
            <h2>Open Source Credits</h2>
              <dl>
                  <dt>Electron</dt>
                  <dt>React</dt>
                  <dd>< a href="https://reactjs.org/" > Reactjs.org </a> MIT License</dd>
                  <dt>Redux</dt>
                  <dd> <a href="https://redux.js.org/"> Redux.js.org </a> MIT License </dd>
                  <dt>Babel</dt>
                  <dd> <a href="https://babeljs.io/"> Babeljs.io </a> MIT License </dd>
                  <dd> <a href="https://electronjs.org/">electronjs.org </a> MIT License</dd>
                  <dt>Victory Chart</dt>
                  <dd> <a href="https://formidable.com/open-source/victory/"> Formidable Labs </a> MIT License</dd>
                  <dt>MaxMind</dt>
                  <dd>Copyright &copy; 2018 MaxMind, Inc. This work is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License. To view a copy of this license, visit <a href="http://creativecommons.org/licenses/by-sa/4.0/"> creativecommons.org </a>.
This database incorporates <a href="http://www.geonames.org">GeoNames</a> geographical data, which is made available under the Creative Commons Attribution 3.0 License. To view a copy of this license, visit <a href="http://www.creativecommons.org/licenses/by/3.0/us/">creativecommons.org</a> .</dd>
              </dl>
              </div>
          </div>
        );
    }

}

export default connect(
    mapStateToProps,
    mapDispatchToProps
  )(About);
  