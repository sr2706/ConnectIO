const socket = io("/");
const main__chat__window = document.getElementById("main__chat_window");
const videoGrids = document.getElementById("video-grids");
const myVideo = document.createElement("video");
const chat = document.getElementById("chat");
OtherUsername = "";
chat.hidden = true;
myVideo.muted = true;

window.onload = () => {
    $(document).ready(function() {
        $("#getCodeModal").modal("show");
    });
};

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "3030",
});

let myVideoStream;
const peers = {};
var getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

sendmessage = (text) => {
    if (event.key === "Enter" && text.value != "") {
        socket.emit("messagesend", myname + ' : ' + text.value);
        text.value = "";
        main__chat_window.scrollTop = main__chat_window.scrollHeight;
    }
};

navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream, myname);

        socket.on("user-connected", (id, username) => {
            console.log("userid:" + id);
            connectToNewUser(id, stream, username);
            socket.emit("tellName", myname);
        });

        socket.on("user-disconnected", (id) => {
            console.log(peers);
            if (peers[id]) peers[id].close();
        });
    });
peer.on("call", (call) => {
    getUserMedia({ video: true, audio: true },
        function(stream) {
            call.answer(stream); // Answer the call with an A/V stream.
            const video = document.createElement("video");
            call.on("stream", function(remoteStream) {
                addVideoStream(video, remoteStream, OtherUsername);
            });
        },
        function(err) {
            console.log("Failed to get local stream", err);
        }
    );
});

peer.on("open", (id) => {
    socket.emit("join-room", roomId, id, myname);
});

socket.on("createMessage", (message) => {
    var ul = document.getElementById("messageadd");
    var li = document.createElement("li");
    li.className = "message";
    li.appendChild(document.createTextNode(message));
    ul.appendChild(li);
});

socket.on("AddName", (username) => {
    OtherUsername = username;
    console.log(username);
});

const RemoveUnusedDivs = () => {
    //
    alldivs = videoGrids.getElementsByTagName("div");
    for (var i = 0; i < alldivs.length; i++) {
        e = alldivs[i].getElementsByTagName("video").length;
        if (e == 0) {
            alldivs[i].remove();
        }
    }
};

const connectToNewUser = (userId, streams, myname) => {
    const call = peer.call(userId, streams);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        //       console.log(userVideoStream);
        addVideoStream(video, userVideoStream, myname);
    });
    call.on("close", () => {
        video.remove();
        RemoveUnusedDivs();
    });
    peers[userId] = call;
};

const cancel = () => {
    $("#getCodeModal").modal("hide");
};

const copy = async() => {
    const roomid = document.getElementById("roomid").innerText;
    await navigator.clipboard.writeText("http://localhost:3030/join/" + roomid);
};
const invitebox = () => {
    $("#getCodeModal").modal("show");
};

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        document.getElementById("mic").style.color = "red";
    } else {
        document.getElementById("mic").style.color = "white";
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
};

const VideomuteUnmute = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    console.log(getUserMedia);
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        document.getElementById("video").style.color = "red";
    } else {
        document.getElementById("video").style.color = "white";
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
};

// let canvas = document.querySelector("#board");
// let x_coor ;  
// let y_coor ;
// let mouseDown = false;

// x_coor = 20;
// y_coor = 0;

// var rect = canvas.parentNode.getBoundingClientRect();
// canvas.width = rect.width;
// canvas.height = rect.height;
// let ctx = canvas.getContext("2d");

// let arr = [ "#000000" ];
// ctx.strokeStyle = arr[color];
// function getXY(canvas, event) {
//   var rect = canvas.getBoundingClientRect();  // absolute position of canvas
//   return {
//       x: event.clientX - rect.left,
//       y: event.clientY - rect.top,
//   }
// }


// socket.on('makeline' , (x , y , newcolor) => {
//     let ori = color;
//     ctx.strokeStyle = arr[newcolor];
//     ctx.lineTo(x, y);
//     ctx.stroke();
//     ctx.strokeStyle = arr[ori];
// });

// socket.on('movedown' , (x , y) => {
//   ctx.beginPath();
//   var rect = canvas.getBoundingClientRect();
//   ctx.moveTo(x  - rect.left, y - rect.top);
// })

// window.onmousedown = (e) => {
//   ctx.beginPath();
//   socket.emit('down' , ROOM_ID , e.clientX , e.clientY);
//   var pos = getXY(canvas, e);
//   ctx.moveTo(pos.x, pos.y);
//   mouseDown = true;
// };

// window.onmouseup = (e) => {
//   mouseDown = false;
// };

// window.onmousemove = (e) => {
//   var pos = getXY(canvas, e);
//   if (mouseDown) {
//     socket.emit('draw' , pos.x , pos.y , color,  ROOM_ID);
//     ctx.lineTo(pos.x, pos.y);
//     ctx.stroke();
//   }
// };

// const whitebutton = document.querySelector(".whiteboard");
// whitebutton.addEventListener("click" , openwhiteboard);
// function openwhiteboard(){
//   document.querySelector(".canvas").style.backgroundColor = "white";
// }


const screenshare = document.querySelector(".screenshare");
screenshare.addEventListener('click' , screensharecode);
let screen = false;
function screensharecode() {
//   const myScreen = document.createElement('video');
//   if(!screen)
//   {
//   navigator.mediaDevices.getDisplayMedia().then(stream => {
//     let videotrack = stream.getVideoTracks()[0];
//     console.log(currentPeer);
//     let sender = currentPeer.peerConnection.getSenders()[1];
//     sender.replaceTrack(videotrack);
//     myVideo.srcObject = stream;
//   })
//   screen = true;
//   stopsharing();
// }
// else{
//   myVideo.srcObject = face;
//   screen = false;
//   sharing();
// }
navigator.mediaDevices.getDisplayMedia({cursor:true})
    .then(screenStream=>{
      myPeer.current.replaceTrack(stream.getVideoTracks()[0],screenStream.getVideoTracks()[0],stream)
      userVideo.current.srcObject=screenStream
      screenStream.getTracks()[0].onended = () =>{
      myPeer.current.replaceTrack(screenStream.getVideoTracks()[0],stream.getVideoTracks()[0],stream)
      userVideo.current.srcObject=stream
      }
    })

}

const stopsharing = () => {
  const html = `
  <i class="fas fa-times-circle"></i>
    <span>Stop Sharing</span>
  `
  document.querySelector('.screenshare').innerHTML = html;
}


const sharing = () => {
  const html = `
  <i class="fas fa-desktop"></i>
  <span>Share Screen</span>
  `
  document.querySelector('.screenshare').innerHTML = html;
}


const showchat = () => {
    if (chat.hidden == false) {
        chat.hidden = true;
    } else {
        chat.hidden = false;
    }
};

const addVideoStream = (videoEl, stream, name) => {
    videoEl.srcObject = stream;
    videoEl.addEventListener("loadedmetadata", () => {
        videoEl.play();
    });
    const h1 = document.createElement("h1");
    const h1name = document.createTextNode(name);
    h1.appendChild(h1name);
    const videoGrid = document.createElement("div");
    videoGrid.classList.add("video-grid");
    videoGrid.appendChild(h1);
    videoGrids.appendChild(videoGrid);
    videoGrid.append(videoEl);
    RemoveUnusedDivs();
    let totalUsers = document.getElementsByTagName("video").length;
    if (totalUsers > 1) {
        for (let index = 0; index < totalUsers; index++) {
            document.getElementsByTagName("video")[index].style.width =
                100 / totalUsers + "%";
        }
    }
};

