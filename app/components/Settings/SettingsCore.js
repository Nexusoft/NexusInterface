import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";

export default class SettingsCore extends Component {
  render() {
    return (
      <section id="core">

        <div className="note">

                Changes to core settings will take effect the next time the core is restarted.

        </div>

        <form className="aligned">

          <div className="field">
            <label htmlFor="manualDaemon">Manual Daemon Mode</label>
            <input id="manualDaemon" type="checkbox" className="switch" onChange="updateManualDaemon(this)" data-tooltip="Enable manual daemon mode if you are running the daemon manually outside of the wallet"/>
          </div>

          <div id="manual-daemon-settings">

            <div className="field">
              <label htmlFor="manualDaemonUser" >Username</label>
              <input id="manualDaemonUser" type="text" size="12" onChange="updateManualDaemonUser(this)" data-tooltip="Username configured for manual daemon"/>
            </div>

            <div className="field">
              <label htmlFor="manualDaemonPassword" >Password</label>
              <input id="manualDaemonPassword" type="text" size="12" onChange="updateManualDaemonPassword(this)" data-tooltip="Password configured for manual daemon"/>
            </div>

            <div className="field">
              <label htmlFor="manualDaemonIP" >IP Address</label>
              <input id="manualDaemonIP" type="text" size="12" onChange="updateManualDaemonIP(this)" data-tooltip="IP address configured for manual daemon"/>
            </div>

            <div className="field">
              <label htmlFor="manualDaemonPort">Port</label>
              <input id="manualDaemonPort" type="text" size="3" onChange="updateManualDaemonPort(this)" data-tooltip="Port configured for manual daemon"/>
            </div>
          
          </div>

          <div id="automatic-daemon-settings">

            <div className="field">
              <label htmlFor="mapPortUsingUpnp">Map port using UPnP</label>
              <input id="mapPortUsingUpnp" type="checkbox" className="switch" onChange="updateMapPortUsingUpnp(this)" data-tooltip="Automatically open the Nexus client port on the router. This only works when your router supports UPnP and it is enabled."/>
            </div>

            <div className="field">
              <label htmlFor="socks4Proxy">Connect through SOCKS4 proxy</label>
              <input id="socks4Proxy" type="checkbox" className="switch" onChange="updateSocks4Proxy(this)" data-tooltip="Connect to Nexus through a SOCKS4 proxt (e.g. when connecting through Tor"/>
            </div>

            <div className="field">
              <label htmlFor="socks4ProxyIP">Proxy IP Address</label>
              <input id="socks4ProxyIP" type="text" size="12" onChange="updateSocks4ProxyIP(this)" data-tooltip="IP Address of SOCKS4 proxy server"/>
            </div>

            <div className="field">
              <label htmlFor="socks4ProxyPort">Proxy Port</label>
              <input id="socks4ProxyPort" type="text" size="3" onChange="updateSocks4ProxyPort(this)" data-tooltip="Port of SOCKS4 proxy server"/>
            </div>

            <div className="field">
              <label htmlFor="detatchDatabaseOnShutdown">Detach database on shutdown</label>
              <input id="detatchDatabaseOnShutdown" type="checkbox" className="switch" onChange="updateDetatchDatabaseOnShutdown(this)" data-tooltip="Detatch the database when shutting down the wallet"/>
            </div>

            <div className="field">
              <label htmlFor="optionalTransactionFee">Optional transaction fee (in NXS)</label>
              <input id="optionalTransactionFee" type="text" size="6" onChange="updateOptionalTransactionFee(this)" data-tooltip="Optional transaction fee to include on transactions. Higher amounts will allow transactions to be processed faster, lower may cause additional transaction processing"/>
            </div>

          </div>

          <div className="clear-both"></div>

        </form>

      <button className="button primary" onclick="application.restart();">Restart Core</button>


      </section>

    );
  }
}
