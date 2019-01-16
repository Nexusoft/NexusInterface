import { remote } from 'electron';
import EventEmitter from 'events';

const autoUpdater = remote.getGlobal('autoUpdater');

class UpdaterState {
  current = 'idle';
  events = new EventEmitter();

  constructor() {
    autoUpdater.on('error', err => {
      this.updateState('idle');
    });
    autoUpdater.on('checking-for-update', () => {
      this.updateState('checking');
    });
    autoUpdater.on('update-available', () => {
      this.updateState('downloading');
    });
    autoUpdater.on('update-not-available', () => {
      this.updateState('idle');
    });
    autoUpdater.on('download-progress', () => {
      this.updateState('downloading');
    });
    autoUpdater.on('update-downloaded', () => {
      this.updateState('downloaded');
    });
  }

  updateState = newState => {
    if (this.current !== newState) {
      this.current = newState;
      this.events.emit('state-change', newState);
    }
  };
}

export default new UpdaterState();
