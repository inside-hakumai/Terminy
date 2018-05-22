/// <reference path="../../typings/index.d.ts" />

const electron = require('electron');

const ipcMain = electron.ipcMain;

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const Menu = electron.Menu;

const path = require('path');
const url = require('url');

const storage = require('electron-json-storage');
const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const moment = require('moment');

const APP_NAME = 'Terminy';
const APP_NAME_LCASE = 'terminy';

// タスクの情報
let taskData;
let taskIdHead;

// JSON config data
let config;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// A window for dialog to create new task
let dialogWindow = null;
// A window for preferences
let preferenceWindow = null;

// store BrowserWindow object of currently focused window
let focusedWindow = null;

function createWindow() {
   // Create the browser window.
   mainWindow = new BrowserWindow({
      width: 350,
      height: 108,
      frame: false,
      resizable: false,
      center: false,
      hasShadow: false,
      transparent: true,
   });

   // and load the index.html of the app.
   mainWindow.loadURL(`file://${__dirname}/../renderer/index.html`);

   // Open the DevTools.
   // mainWindow.webContents.openDevTools()

   mainWindow.on('focus', () => {
      focusedWindow = mainWindow;
   });   mainWindow.loadURL(`file://${__dirname}/../renderer/index.html`);

   // Emitted when the window is closed.
   mainWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null
   })

   ipcMain.on('task-request', (event, arg) => {
      event.sender.send('send-task', getTasks());
   })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
   createWindow();
   createMenu();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
   // On OS X it is common for applications and their menu bar
   // to stay active until the user quits explicitly with Cmd + Q
   if (process.platform !== 'darwin') {
      app.quit()
   }
});

app.on('activate', function () {
   // On OS X it's common to re-create a window in the app when the
   // dock icon is clicked and there are no other windows open.
   if (mainWindow === null) {
      createWindow()
   }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

app.on('ready', loadConfig);

/**
 * 設定とタスクのデータをロードする
 * ロード完了後、RendererProcess側の'did-finish-load'イベントを受けてメッセージを送る
 */
function loadConfig(){
   storage.get('config', function(error, data) {
      if (error) throw error;

      if (Object.keys(data).length === 0){
         config = getInitialConfig();
         storage.set('config', config, function(error){
            if (error) throw error;
         });
      } else {
         config = data;
      }

      taskData = initializeTaskData(config.savePath);

      mainWindow.webContents.on('did-finish-load', function() {
         mainWindow.webContents.send('ready-tasks');
      });
   });
}

/**
 * 初期設定のJSONを返す
 * @returns {{savePath: string}} 初期設定のJSON
 */
function getInitialConfig(){
   return {
      'savePath': app.getPath('home') + '/.' + APP_NAME_LCASE + '/tasks.csv'
   }
}

/**
 * タスクデータをファイルから取得する
 * @param filePath タスクデータを記録したファイルのパス
 * @returns {Array} タスクを保持する配列、タスクが存在しない場合は空の配列を返す
 */
function initializeTaskData(filePath){
   let tasks = [];

   let csvString;
   try {
      csvString = fs.readFileSync(filePath, 'utf8');
   } catch(err) {
      if (err.code === 'ENOENT') {
         let sampleDate = moment().add(1, 'day');
         csvString = '"id","taskName","year","month","day","hour","minute","isDone"\n' +
            '0,"Sample Task",' + sampleDate.format("YYYY") + ',' + sampleDate.format('M') + ',' + sampleDate.format('D') + ',' + sampleDate.format('H') + ',' + sampleDate.format('m') + ',"false"';
         taskIdHead = 0;
      } else {
         throw err;
      }
   }
   let csvArray = parse(csvString);
   csvArray.shift(); // delete header row
   for(let i = 0; i < csvArray.length; i++){
      let arr = csvArray[i];
      if (arr[7] === 'false') {
         tasks.push({
            id: arr[0],
            detail: arr[1],
            deadline: moment(new Date(arr[2], arr[3]-1, arr[4], arr[5], arr[6])).toDate()
         });
         taskIdHead = parseInt(arr[0]);
      }
   }

   return tasks;
}

/**
 * RendererProcess側でタスクのデータを取得するための関数
 * @returns {Array} タスクを保持する配列、タスクが存在しない場合は空の配列を返す
 */
function getTasks(){
   return taskData;
}

exports.getConfig = function(key = null){
   if (key) {
      return config[key];
   } else {
      return config;
   }
};

/**
 * タスクを新規作成するダイアログを作成する
 */
function createNewTaskDialog() {

   if (dialogWindow !== null){
      console.info('Two dialogs can\'t be created at a time.');
      return;
   }

   // Create the browser window.
   dialogWindow = new BrowserWindow({
      width: 500,
      height: 600,
      frame: true,
      resizable: false,
      center: true,
      hasShadow: true,
      transparent: false
   });

   // and load the newTask.html of the app.
   dialogWindow.loadURL(`file://${__dirname}/../renderer/newtask.html`);

   // Open the DevTools.
   dialogWindow.webContents.openDevTools();

   dialogWindow.on('focus', () => {
      focusedWindow = dialogWindow;
   });

   // Emitted when the window is closed.
   dialogWindow.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      dialogWindow = null;
   });
}

