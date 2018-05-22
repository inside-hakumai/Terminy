<timers>
   <div class="timer" each='{tasks}'>
      <div class="default-panel">
         <p class="detail">{detail}まで</p>
         <p class={parent.taskIsMissed(deadline) ? "time missed" : "time"}>{parent.remainingTime(deadline)}</p>
      </div>
      <div class="hover-panel">
         <p class="edit-detail">{detail}</p>
         <p class="edit-date">
            <input type="text" name="dl-year" value='{deadline.format("YYYY")}'>年
            <input type="text" name="dl-month" value='{deadline.format("M")}'>月
            <input type="text" name="dl-day" value='{deadline.format("D")}'>日
            <input type="text" name="dl-hour" value='{deadline.format("H")}'>時
            <input type="text" name="dl-minute" value='{deadline.format("m")}'>分
         </p>
         <p class="buttons">
            <button class="done"></button>
            <button class="clear"></button>
         </p>
      </div>
   </div>

   <script>
      let parentThis = this;
      let moment = require('moment');
      window.jquery = window.$ = require('jquery');

      let tasks = [];
      for(let i = 0; i < opts.tasks.length; i++){
         tasks[i] = {
            'detail': opts.tasks[i].detail,
            'deadline': moment(opts.tasks[i].deadline)
         }
      }
      this.tasks = tasks;

      this.remainingTime = function (deadline) {
         let hasMissedDL = false;
         let nowDate = moment(new Date());
         let diffSecond = deadline.diff(nowDate, 'seconds');
         if (diffSecond < 0){
            hasMissedDL = true;
            diffSecond = Math.abs(diffSecond);
         }
         let dayNum = parseInt(diffSecond / 86400);
         let day;
         if (String(dayNum).length >= 3) {
            day = String(dayNum);
         } else {
            day = ('00' + parseInt(diffSecond / 86400)).slice(-2);
         }
         let hour = ('00' + parseInt(diffSecond % 86400 / 3600)).slice(-2);
         let minute = ('00' + parseInt(diffSecond % 86400 % 3600 / 60)).slice(-2);
         let second = ('00' + parseInt(diffSecond % 86400 % 3600 % 60)).slice(-2);

         if (day !== 0)  return day + ':' + hour + ':' + minute + ':' + second;
         if (hour !== 0) return hour + ':' + minute + ':' + second;
         else           return minute + ':' + second;
      }

      this.taskIsMissed = function (deadline) {
         let nowDate = moment(new Date());
         return (deadline.diff(nowDate, 'seconds') < 0);
      }

      /*
      this.update = function(){
         let timers = $('p.time');
         for(let i = 0; i < timers.length; i++) {
            timers[i].innerHTML = tasks[i].remainingTime;
         }
      }
      */

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