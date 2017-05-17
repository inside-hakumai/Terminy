<timers>
   <div class="timer" each='{tasks}'>
      <div class="default-panel">
         <p class="detail">{detail}まで</p>
         <p class="time">{parent.remainingTime(deadline)}</p>
      </div>
      <div class="hover-panel">
         <p class="edit-detail">{detail}</p>
         <p class="edit-date">
            <input type="text" name="dl-year" value='{deadline.year()}'>年
            <input type="text" name="dl-year" value='{deadline.month()}'>月
            <input type="text" name="dl-year" value='{deadline.day()}'>日
            <input type="text" name="dl-year" value='{deadline.hour()}'>時
            <input type="text" name="dl-year" value='{deadline.minute()}'>分
         </p>
         <p class="buttons">
            <button class="done"><img src="./images/ic_done_black_24px.svg"></button>
            <button class="clear"><img src="./images/ic_clear_black_24px.svg"></button>
         </p>
      </div>
   </div>

   <script>
      let parentThis = this;
      let moment = require('moment');
      window.jquery = window.$ = require('jquery');

      this.tasks = [
         {detail: '打ち合わせ', deadline: moment(new Date(2017, 4, 18, 17, 30))},
         {detail: '院試', deadline: moment(new Date(2017, 7, 23, 8, 0))}
      ];

      this.remainingTime = function (deadline) {
         let nowDate = moment(new Date());
         let remainingSecond = deadline.diff(nowDate, 'seconds');
         let dayNum = parseInt(remainingSecond / 86400);
         let day;
         if (String(dayNum).length >= 3) {
            day = String(dayNum);
         } else {
            day = ('00' + parseInt(remainingSecond / 86400)).slice(-2);
         }
         let hour = ('00' + parseInt(remainingSecond % 86400 / 3600)).slice(-2);
         let minute = ('00' + parseInt(remainingSecond % 86400 % 3600 / 60)).slice(-2);
         let second = ('00' + parseInt(remainingSecond % 86400 % 3600 % 60)).slice(-2);

         if (day !== 0)  return day + ':' + hour + ':' + minute + ':' + second;
         if (hour !== 0) return hour + ':' + minute + ':' + second;
         else           return minute + ':' + second;
      }

      this.update = function(){
         let timers = $('p.time');
         for(let i = 0; i < timers.length; i++) {
            timers[i].innerHTML = tasks[i].remainingTime;
         }
      }

      let currentSecond = moment().second();
      let intervalID;
      intervalID = setInterval(function(){
         if(moment().second() !== currentSecond){
            setInterval(parentThis.update, 1000);
            clearInterval(intervalID);
         }
      }, 50);

      this.dlToString = function(deadline){
         return deadline.toString();
      }

   </script>
</timers>