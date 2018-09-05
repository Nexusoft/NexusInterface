import React, { Component } from "react";
import styles from "./style.css";
import DAT from "../../script/globe";
import * as RPC from "../../script/rpc";
import maxmind from "maxmind";
import Request from "request";

var glb;

export default class NetworkGlobe extends Component {
  componentDidMount() {
    this.props.handleOnLineRender(this.testRestartLines);
    this.props.handleOnRemoveOldPoints(this.RemoveOldPointsAndReDraw);
    const globeseries = [["peers", []]];
    const geoiplookup = maxmind.openSync(
      "app/GeoLite2-City_20180403/GeoLite2-City.mmdb"
    );
    let myIP = "";
    glb = new DAT(this.threeRootElement);
    glb.animate();
    Request(
      {
        url: "http://www.geoplugin.net/json.gp",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          RPC.PROMISE("getpeerinfo", []).then(payload => {
            var tmp = {};
            var ip = {};
            let maxnodestoadd = payload.length;
            if (maxnodestoadd > 20) {
              maxnodestoadd = 20;
            }
            for (var i = 0; i < maxnodestoadd; i++) {
              ip = payload[i].addr;
              ip = ip.split(":")[0];
              var tmp = geoiplookup.get(ip);
              globeseries[0][1].push(tmp.location.latitude);
              globeseries[0][1].push(tmp.location.longitude);
              globeseries[0][1].push(0.1); //temporary magnitude.
            }

            globeseries[0][1].push(body["geoplugin_latitude"]);
            globeseries[0][1].push(body["geoplugin_longitude"]);
            globeseries[0][1].push(0.1); //temporary magnitude.

            //glb = new DAT(this.threeRootElement);
            glb.addData(globeseries[0][1], {
              format: "magnitude",
              name: globeseries[0][0]
            });
            glb.createPoints();
            //  Start the animations on the globe

            //glb.animate();
          });
        }
      }
    );
  }

  updatePointsOnGlobe() {
    const globeseries = [["peers", []]];
    const geoiplookup = maxmind.openSync(
      "app/GeoLite2-City_20180403/GeoLite2-City.mmdb"
    );
    let myIP = "";
    Request(
      {
        url: "http://www.geoplugin.net/json.gp",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          RPC.PROMISE("getpeerinfo", []).then(payload => {
            var tmp = {};
            var ip = {};
            let maxnodestoadd = payload.length;
            if (maxnodestoadd > 20) {
              maxnodestoadd = 20;
            }
            for (var i = 0; i < maxnodestoadd; i++) {
              ip = payload[i].addr;
              ip = ip.split(":")[0];
              var tmp = geoiplookup.get(ip);
              globeseries[0][1].push(tmp.location.latitude);
              globeseries[0][1].push(tmp.location.longitude);
              globeseries[0][1].push(0.1); //temporary magnitude.
            }

            globeseries[0][1].push(body["geoplugin_latitude"]);
            globeseries[0][1].push(body["geoplugin_longitude"]);
            globeseries[0][1].push(0.1); //temporary magnitude.

            glb = new DAT(this.threeRootElement);
            glb.removePoints();
            glb.addData(globeseries[0][1], {
              format: "magnitude",
              name: globeseries[0][0]
            });
            glb.createPoints();
          });
        }
      }
    );
  }

  testRestartLines() {
    console.log("ReDraw lines");
    if (glb != null && glb != undefined) {
      glb.playCurve();
    }
  }

  RemoveOldPointsAndReDraw() {
    if (glb == null || glb == undefined) {
      return;
    }
    glb.removePoints();

    setTimeout(() => {
      glb.createPoints();
    }, 1000);
  }

  componentWillUnmount() {
    this.threeRootElement.remove();
  }
  getResourcesDirectory() {
    let appPath = require("electron").remote.app.getAppPath();

    if (process.cwd() === appPath) return "./";
    else return process.resourcesPath + "/";
  }
  render() {
    return (
      <div id="nxs-earth" className="earth">
        <div ref={element => (this.threeRootElement = element)} />
      </div>
    );
  }
}
