/*
  Title: Network Globe
  Description: Creates the network globe for the overview.
  Last Modified by: Brian Smith
*/
// External Dependencies
import React, { Component } from 'react';
import { remote } from 'electron';
import path from 'path';
import styled from '@emotion/styled';

import maxmind from 'maxmind';
import Request from 'request';
import * as THREE from 'three';

// Internal Dependencies
import DAT from 'scripts/globe';
import * as RPC from 'scripts/rpc';
import configuration from 'api/configuration';

var glb;
var initializedWithData = false;
var preData;
let myIP = [];
const Globe = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
});

export default class NetworkGlobe extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    // console.log('Hello From the Network Globe Component!');
    this.props.handleOnLineRender(this.testRestartLines);
    // this.props.handleOnRemoveOldPoints(this.RemoveOldPointsAndReDraw); // casues issues
    this.props.handleOnAddData(this.updatePointsOnGlobe);
    this.props.handleRemoveAllPoints(this.removeAllPoints);
    const globeseries = [['peers', []]];
    let geoiplookup = '';
    if (process.env.NODE_ENV === 'development') {
      geoiplookup = maxmind.openSync(
        path.join(__dirname, 'GeoLite2-City', 'GeoLite2-City.mmdb')
      );
    } else {
      geoiplookup = maxmind.openSync(
        path.join(
          configuration.GetAppResourceDir(),
          'GeoLite2-City',
          'GeoLite2-City.mmdb'
        )
      );
    }

    let incomingPillarColor = this.props.pillarColor;
    let incomingArchColor = this.props.archColor;
    let globeOptions = {
      colorFn: function(x) {
        return new THREE.Color(incomingPillarColor);
      },
      colorArch: incomingArchColor,
      colorGlobe: this.props.globeColor,
    };
    glb = new DAT(this.threeRootElement, globeOptions);
    glb.animate();
    Request(
      {
        url: 'http://www.geoplugin.net/json.gp',
        json: true,
      },
      (error, response, body) => {
        // console.log(error, response, body)
        if (error) {
          console.log(error);
        } else {
          if (response !== undefined) {
            if (response.statusCode === 200) {
              // console.log(body);
              myIP = [
                parseFloat(body['geoplugin_latitude']),
                parseFloat(body['geoplugin_longitude']),
                ];
              if (preData)
              {
                glb.addData(preData[0][1], {
                  format: 'magnitude',
                  name: preData[0][0],
                });
                glb.createPoints();
                glb.playCurve();
                preData = null;
              }
              RPC.PROMISE('getpeerinfo', [])
                .then(payload => {
                  var tmp = {};
                  var ip = {};
                  let maxnodestoadd = payload.length;
                  if (maxnodestoadd > 20) {
                    maxnodestoadd = 20;
                  }
                  for (var i = 0; i < maxnodestoadd; i++) {
                    ip = payload[i].addr;
                    ip = ip.split(':')[0];
                    var tmp = geoiplookup.get(ip);
                    globeseries[0][1].push(tmp.location.latitude);
                    globeseries[0][1].push(tmp.location.longitude);
                    globeseries[0][1].push(0.1); //temporary magnitude.
                  }
                  myIP = [
                    parseFloat(body['geoplugin_latitude']),
                    parseFloat(body['geoplugin_longitude']),
                  ];

                  globeseries[0][1].push(
                    parseFloat(body['geoplugin_latitude'])
                  );
                  globeseries[0][1].push(
                    parseFloat(body['geoplugin_longitude'])
                  );
                  globeseries[0][1].push(0.1); //temporary magnitude.
                  // console.log(globeseries[0][1]);
                  //glb = new DAT(this.threeRootElement);
                  glb.addData(globeseries[0][1], {
                    format: 'magnitude',
                    name: globeseries[0][0],
                  });
                  preData = globeseries;
                  glb.createPoints();
                  //  Start the animations on the globe
                  initializedWithData = true;
                  //glb.animate();
                })
                .catch(e => {
                  globeseries[0][1].push(
                    parseFloat(body['geoplugin_latitude'])
                  );
                  globeseries[0][1].push(
                    parseFloat(body['geoplugin_longitude'])
                  );
                  globeseries[0][1].push(0.1); //temporary magnitude.
                  // console.log(globeseries[0][1]);
                  //glb = new DAT(this.threeRootElement);
                  glb.addData(globeseries[0][1], {
                    format: 'magnitude',
                    name: globeseries[0][0],
                  });
                  preData = globeseries;
                  glb.createPoints();
                  //  Start the animations on the globe
                  initializedWithData = true;
                  //glb.animate();
                });
            }
          }
        }
      }
    );
  }
  // React Method (Life cycle hook)
  componentWillUnmount() {
    this.threeRootElement.remove();
    glb.removePoints();
  }
  // Class Methods
  updatePointsOnGlobe() {
    const globeseries = [['peers', []]];
    let geoiplookup = '';

    if (process.env.NODE_ENV === 'development') {
      geoiplookup = maxmind.openSync(
        path.join(__dirname, 'GeoLite2-City', 'GeoLite2-City.mmdb')
      );
    } else {
      geoiplookup = maxmind.openSync(
        path.join(
          configuration.GetAppResourceDir(),
          'GeoLite2-City',
          'GeoLite2-City.mmdb'
        )
      );
    }
    console.log('update');
    RPC.PROMISE('getpeerinfo', []).then(payload => {
      var tmp = {};
      var ip = {};
      let maxnodestoadd = payload.length;
      if (maxnodestoadd > 20) {
        maxnodestoadd = 20;
      }
      for (var i = 0; i < maxnodestoadd; i++) {
        ip = payload[i].addr;
        ip = ip.split(':')[0];
        var tmp = geoiplookup.get(ip);
        globeseries[0][1].push(tmp.location.latitude);
        globeseries[0][1].push(tmp.location.longitude);
        globeseries[0][1].push(0.1); //temporary magnitude.
      }

      globeseries[0][1].push(myIP[0]);
      globeseries[0][1].push(myIP[1]);
      globeseries[0][1].push(0.1); //temporary magnitude.
      // console.log(myIP);
      if (myIP[1]) {
        glb.removePoints();
        glb.addData(globeseries[0][1], {
          format: 'magnitude',
          name: globeseries[0][0],
        });
        glb.createPoints();
      }
    });
  }

  testRestartLines() {
    if (glb != null && glb != undefined) {
      glb.playCurve();
    }
  }
  removeAllPoints() {
    if (glb == null || glb == undefined) {
      return;
    }
    glb.removePoints();
  }

  RemoveOldPointsAndReDraw() {
    if (glb == null || glb == undefined) {
      return;
    }

    glb.removePoints();
    //console.log("RemovedPoints");
    setTimeout(() => {
      glb.createPoints();
      //console.log("CreatedNewOnes");
    }, 1000);
  }

  getResourcesDirectory() {
    let appPath = remote.app.getAppPath();

    if (process.cwd() === appPath) return './';
    else return process.resourcesPath + '/';
  }

  // Mandatory React method
  render() {
    return (
      <Globe>
        <div ref={element => (this.threeRootElement = element)} />
      </Globe>
    );
  }
}
