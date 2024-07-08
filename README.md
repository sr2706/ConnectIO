# ConnectIO




## Description


This is Node.js-based video call application that utilizes socket.io and peerjs libraries to establish peer-to-peer connections. It provides video-calling and real time chat functionality. Additionally, it offers features such as screen sharing and whiteboard sharing.



## Features

* Group video and audio call
* Real time chat
* Screen share
* View Participants
* Invite user through gmail
* Google Authentication
* Sharable whiteboard


## Techstack


### Technologies used
* Node.js
* HTML
* CSS
* EJS
* Javascript

### Libraries

* Socket.io
* Peerjs
* Nodemailer
* Passport js
* uuid

### Installation

1. Clone the repository `git clone https://github.com/sr2706/ConnectIO`

2. Install all packages and project dependencies `npm install`

3. Generate your Google Oauth credentials from [Google Developer Console](https://console.cloud.google.com/ "google developer console")

4. Set set the URI to `localhost:5000` and callback URI `localhost:5000/google/callback`

5. Add your credentials in .env file

### Execution

* Start the server `npm start` or `nodemon server.js`<br>