/**
 * タスクを新規に追加する
 * @param detail 詳細の文字列
 * @param deadline 締め切りの日付・時刻の文字列
 */
exports.addNewTask = function(detail, deadline){
   if (typeof detail !== 'string'){
      throw new TypeError('The detail is not string');
   } else if (detail === '') {
      throw new Error('detail is empty')
   }

   let parsedDeadline = moment(deadline);
   if (!parsedDeadline.isValid()){
      throw new TypeError('Format of the deadline is invalid');
   }

   taskData.push({
      id: ++taskIdHead,
      detail: detail,
      deadline: parsedDeadline
   });
};

/**
 * 設定画面を作成する
 */
function createPrefrenceWindow(){
   if (preferenceWindow !== null){
      console.info('Two dialogs can\'t be created at a time.');
      return;
   }

   // Create the browser window.
   preferenceWindow = new BrowserWindow({
      width: 750,
      height: 600,
      frame: true,
      resizable: true,
      center: true,
      hasShadow: true,
      transparent: false
   });

   // and load the newTask.html of the app.
   preferenceWindow.loadURL(path.join(__dirname, 'public/preferences.html'));

   preferenceWindow.on('focus', () => {
      focusedWindow = preferenceWindow;
   });
   focusedWindow = preferenceWindow;

   // Emitted when the window is closed.
   preferenceWindow.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      preferenceWindow = null;
   });

}

/**
 * アプリケーションをリロードする
 */
exports.reload = function(){
   dialogWindow.close();
   mainWindow.reload();
};

/**
 * タスクデータをファイルに保存する
 */
function saveTask(){
   let writeString = '"id","taskName","year","month","day","hour","minute","isDone"\n';
   console.log(taskData);
   for (let i = 0; i < taskData.length; i++){
      writeString += [
         taskData[i].id,
         '"' + taskData[i].detail.replace('"', '""') + '"',
         taskData[i].deadline.format('YYYY'),
         taskData[i].deadline.format('M'),
         taskData[i].deadline.format('D'),
         taskData[i].deadline.format('H'),
         taskData[i].deadline.format('m'),
         '"false"'].join(',') + '\n'
   }
   fs.writeFile(config.savePath, writeString);
}


/****************************/
/*********** Menu ***********/

function createMenu() {

   const templeteMenu = [
      {
         label: app.getName(),
         submenu: [
            {role: 'about'},
            {type: 'separator'},
            {
               label: 'Preferences',
               accelerator: 'Command+,',
               click: function() { createPrefrenceWindow(); }
            },
            {type: 'separator'},
            {role: 'services', submenu: []},
            {type: 'separator'},
            {role: 'hide'},
            {role: 'hideothers'},
            {role: 'unhide'},
            {type: 'separator'},
            {role: 'quit'}
         ]
      },
      {
         label: 'File',
         submenu: [
            {
               label: 'Create new task',
               accelerator: 'Command+N',
               click: function() { createNewTaskDialog(); }
            },
            {type: 'separator'},
            {label: 'Cancel task'},
            {label: 'Finish task'},
            {type: 'separator'},
            {
               label: 'Save',
               accelerator: 'Command+S',
               click: function() { saveTask(); }
            },
            {
               label: 'Auto save(unimplemented)',
               enabled: 'false'
            }

         ]
      },
      {
         label: 'View',
         submenu: [
            {
               label: 'Reload',
               accelerator: 'Command+R',
               click: function() { mainWindow.reload(); }
            },
            {
               label: 'Toggle Developer Tools',
               accelerator: 'Alt+Command+I',
               click: function() { focusedWindow.toggleDevTools(); }
            },
         ]
      }
   ];

   const menu = Menu.buildFromTemplate(templeteMenu);
   Menu.setApplicationMenu(menu);
}