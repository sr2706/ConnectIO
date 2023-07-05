const socket = io('/');
const submit = document.querySelector('#submit');
submit.addEventListener("click" , dostuff);
function dostuff() {
    console.log(' ');
    const to = document.querySelector("#to").value;
    const subject = document.querySelector("#subject").value;
    const time = document.querySelector("#time").value;
    console.log(to , subject , time);
    socket.emit('sendmail', to , subject , time , id);
}