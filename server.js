require('dotenv').config();
const express = require('express')  
const app = express()   
const server = require('http').Server(app)  
const io = require('socket.io')(server);  
const { v4: uuidV4 } = require('uuid') 
const nodemailer = require('nodemailer');

const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth2').Strategy;


passport.serializeUser((user, done) => {
    done(null, user);
})
passport.deserializeUser(function (user, done) {
    done(null, user);
});
let name
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACKURL,
    passReqToCallback: true
},
    function (request, accessToken, refreshToken, profile, done) {
        name = profile.displayName;
        return done(null, profile);
    }
));


var ExpressPeerServer = require('peer').ExpressPeerServer;
var peerExpress = require('express');
var peerApp = peerExpress();
var peerServer = require('http').createServer(peerApp);
var options = { debug: true, allow_discovery: true };

app.use(session({
    secret: process.env.CLIENT_SECRET,
    resave: false,
    saveUninitialized: false
}));


app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(passport.initialize());
app.use(passport.session());

peerApp.use('/peerjs', ExpressPeerServer(peerServer, options));

app.get('/start', (req, res) => {
    res.render('start');
});

app.get('/join', (req, res) => {
    res.render('join');
});

app.get('/', (req, res) => {
    res.render('home');
});

// Auth
app.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

// Auth Callback
app.get('/google/callback', passport.authenticate('google', {
    successRedirect: '/google/callback/success',
    failureRedirect: '/google/callback/failure'
}));

// Success
app.get('/google/callback/success', (req, res) => {
    if (!req.user)
        return res.redirect('/google/callback/failure');
    res.render('start');
});

// Failure
app.get('/google/callback/failure', (req, res) => {
    res.send("Error");
});


app.get('/meeting', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/leavewindow', (req, res) => {
    res.render('leavewindow');
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})


let participant = [];
let participantname = new Map();
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        participant.push(socket.id);
        participantname.set(socket.id, name);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('connected-user', userId);
        socket.on('send', (chat, ID) => {
            io.to(roomId).emit('userMessage', chat, participantname.get(ID));
        })
        socket.on('view-participants', () => {
            let participantNameObj = Object.fromEntries(participantname);
            socket.emit('participants', participant, participantNameObj);
        });

        socket.on('start-whiteboard', () => {
            socket.broadcast.to(roomId).emit('start-whiteboard');
        })

        socket.on('draw', (x, y, color) => {
            io.to(roomId).emit('ondraw', x, y, color);
        })

        socket.on('erase', () => {
            io.to(roomId).emit('onerase');
        })

        socket.on('sendInvite', emailId => {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.USER,
                    pass: process.env.PASS
                }
            });

            const mailOptions = {
                from: process.env.USER, 
                to: emailId,
                subject: "Meet Invitation",
                text: `You have been invited to join the meet. You can join the meet through this link : https://connect-io.onrender.com/${roomId}`, 
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log('Email sent');
                    socket.emit('emailSent', info.response);
                }
            })
        });

        

        socket.on('disconnect', () => {
            let user = socket.id;
            let leavingParticipant=participant.indexOf(user)+participant.length+1;
            console.log(leavingParticipant);
            let participantNameObj = Object.fromEntries(participantname);
            socket.broadcast.to(roomId).emit('disconnected-user', socket.id, participantNameObj,leavingParticipant);
            name = participantname.get(user);
            participant.splice(participant.indexOf(user), 1);
            participantname.delete(user);
        })

    });
})

server.listen(5000 || process.env.PORT)
peerServer.listen(9000);
