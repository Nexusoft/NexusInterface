import fs from 'fs';
import path from 'path';

import store from 'store';
import { coreDataDir } from 'consts/paths';
import { Tail } from 'utils/tail';
import * as ac from 'actions/setupApp';

var tail;
var debugFileLocation;
var checkIfFileExistsInterval;
var printCoreOutputTimer;

export function startCoreOuputWatch() {
  if (store.getState().settings.manualDaemon) {
    return;
  }
  let datadir = coreDataDir;

  var debugfile;
  if (fs.existsSync(path.join(datadir, 'log', '0.log'))) {
    debugfile = path.join(datadir, 'log', '0.log');
  } else if (process.platform === 'win32') {
    debugfile = datadir + '\\debug.log';
  } else {
    debugfile = datadir + '/debug.log';
  }

  debugFileLocation = debugfile;

  fs.stat(debugFileLocation, (err, stat) => {
    checkDebugFileExists(err, stat);
  });

  checkIfFileExistsInterval = setInterval(() => {
    if (tail != undefined) {
      clearInterval(checkIfFileExistsInterval);
      return;
    }
    fs.stat(debugFileLocation, (err, stat) => {
      checkDebugFileExists(err, stat);
    });
  }, 5000);
}

export function stopCoreOuputWatch() {
  if (tail != undefined) {
    tail.unwatch();
  }
  clearInterval(printCoreOutputTimer);
  clearInterval(checkIfFileExistsInterval);
}

function checkDebugFileExists(err, stat) {
  if (err == null) {
    processDeamonOutput(debugFileLocation);
    clearInterval(checkIfFileExistsInterval);
  } else {
    console.log('exists', stat);
  }
}

function processDeamonOutput(debugfile) {
  const tailOptions = {
    useWatchFile: true,
  };
  tail = new Tail(debugfile, tailOptions);
  let n = 0;
  let batch = [];
  tail.on('line', d => {
    batch.push(d);
  });
  printCoreOutputTimer = setInterval(() => {
    if (store.getState().ui.console.core.paused) {
      return;
    }
    if (batch.length == 0) {
      return;
    }
    store.dispatch(ac.printCoreOutput(batch));
    batch = [];
  }, 1000);
}
