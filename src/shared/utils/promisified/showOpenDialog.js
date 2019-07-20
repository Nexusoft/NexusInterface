import { remote } from 'electron';

export default function showOpenDialog(options) {
  return new Promise(resolve => {
    remote.dialog.showOpenDialog(options, paths => {
      resolve(paths);
    });
  });
}
