const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'renderer/renderer.js')
    }
  });

  win.loadFile('renderer/index.html');
}

app.whenReady().then(createWindow);