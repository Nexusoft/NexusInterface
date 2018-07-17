import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";

export default class SecurityLogin extends Component {
  render() {
    return (

      <div id="securitylogin">

        <div id="securitylogin-container">

	        <h2>Security Login</h2>

	        <div className="panel">

            <p>
              Login for security module. Note to future self break this into 3
              modules on a secured route.
            </p>

          </div>

        </div>

      </div>

    );
  }
}
