//
// Automatic Updates
// ------------------
//

var UPDATES = UPDATES || {};

UPDATES.ipcRenderer = UPDATES.ipcRenderer || require('electron').ipcRenderer;
UPDATES.remote = UPDATES.remote || require('electron').remote;

//
// updateAvailable: Show the update panel and let the user know there are updates available, with buttons to download or ignore
//

UPDATES.updateAvailable = function () {
			
  let update = document.getElementById('update-container');
  let available = document.getElementById('update-available');

  update.classList.add("show");
  available.classList.add("show");

}

//
// updateCancel: Hide the update panel once a user clicks to ignore the update
//

UPDATES.updateCancel = function () {

  let update = document.getElementById('update-container');
  let available = document.getElementById('update-available');
  let downloading = document.getElementById('update-downloading');
  let complete = document.getElementById('update-download-complete');

  update.classList.remove("show");
  available.classList.remove("show");
  downloading.classList.remove("show");
  complete.classList.remove("show");

}

//
// updateDownload: Show the download progress panel and let the main process know to begin downloading the update
//

UPDATES.updateDownload = function () {

  let available = document.getElementById('update-available');
  let downloading = document.getElementById('update-downloading');

  available.classList.remove("show");
  downloading.classList.add("show");

  UPDATES.ipcRenderer.send('update-download');

}

//
// updateManual: If automatic download is not supported notify the user that we have opened a window to manually download and install
//

UPDATES.updateManual = function () {

  let downloading = document.getElementById('update-downloading');
  let manual = document.getElementById('update-manual');

  downloading.classList.remove("show");
  manual.classList.add("show");

  require('electron').shell.openExternal('https://nexusearth.com/wallet');

}

//
// updateDownloadComplete: Show the download complete panel which informs the user to restart the application for the update to be applied
//

UPDATES.updateDownloadComplete = function () {

  let downloading = document.getElementById('update-downloading');
  let complete = document.getElementById('update-download-complete');

  downloading.classList.remove("show");
  complete.classList.add("show");

}

//
// updateRestart: Signal to the application to quit and install the update
//

UPDATES.updateRestart = function () {

  UPDATES.ipcRenderer.send('update-quit-and-install');

}

//
// updateError: This happens when an update cannot be downloaded automatically for a platform, in this case redirect the user to the wallet download page
//

UPDATES.updateError = function (err) {

  //
  // TODO: This likely needs checks for platform-level systems like APT (.deb), SNAP (.snap), or others that auto update with system updates
  //
  // if (process.platform === "linux" && process.env.SNAP) ........

  // if the package image doesn't support updating then open the link to the website to download the newest version
  if (err.code && err.code === "ERR_UPDATER_OLD_FILE_NOT_FOUND") {

    UPDATES.updateManual();

  }
  else {

    console.debug("Logging auto update error object:");
    console.debug(err);

  }

}

//
// updateDownloadProgress: Update the download progress bar and statistics when receiving this event from the application
//

UPDATES.updateDownloadProgress = function (progress) {

  let progressBar = document.getElementById('download-progress-bar');
  let speed = document.getElementById('download-speed');
  let total = document.getElementById('download-total');

  progressBar.style.width = progress.percent.toFixed(0) + "%";
  speed.innerHTML = "Transfer Speed: " + UPDATES.formatFileSize(progress.bytesPerSecond, 1) + "/s";
  total.innerHTML = "Received: " + UPDATES.formatFileSize(progress.transferred, 1) + " of " + UPDATES.formatFileSize(progress.total, 1);

}

//
// formatFileSize: Utility to format bytes as KB/MB/GB/TB/etc with optional decimal point precision
//

UPDATES.formatFileSize = function (bytes,decimalPoint) {

  if(bytes == 0)
    return '0 Bytes';

  var k = 1000,
    dm = decimalPoint || 2,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];

}

//
// Update Events: These are fired from the main application index.js to communicate update events with the UI layer
//

UPDATES.ipcRenderer.on('update-checking', function(event, text) {

  console.log("Checking for application updates");
  
})

UPDATES.ipcRenderer.on('update-available', function(event, text) {

  UPDATES.updateAvailable();
  
})

UPDATES.ipcRenderer.on('update-not-available', function(event, text) {

  console.log("No application update available");
  
})

UPDATES.ipcRenderer.on('update-download-progress', function(event, progress) {

  UPDATES.updateDownloadProgress(progress);

})

UPDATES.ipcRenderer.on('update-downloaded', function(event, text) {

  UPDATES.updateDownloadComplete();

})

UPDATES.ipcRenderer.on('update-error', function(event, text) {
  
  if (text.description)
    UPDATES.updateError(text.description);
  else
    UPDATES.updateError(text);

})