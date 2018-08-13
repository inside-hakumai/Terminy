'use strict';

import '../sass/style.scss';
import {ipcRenderer, remote} from 'electron';

let riot = require('riot');
require('../tag/timers.tag');

$(document).ready(function(){
   ipcRenderer.on('ready-tasks', function(){
      ipcRenderer.send("task-request");
   });

   ipcRenderer.on('send-task', function(evt, tasks) {
      let windowHeight = tasks.length*98 + tasks.length-1;
      window.resizeTo(350, windowHeight);
      riot.mount('timers', {tasks: tasks});
   });
});

