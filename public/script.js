const socket = io();
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.setAttribute('onclick', 'zoom(this)');
myVideo.setAttribute('title', 'Click to zoom the video');
myVideo.muted = true;
let current;
let local_stream;

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '9000'
})

let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    local_stream = stream;
    // This is for other user connected (3-2-1)
    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        video.setAttribute('onclick', 'zoom(this)');
        video.setAttribute('title', 'Click to zoom the video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
            current = call;
        })
    })
    // This is for newly connected user (1-2-3)
    socket.on('connected-user', (userId) => {
        const call = peer.call(userId, stream);
        current = call;
        const video = document.createElement('video');
        video.setAttribute('onclick', 'zoom(this)');
        video.setAttribute('title', 'Click to zoom the video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })

    })

    const messageInput = document.querySelector('#chat-message');
    const sendButton = document.querySelector('.send-button');

    function sendMessage() {
        if (messageInput.value != "") {
            socket.emit('send', messageInput.value, socket.id);
            messageInput.value = "";
        }
    }
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    sendButton.addEventListener('click', (e) => {
        e.preventDefault();
        sendMessage();
    });

    socket.on('userMessage', (usermessage, username) => {
        console.log(usermessage);
        let message = document.createElement('div');
        let name = document.createElement('h6');
        let chat = document.createElement('p');
        name.innerHTML = username;
        chat.innerHTML = usermessage;
        message.append(name);
        message.append(chat);
        document.querySelector('.chat-window').append(message);


        document.querySelector('.chat-window').scrollTop = document.querySelector('.chat-window').scrollHeight;
    });

    const viewParticipants = document.querySelector('.view-participant');
    const participantlist = document.querySelector('#participantModal .modal-body ul');
    let participantpresent = new Map();
    viewParticipants.addEventListener('click', () => {
        socket.emit('view-participants');
    });
    socket.on('participants', (participantIds, participantNameObj) => {
        const participantname = new Map(Object.entries(participantNameObj));
        console.log(participantIds);
        for (let i = 0; i < participantIds.length; i++) {
            if (!participantpresent.has(participantIds[i]) || participantpresent.has(participantIds[i]) && !participantpresent.get(participantIds[i])) {
                const li = document.createElement('li');
                li.innerHTML = participantname.get(participantIds[i]);
                participantlist.append(li);
                participantpresent.set(participantIds[i], true);
            }
        }
    });

    socket.on('disconnected-user', (user, participantNameObj,leaveid) => {
        const participantname = new Map(Object.entries(participantNameObj));
        const list = document.querySelectorAll('#participantModal .modal-body ul li');
        const uid = user;
        for (let i = 0; i < list.length; i++) {
            if (list[i].textContent === participantname.get(uid)) {
                list[i].remove();
                break;
            }
        }
        participantpresent.delete(user);
        alert(participantname.get(uid) + ' left !')
        let videoElement=document.querySelector(`#video-grid > video:nth-child(${leaveid})`);
        videoElement.remove();
        
    });

    const emailId = document.querySelector('.emailInput').value;
    const sendemail = document.querySelector('.sendEmail');
    function sendInvite() {
        socket.emit('sendInvite', emailId);
    }

    sendemail.addEventListener('click', () => {
        if (emailId != '') {
            emailId = '';
            sendInvite();
        }
    })

    socket.on('emailSent', response => {
        alert('Mail sent! ' + response);
    });
    

    const whiteboard = document.querySelector('.whiteboard');
    const whitespace = document.querySelector('.whitespace');
    const whitespace_screen = document.querySelector('.whiteboard-screen');
    const eraser = document.querySelector('.eraser');
    whitespace.width = window.innerWidth;
    whitespace.height = window.innerHeight;
    let context = whitespace.getContext("2d");
    let whiteboardstatus = false;
    whiteboard.addEventListener('click', () => {

        if (whiteboardstatus) {
            whiteboard.style.backgroundColor = "rgb(95, 100, 106)";
            whiteboard.style.color = "white";
            whitespace_screen.style.display = 'none';
            videoGrid.style.display = 'flex';
            whiteboardstatus = false;
        }
        else {
            socket.emit('start-whiteboard');
            socket.on('start-whiteboard', () => {
                alert('Whiteboard has been shared you can open your whiteboard to contribute');
            })
            whiteboard.style.backgroundColor = "#0079FF";
            whiteboard.style.color = "black";
            whitespace_screen.style.display = 'block';
            videoGrid.style.display = 'none';
            whiteboardstatus = true;

            let current = {
                color: 'black',
                width: 2
            };

            let currentPath = null;


            document.querySelector('.black').addEventListener('click', () => {
                current.width = 2;
                current.color = 'black';
            });

            document.querySelector('.blue').addEventListener('click', () => {
                current.width = 2;
                current.color = '#525FE1';
            });

           

            eraser.addEventListener('click', () => {
                current.width = 30;
                current.color = '#F5F5F5';
            });

            let x, y;
            let mouseDown = false;
            let rect = whitespace.getBoundingClientRect();
            let offsetX = rect.left;
            let offsetY = rect.top;
            let scrollX = document.documentElement.scrollLeft;
            let scrollY = document.documentElement.scrollTop;

            whitespace.onmousedown = (e) => {
                x = e.clientX - offsetX + scrollX;
                y = e.clientY - offsetY + scrollY;
                currentPath = {
                    color: current.color,
                    width: current.width,
                    points: [{ x, y }]
                };
                mouseDown = true;
            };

            whitespace.onmouseup = (e) => {
                if (mouseDown && currentPath) {
                    socket.emit('draw', currentPath);
                    currentPath = null;
                }
                mouseDown = false;
            };

            socket.on('ondraw', (path) => {
                drawPath(path);
            });

            whitespace.onmousemove = (e) => {
                if (mouseDown && currentPath) {
                    x = e.clientX - offsetX + scrollX;
                    y = e.clientY - offsetY + scrollY;
                    currentPath.points.push({ x, y });
                    drawPath(currentPath);
                }
            };

            function drawPath(path) {
                context.strokeStyle = path.color;
                context.lineWidth = path.width;
                context.beginPath();
                context.moveTo(path.points[0].x, path.points[0].y);
                for (let i = 1; i < path.points.length; i++) {
                    context.lineTo(path.points[i].x, path.points[i].y);
                }
                context.stroke();
            }
        }
    })
})


peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})



const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}


let screensharestatus = false;
let screenStream;
const screenPeer = new Peer();
screenPeer.on('open', id => {
    screenID = id;
})

const screenshare = document.querySelector('.Screen-share');

function startScreenShare() {
    if (screensharestatus) {
        return;
    }
    navigator.mediaDevices.getDisplayMedia({

        audio: {
            echoCancellation: true,
            noiseSuppression: true,
        },
        video: {
            cursor: "always"
        },
    }).then((stream) => {
        screenStream = stream;
        let videoTrack = stream.getVideoTracks()[0];
        let sender = current.peerConnection.getSenders().find(s => {
            return s.track.kind == videoTrack.kind;
        })
        sender.replaceTrack(videoTrack);
        screensharestatus = true;
        screenshare.style.backgroundColor = "#0079FF";
        screenshare.style.color = "black";
        console.log(screensharestatus);
    }).catch((err) => {
        console.log(err);
    })
}

function stopScreenShare() {
    if (screensharestatus == false) {
        return;
    }
    let videoTrack = local_stream.getVideoTracks()[0];
    let sender = current.peerConnection.getSenders().find(s => {
        return s.track.kind == videoTrack.kind;
    })
    sender.replaceTrack(videoTrack);

    screenStream.getTracks().forEach(track => {
        track.stop();
    })
    screensharestatus = false;
    screenshare.style.backgroundColor = "rgb(95, 100, 106)";
    screenshare.style.color = "white";
}

function screenShare() {
    if (screensharestatus) {
        stopScreenShare();
    }
    else {
        startScreenShare();
    }
}

screenshare.addEventListener('click', (e) => {
    e.preventDefault();
    screenShare();
})

function setUnmute() {
    const icon = '<i class="fa-solid fa-microphone"></i>';
    document.querySelector('.unmute').innerHTML = icon;
    document.querySelector('.unmute').classList.remove('mute');
}

function setMute() {
    const icon = '<i class="fa-solid fa-microphone-slash"></i>';
    document.querySelector('.unmute').innerHTML = icon;
    document.querySelector('.unmute').classList.add('mute');
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setMute();
    }
    else {
        setUnmute();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

// ---------------------------------------------Video-settings-----------------------------------------------------

function setPlay() {
    const icon = '<i class="fa-solid fa-video"></i>';
    document.querySelector('.play').innerHTML = icon;
    document.querySelector('.play').classList.remove('stop');
}

function setStop() {
    const icon = '<i class="fa-solid fa-video-slash"></i>';
    document.querySelector('.play').innerHTML = icon;
    document.querySelector('.play').classList.add('stop');
}

const playStop = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setStop();
    }
    else {
        setPlay();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

// -------------------------------------------------Add-User--------------------------------------------------------
const copyMessage = document.querySelector('.copyMessage');
const addUser = document.querySelector('.add-user');

addUser.addEventListener('click', () => {
    const message = ROOM_ID;
    copyMessage.innerHTML = message;
});

function copyInvite() {
    navigator.clipboard.writeText(copyMessage.value);
    alert('Message copied !');
}


const leaveButton = document.querySelector('.leave-button');
leaveButton.addEventListener('click', () => {
    window.location.href = '/leavewindow';
});

function zoom(e) {
    if (e.style.height == '200px') {
        e.style.height = '400px';
        e.style.flex = '0 0 50';
        e.style.cursor = 'zoom-out';
    }
    else {
        e.style.height = '200px';
        e.style.flex = '0 0 10';
        e.style.cursor = 'zoom-in';
    }
}



