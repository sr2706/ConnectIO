const socket =io();

let canvas = document.getElementById('canvas');  

canvas.width = 0.98*window.innerWidth;
canvas.height = window.innerHeight;


let ctx = canvas.getContext("2d");

let x;
let y;
let mouseDown = false;

window.onmousedown = (e) => {
    ctx.moveTo(x,y);
    socket.emit('down' , {x,y})
    mouseDown = true;
};

window.onmouseup = (e) => {
    mouseDown = false;
};

socket.on('ondraw' , ({x,y}) =>{
    ctx.lineTo(x,y);
    ctx.stroke();
})

socket.on('ondown' , ({x,y}) =>{
    ctx.moveTo(x,y);
})

window.onmousemove = (e) => {
    x = e.clientX;
    y = e.clientY;

    if(mouseDown) {
        socket.emit('draw' , {x , y });
        ctx.lineTo(x,y);
        ctx.stroke();
    }
};