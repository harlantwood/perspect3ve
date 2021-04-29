require = require("esm")(module/*, options*/)
module.exports = require("./main.js")
const { app, BrowserWindow, ipcMain } = require('electron')
const express = require('express')
const ad4m = require('ad4m-executor')

function handleAppSignalCallback(signal) {
  console.log("Got signal inside communities app!", signal);
}

app.whenReady().then(() => {
  ad4m
  .init(
    app.getPath("appData"),
    __dirname,
    "./src/languages",
    [
      "languages",
      "agent-profiles",
      "shared-perspectives",
      "ipfs-links",
      "note-ipfs"
    ],
    handleAppSignalCallback
  )
  .then((ad4mCore) => {
    console.log(
      "\x1b[36m%s\x1b[0m",
      "Starting account creation splash screen"
    );

    const splash = createSplash()
    ad4mCore.waitForAgent().then(() => {
      console.log(
        "\x1b[36m%s\x1b[0m",
        "Agent has been init'd. Controllers now starting init..."
      );
      ad4mCore.initControllers();
      console.log("\x1b[32m", "Controllers init complete!");

      createWindow()
      splash.close()
    });
  });

})

function createSplash () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    minimizable: false,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
  })

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/public/splash.html`)

  // Open the DevTools.
  //win.webContents.openDevTools()

  return win
}

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    }
  })

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/public/index.html`)

  // Open the DevTools.
  win.webContents.openDevTools()

  return win
}

function serveUI() {
  const expressApp = express()
  expressApp.use(express.static(`${__dirname}/public`))
  expressApp.listen(9090)
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

serveUI()