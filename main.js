const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

const storage = require('electron-json-storage');
const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const moment = require('moment');

const APP_NAME = 'DLWatcher';
const APP_NAME_LCASE = 'dlwatcher';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow () {
   // Create the browser window.
   win = new BrowserWindow({
      width: 350,
      height: 108,
      frame: false,
      resizable: false,
      center: false,
      hasShadow: false,
      transparent: true
   });

   // and load the index.html of the app.
   win.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
   }))

   // Open the DevTools.
   // win.webContents.openDevTools()

   // Emitted when the window is closed.
   win.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      win = null
   })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
   // On macOS it is common for applications and their menu bar
   // to stay active until the user quits explicitly with Cmd + Q
   if (process.platform !== 'darwin') {
   app.quit()
}
})

app.on('activate', () => {
   // On macOS it's common to re-create a window in the app when the
   // dock icon is clicked and there are no other windows open.
   if (win === null) {
   createWindow()
}
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

app.on('ready', loadConfig);

function loadConfig(){
   storage.get('config', function(error, data) {
      if (error) throw error;

      let configData;

      if (Object.keys(data).length === 0){
         configData = getInitialConfig();
         storage.set('config', configData, function(error){
            if (error) throw error;
         });
      } else {
         configData = data;
      }
      console.log(configData.savePath);
      console.log(initializeTaskData(data.savePath));
   });
}

function getInitialConfig(){
   return {
      'savePath': app.getPath('home') + '/.' + APP_NAME_LCASE + '/tasks.csv'
   }
}

function initializeTaskData(filePath){
   let tasks = [];

   fs.readFile(filePath, 'utf8', function(err, data){
      if (err) throw err;

      let poutput = parse(data);
      poutput.shift(); // delete header row
      tasks = [];
      for(let i = 0; i < poutput.length; i++){
         let arr = poutput[i];
         if (arr[6] === 'false') {
            tasks.push({
               detail: arr[0],
               deadline: moment(new Date(arr[1], arr[2], arr[3], arr[4], arr[5]))
            });
         }
      }
      /*
      parse(data, function(perr, poutput){
         if (perr) throw perr;

         poutput.shift(); // delete header row
         tasks = [];
         for(let i = 0; i < poutput.length; i++){
            let arr = poutput[i];
            if (arr[6] === 'false') {
               tasks.push({
                  detail: arr[0],
                  deadline: moment(new Date(arr[1], arr[2], arr[3], arr[4], arr[5]))
               });
            }
            console.log(tasks);
         }
         console.log(tasks);
      });
      console.log(tasks);
      */
   });

   console.log(tasks);
   return tasks;
}