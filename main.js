const {app, Menu, BrowserWindow} = require('electron');
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

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// A window for dialog to create new task
let dialogWindow;

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
      pathname: path.join(__dirname, '/public/index.html'),
      protocol: 'file:',
      slashes: true
   }));

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
app.on('ready', function() {
   createWindow();
   createMenu();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
   // On macOS it is common for applications and their menu bar
   // to stay active until the user quits explicitly with Cmd + Q
   if (process.platform !== 'darwin') {
   app.quit()
}
});

app.on('activate', () => {
   // On macOS it's common to re-create a window in the app when the
   // dock icon is clicked and there are no other windows open.
   if (win === null) {
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

      let configData;

      if (Object.keys(data).length === 0){
         configData = getInitialConfig();
         storage.set('config', configData, function(error){
            if (error) throw error;
         });
      } else {
         configData = data;
      }

      taskData = initializeTaskData(configData.savePath);

      win.webContents.on('did-finish-load', function() {
         win.webContents.send('ready-tasks');
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
      if (err.code == 'ENOENT') {
         let sampleDate = moment().add(1, 'day');
         csvString = '"taskName","year","month","day","hour","minute","isDone"\n' +
            '"Sample Task",' + sampleDate.format("YYYY") + ',' + sampleDate.format('M') + ',' + sampleDate.format('D') + ',' + sampleDate.format('H') + ',' + sampleDate.format('m') + ',"false"';
      } else {
         throw err;
      }
   }
   let csvArray = parse(csvString);
   csvArray.shift(); // delete header row
   for(let i = 0; i < csvArray.length; i++){
      let arr = csvArray[i];
      if (arr[6] === 'false') {
         tasks.push({
            detail: arr[0],
            deadline: moment(new Date(arr[1], arr[2]-1, arr[3], arr[4], arr[5]))
         });
      }
   }

   return tasks;
}

/**
 * RendererProcess側でタスクのデータを取得するための関数
 * @returns {Array} タスクを保持する配列、タスクが存在しない場合は空の配列を返す
 */
exports.getTasks = function(){
   return taskData;
};

/**
 * タスクを新規作成するダイアログを作成する
 */
function createNewTaskDialog() {
   // Create the browser window.
   dialogWindow = new BrowserWindow({
      width: 500,
      height: 600,
      frame: true,
      resizable: false,
      center: true,
      hasShadow: false,
      transparent: false
   });

   // and load the newTask.html of the app.
   dialogWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'public/newtask.html'),
      protocol: 'file:',
      slashes: true
   }));

   // Open the DevTools.
   dialogWindow.webContents.openDevTools();

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
      detail: detail,
      deadline: parsedDeadline
   });
};

/**
 * アプリケーションをリロードする
 */
exports.reload = function(){
   dialogWindow.close();
   win.reload();
};


/****************************/
/*********** Menu ***********/

function createMenu() {

   const templeteMenu = [
      {
         label: app.getName(),
         submenu: [
            {role: 'about'},
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
         label: 'Edit',
         submenu: [
            {
               label: 'Create new task',
               accelerator: 'Command+N',
               click: function() { createNewTaskDialog(); }
            },
            {label: 'Cancel task'},
            {label: 'Finish task'}
         ]
      },
      {
         label: 'View',
         submenu: [
            {
               label: 'Reload',
               accelerator: 'Command+R',
               click: function() { win.reload(); }
            },
            {
               label: 'Toggle Developer Tools',
               accelerator: 'Alt+Command+I',
               click: function() { win.toggleDevTools(); }
            },
         ]
      }
   ];

   const menu = Menu.buildFromTemplate(templeteMenu);
   Menu.setApplicationMenu(menu);
}