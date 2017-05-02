<timers>
   <div class="timer" each='{tasks}'>
      <p class="detail">{detail}まで</p>
      <p class="time">{parent.remainingTime(deadline)}</p>
   </div>

   <script>
      let parentThis = this;
      let moment = require('moment');
      window.jquery = window.$ = require('jquery');

      this.tasks = [
         {detail: '論文読みの期限', deadline: moment(new Date(2017, 4, 21, 10, 30))},
         {detail: 'バイトのアレ完成', deadline: moment(new Date(2017, 4, 24, 18, 0))}
      ];

      this.remainingTime = function (deadline) {
         let nowDate = moment(new Date());
         let remainingSecond = deadline.diff(nowDate, 'seconds');
         let day = ('00' + parseInt(remainingSecond / 86400)).slice(-2);
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

   </script>
</timers>