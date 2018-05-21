'use strict';

import '../sass/preferences-style.scss';

window.jquery = window.$ = require('jquery');
let main = window.require('electron').remote.require('./main');
let config;

$(document).ready(function(){
   let config = main.getConfig();
   console.log(config);

   $('#input-save-path').val(config['savePath']);

   $('.submenu-item').on('click', function(){
      if (!$(this).hasClass('focused')) {
         let active_item = $('.submenu-item.focused');
         $('#main-' + active_item.attr('data-ref')).removeClass('active');
         active_item.removeClass('focused');

         $(this).addClass('focused');
         $('#main-' + $(this).attr('data-ref')).addClass('active');
      }
   });
});