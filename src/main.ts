const { app, BrowserWindow, protocol, Menu } = require('electron');
const path = require('path');
const ipc = require('electron').ipcMain;

app.whenReady().then(() => {
    //Menu.setApplicationMenu(null);

    const win = new BrowserWindow({
        minWidth: 1280,
        minHeight: 960,
        webPreferences: {
            devTools: true,//process.env.NODE_ENV !== 'production',
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
            useContentSize: true,
            enableRemoteModule: true
        }
    });

    protocol.interceptFileProtocol('app', (req: any, callback: any) => {
        const url = req.url.substr(6);
        callback(decodeURI(url));
    }, (error: any) => {
        if (error) {
            console.error('Failed to register protocol');
        }
    });

    win.loadFile(path.join(__dirname, '../index.html'));

    ipc.on("showHelpWindow", () => {
        let newWin = new BrowserWindow({
            minWidth: 800,
            minHeight: 600,
            webPreferences: {
                devTools: true,
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: false,
                useContentSize: true,
                enableRemoteModule: true
            }
        });

        newWin.loadFile(path.join(__dirname, '../help.html'));
    });
});