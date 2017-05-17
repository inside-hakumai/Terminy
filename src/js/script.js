'use strict';

window.jquery = window.$ = require('jquery');
let riot = require('riot');
require('../tag/timers.tag');
let tasks = [];

$(document).ready(function(){
   riot.mount('timers');
   // window.resizeTo(300, tasks.length*108 + (tasks.length-1));
   window.resizeTo(350, 2*98 + 1);
});

function update(){
   let timers = $('p.time');
   for(let i = 0; i < timers.length; i++) {
      timers[i].innerHTML = tasks[i].remainingTime;
   }
}