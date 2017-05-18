'use strict';

window.jquery = window.$ = require('jquery');
let main = window.require('electron').remote.require('./main');
let riot = require('riot');
require('../tag/timers.tag');
let tasks = [];

$(document).ready(function(){
   window.require('electron').ipcRenderer.on('ready-tasks', function(){
      let tasks = main.getTasks();
      let windowHeight = tasks.length*98 + tasks.length-1;
      window.resizeTo(350, windowHeight);
      riot.mount('timers', {tasks: tasks});
   });
});