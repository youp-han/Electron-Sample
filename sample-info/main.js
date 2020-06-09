//handle setupevents as quickly as possible
const setupEvents = require('./installers/setupEvents')
if (setupEvents.handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, dialog, shell, autoUpdater, session} = require('electron');
const isDev = require('electron-is-dev');
const log = require('electron-log');
const path = require('path');
//menuTemplate
const menuTemplate = releaseMenu();

//Edge related variables
var edge = require('electron-edge-js');
var isProcessRunning = edge.func('resources/Verification.dll'); //FalseTestVerification, //Verification

let mainWindow;
let securityCheck = false;


app.on('ready', function(){

  //보안 확인, 리턴값으로, securityCheck 값 수정
  CheckSecurity();

  if (securityCheck === true) {
    createWindow();
  }
  else {
    dialog.showErrorBox('Warning', '보안프로그램이 설치되어 있지 않은 환경에서는 사용이 금지되어 있습니다.');
    app.exit(0);
  }
 
  //download 후 파일 오픈
  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    // Set the save path, making Electron not to prompt a save dialog.    
    item.setSavePath(`C:\\Temp\\eDrive\\${item.getFilename()}`);
    //whenDownloding(item);
    whenDownloadingDone(item);
  });

});



// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  //if (BrowserWindow.getAllWindows().length === 0) createWindow()
});


//Check if in Dev Environment and proceed

if (isDev) {
  //in Dev Mode Only
  console.log('Running in development');
  //show "VIEW" Menu
  devMenu();

} else {
  //in Production Mode Only
  console.log('Running in production');


  //auto update check
  const server = 'http://localhost';
  //process.platform= win32 
  //app.getVersion()= 0.0.1
  //feed = http://localhost/update/win32/0.0.1
  const feed = `${server}/update/${process.platform}/${app.getVersion()}`;

  autoUpdater.setFeedURL(feed);
  log.info('initiating version check');
  log.info('feed:=', feed);

  autoUpdater.checkForUpdates();
  //setInterval(() => {    
  //  
  //}, 6000); 
  // 1000 = 1s, 60s

  autoUpdater.on('checking-for-update', () =>{
    log.info('checking-for-update');
  });

  autoUpdater.on('update-available', ()=>{
    log.info('update-available');
  })

  autoUpdater.on('update-not-available', () => {    
    log.info('update-not-available');
  });

  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    log.info('update-download');
    const dialogOpts = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: '새로운 버전이 다운로드 되었습니다. 업데이트를 적용하기 위해 앱을 재시작하세요.'
    };
  
    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall();
    });
  });

  autoUpdater.on('error', message => {
    log.error('error-on-update');    
    log.error(message);
  });

};

//화면 생성
function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1281,
    height: 800,
    minWidth: 1281,
    minHeight: 800,
    icon: path.join(__dirname, 'assets/icons/png/64x64.png'),
    show:false,
    webPreferences: {
      //preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      //slashes: true
    }
  });

  loadURL();   
  setMenu();   

  mainWindow.once('ready-to-show', ()=> {
    mainWindow.show();
  });
  
  mainWindow.on('closed', () => app.quit());   
    //set progressbar on icon in the dock
  //mainWindow.setProgressBar(1.0)
};


//메뉴 생성
function setMenu() {
  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);
}

//release 시 메뉴
function releaseMenu() {
  return [
    {
      label: 'File',
      submenu: [
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
          click() {
            app.quit();
          }
        }
      ]
    }
  ];
}

//dev 시 메뉴
function devMenu(){
  return[
    menuTemplate.push({
      label: 'View',
      submenu:[
          {   role:'reload' },
          {
              label: 'Toggle Developer Tools',
              accelerator: process.platform === 'darwin' ? 'Command+Alt+I' : 'Ctrl+Shift+I',
              click(item, focusedWindow){
                  focusedWindow.toggleDevTools();
              }
          }
      ]
    })
  ];
}

//로드 화면 URL
function loadURL() {
  let nameOfURL = 'https://google.com';
  
  if (isDev) {    
    nameOfURL = 'https://google.com';
    mainWindow.webContents.openDevTools();
  }  
  // and load the index.html of the app.
  //mainWindow.loadFile('index.html')    
  mainWindow.loadURL(nameOfURL);
}

//보안 확인
function CheckSecurity() {
  isProcessRunning(' ', function (error, result) {
    if (error) throw error;
    securityCheck = result;
    log.info("securityCheck =", result);
  });  
}

//다운로드 완료 시
function whenDownloadingDone(item) {
  item.once('done', (event, state) => {
    if (state === 'completed') {
      console.log(`Download: Successful: ${item.getFilename()}`);
      //Open the document using the external application
      shell.openItem(item.getSavePath());
    }
    else {
      console.log(`Download failed: ${state}`);
    }
  });
}

//다운로딩 중 - 사용여부 미정
function whenDownloding(item) {
  item.on('updated', (event, state) => {
    if (state === 'interrupted') {
      console.log('Download is interrupted but can be resumed');
    }
    else if (state === 'progressing') {
      if (item.isPaused()) {
        console.log('Download is paused');
      }
      else {
        console.log(`Received bytes: ${item.getReceivedBytes()}`);
      }
    }
  });
}

