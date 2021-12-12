const { app, BrowserWindow, protocol, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
import $ from 'jquery';

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
            //useContentSize: true,
            //enableRemoteModule: true
        }
    });

    protocol.interceptFileProtocol('app', (req: any, callback: any) => {
        const url = req.url.substr(6);
        callback(decodeURI(url));
    });

    win.loadFile(path.join(__dirname, '../index.html'));

    ipcMain.on("showDialogWindow", (event: any, arg: any) => {
        dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'CA|KEY', extensions: ['crt', 'key', 'pem', 'jks', 'der', 'cer', 'pfx'] }]
        }).then((r: any) => {

            let d = {
                ...r,
                elem: arg
            };

            event.reply('openFileResult', d);
        });
    });
});