
function clock() {
    var date = new Date();
    var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var dt = date.getDate();
    if (dt >= 0 && dt <= 9) {
        dt = '0' + dt;
    }
    var current_date = `${dt} ${month[date.getMonth()]}`
    var time = hours => {
        if (hours > 12) {
            hours -= 12;
            if (hours >= 0 && hours <= 9) {
                hours = '0' + hours;
            }
            return {
                hrs: hours,
                suffix: "PM"
            };
        }
        else if(hours==12){
            return{
                hrs: hours,
                suffix: "PM"
            }
        }
        else {
            if (hours >= 0 && hours <= 9) {
                hours = '0' + hours;
            }
            return {
                hrs: hours,
                suffix: "AM"
            };
        }
    }
    var mins = date.getMinutes();
    if (mins >= 0 && mins <= 9) {
        mins = '0' + mins;
    }
    var current_time = `${time(date.getHours()).hrs} : ${mins} ${time(date.getHours()).suffix}`
    var datetime = `${current_date} | ${current_time}`

    document.querySelector(".date-time span").innerHTML = datetime;
}

setInterval(clock, 1000);