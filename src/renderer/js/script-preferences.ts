/// <reference path="../../../typings/index.d.ts" />
'use strict';

import '../sass/preferences-style.scss';

let main = require('electron').remote.require('./main');
let config;

$(document).ready(function(){
   let config = main.getConfig();
   console.log(config);

   $('#input-save-path').val(config['savePath']);

   $('.submenu-item').on('click', function(evt){
      if (!$(evt).hasClass('focused')) {
         let active_item = $('.submenu-item.focused');
         $('#main-' + active_item.attr('data-ref')).removeClass('active');
         active_item.removeClass('focused');

         $(evt).addClass('focused');
         $('#main-' + $(evt).attr('data-ref')).addClass('active');
      }
   });
});