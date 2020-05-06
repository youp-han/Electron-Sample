const electron = require('electron');
const {app, BrowserWindow, Menu, ipcMain } = electron;


let mainWindow;
let addWindow;

app.on('ready', ()=>{
    mainWindow = new BrowserWindow({
        webPreferences:{
            nodeIntegration: true
        }

    });
    mainWindow.loadURL(`file://${__dirname}/main.html`);

    // when main window closes, all windows that belongs to the app closes as well.
    mainWindow.on('closed', () => app.quit()); 

    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

function createAddWindow(){
    addWindow = new BrowserWindow({
        width: 400,
        height: 200,
        title: 'Add New Todo',
        webPreferences:{
            nodeIntegration: true
        }
    });
    addWindow.loadURL(`file://${__dirname}/add.html`);

    //garbage collection
    addWindow.on('closed', () => addWindow = null);
}


ipcMain.on('todo:add', (event, todo) => {
    mainWindow.webContents.send('todo:add', todo);
    addWindow.close();
});



const menuTemplate = [   
    {
        label: 'File',
        submenu:[
            { 
                label: 'Add Todo',
                accelerator: process.platform === 'darwin' ? 'Command+N' : 'Ctrl+N',
                click(){
                    createAddWindow();
                }
            },
            { 
                label: 'Quit',
                accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

if(process.platform==='darwin'){
    menuTemplate.unshift({});
}

if(process.env.NODE_ENV !== 'production' ){
    //'production'
    //'development'
    //'staging'
    //'test'
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
    });
}
