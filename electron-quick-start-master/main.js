// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const { dialog } = require('electron')

function createWindow () {

  //process check if any progress runs in the platform
   
  const exec = require('child_process').exec;
  const isRunning = (query, cb) => {
      let platform = process.platform;
      let cmd = '';
      switch (platform) {
          case 'win32' : cmd = `tasklist`; break;
          case 'darwin' : cmd = `ps -ax | grep ${query}`; break;
          case 'linux' : cmd = `ps -A`; break;
          default: break;
      }
      exec(cmd, (err, stdout, stderr) => {
          cb(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
      });
  }
  
  //PccNTMon.exe check before open up the app in Window
  let nameOfProcessRunning = 'mike.exe' 

  //PccNTMon check before open up the app in Mac
  if (process.platform !== 'darwin') {
    let nameOfProcessRunning = 'mike' 
  }

  isRunning(nameOfProcessRunning, (status) => {
    console.log('PccNTMon-running in CreateWindows', status)//true/false

    //if true, run application
    if(status==true){   

      // Create the browser window.
      const mainWindow = new BrowserWindow({
        width: 1024,
        height: 650,
        webPreferences: {
          preload: path.join(__dirname, 'preload.js')
        }
      })

      // and load the index.html of the app.
      //mainWindow.loadFile('index.html')
      mainWindow.loadURL('https://www.google.com/') 

      // Open the DevTools.
      mainWindow.webContents.openDevTools()

      //set progressbar on icon in the dock
      //mainWindow.setProgressBar(1.0)

    }else{
      //shut down the app
      dialog.showErrorBox('Error', 'No Open Today Mate')      
      console.log('app exit')
      app.exit(0)
    }
  })
  
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
