/// <reference path="../../../typings/index.d.ts" />
'use strict';

import '../sass/dialog-style.scss';

const moment = require('moment');
const Flatpickr = require("flatpickr");
require("flatpickr/dist/flatpickr.css");
const main = require('electron').remote.require('./main');

new Flatpickr(document.getElementById('dl-input'), {
   enableTime: true,
   inline: true
});

$(function(){
   $('button#submit').on('click', function(){
      let inputDetail = $('input#detail').val();
      let inputDate = $('input#dl-input').val();

      console.log([inputDetail, inputDate]);

      let inputIsValid = true;

      if (inputDetail === ''){
         inputIsValid = false;
         $('p#p-detail span.alert')[0].innerHTML = '詳細が入力されていません。';
      } else {
         $('p#p-detail span.alert')[0].innerHTML = '';
      }
      if (!moment(inputDate).isValid()){
         inputIsValid = false;
         $('p#p-deadline span.alert')[0].innerHTML = '不正な値です。';
      } else {
         $('p#p-deadline span.alert')[0].innerHTML = '';
      }

      if (inputIsValid) {
         main.addNewTask(inputDetail, inputDate);
         main.reload();
      }

   });
});