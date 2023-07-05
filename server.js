const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const url = require("url");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});
const path = require("path");
let loggedin = false;
let joiningmeet = false;
let gotoroom ;
let name;
let email;
app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "static")));
app.use("/peerjs", peerServer);
const nodemailer = require('nodemailer');
const cron = require('node-cron');



const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Configure Passport
const GOOGLE_CLIENT_ID = '146141162410-u1bv4h3rjje286m2igsk0mlbejdlag6l.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET='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';
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, cb) => {
  // This is where you can handle the user data returned by Google
  // You can store the user in your database or perform any other actions
  // You can access the user profile data via the `profile` object

  // Call the callback function with the user object
  return cb(null, profile);
}));

passport.serializeUser((user, done) => {
  // Serialize the user object (e.g., store the user ID in the session)
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // Deserialize the user object (e.g., retrieve the user from the database based on the ID)
  const user = { id }; // Replace this with your logic to retrieve the user
  done(null, user);
});

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

function isLoggedIn(req, res, next) {
  req.user ? next() : res.redirect('/start');
}

// Routes
app.get('/start', (req, res) => {
  res.redirect('/auth/google');
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Authentication successful, redirect to the room creation page
    res.redirect('/');
  }
);

app.get("/",isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, "static", "index.html"));
});


app.get("/join",isLoggedIn, (req, res) => {
  res.redirect(
      url.format({
          pathname: `/join/${uuidv4()}`,
          query: req.query,
      })
  );
});

app.get("/joinold",isLoggedIn, (req, res) => {
  res.redirect(
      url.format({
          pathname: req.query.meeting_id,
          query: req.query,
      })
  );
});






// app.get('/join', (req, res) => {
//     if(loggedin)
//     {
//       if(!joiningmeet){
//         rid = uuidV4();
//         //res.redirect(`/${rid}`)
//         res.sendFile(path.join(__dirname, "static", "index.html"));
//       }
//       else{
//         res.redirect(gotoroom);
//         joiningmeet = false;
//       }
//     }
//     else
//     {
//       let link = getGoogleAuthURL();
//       // console.log(link);
//       try{
//         res.redirect(link);
//       }
//       catch(e)
//       {
//         // console.log(e);
//       }
//     }
//   })
  
//  app.get('join/:rooms', (req, res) => {
//      gotoroom = req.params.rooms;
//      joiningmeet = true;
//      if(gotoroom == "schedule"){
//        let roomid = "http://localhost:3030"
//        roomid += '/join';
//        roomid += uuidV4();
//        //res.render('schedule', {meetid});
//       res.render("room", { roomid: req.params.rooms, Myname: req.query.name });
//        }
//        else {
//        if(loggedin) {
//         res.render('room', { roomid: req.params.rooms , name : name , email : email })
//         loggedin = false;
//       }
//       else
//       {
//         let link = getGoogleAuthURL();
//         res.redirect(link);
//       }
//     }
//   })
  
//   const PUBLIC_OAUTH_REDIRECT_URL= 'http://localhost:3030/api/sessions/oauth/google'; 
//   const PUBLIC_GOOGLE_CLIENT_ID='146141162410-u1bv4h3rjje286m2igsk0mlbejdlag6l.apps.googleusercontent.com' ;
//   const PUBLIC_GOOGLE_CLIENT_SECRET='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' ;
//   const PUBLIC_APP_PASSWORD='270604';
  
  
  
  
//   let redirect = PUBLIC_OAUTH_REDIRECT_URL.toString();
//   let id = PUBLIC_GOOGLE_CLIENT_ID.toString();
//   let secret = PUBLIC_GOOGLE_CLIENT_SECRET.toString();
//   let pass = PUBLIC_APP_PASSWORD.toString();
//   console.log(pass);
//   app.get("/api/sessions/oauth/google", googleOauthHandler)
  
//   async function googleOauthHandler(req, res) {
//     const code = String(req.query.code);
//     try {
//       const resu = await getGoogleOAuthTokens(code);
//       if (resu && resu.data && resu.data.access_token) {
//         const access_token = resu.data.access_token;
//         const id_token = resu.data.id_token;
//         const googleUser = jwt.decode(id_token);
//         name = googleUser.name;
//         email = googleUser.email;
//         loggedin = true;
//         res.redirect('/');
//       } else {
//         // Handle the case when the response or the required data is missing
//         // For example, you can redirect the user to an error page or display an error message.
//         res.status(500).send('Error occurred during token retrieval.');
//       }
//     } catch (error) {
//       // Handle the error if any exception occurred during the token retrieval
//       // For example, you can redirect the user to an error page or display an error message.
//       console.error(error);
//       res.status(500).send('Error occurred during token retrieval.');
//     }
//   }
  
  
//   async function getGoogleOAuthTokens(code) {
//       const url = "https://oauth2.googleapis.com/token";
//       const values = {
//         code : code,
//         client_id: id, 
//         client_secret: secret,
//         redirect_uri: redirect,
//         grant_type: "authorization_code",
//       };
  
//       const fa = new URLSearchParams(values);
//       try {
//         const res = await axios.post(
//           url,
//           fa.toString(),
//           {
//             headers: {
//               "Content-Type": "application/x-www-form-urlencoded",
//             },
//           }
//         );
//           return res;
//       } catch (error) {
//       }
//   };
  
// function getGoogleAuthURL() {
//    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
//    const options = {
//    redirect_uri: redirect,
//    client_id: id,
//    access_type: 'offline',
//    response_type: 'code',
//    prompt: 'consent',
//    scope: [
//       'https://www.googleapis.com/auth/userinfo.profile',
//       'https://www.googleapis.com/auth/userinfo.email',
//     ].join(" "),
//   };
//   const fa =  new URLSearchParams(options);
//   console.log(fa.toString());
//   return `${rootUrl}?${fa.toString()}`;
// }


// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "static", "index.html"));
// });

// app.get("/join", (req, res) => {
//     res.redirect(
//         url.format({
//             pathname: `/join/${uuidv4()}`,
//             query: req.query,
//         })
//     );
// });

// app.get("/joinold", (req, res) => {
//     res.redirect(
//         url.format({
//             pathname: req.query.meeting_id,
//             query: req.query,
//         })
//     );
// });

let connections = [];

app.get("/join/:rooms",isLoggedIn, (req, res) => {
    res.render("room", { roomid: req.params.rooms, Myname: req.query.name });
});

app.get('/whiteboard/:rooms',isLoggedIn,(req, res) => {
  const roomId = req.params.rooms;
  res.render("whiteboard", { roomId }); 
});



io.on("connect", (socket) => {
connections.push(socket);
console.log(`${socket.id} has connected`);

socket.on('draw' , (data) =>{
connections.forEach(con =>{
  if(con.id !== socket.id){
      con.emit('ondraw' , {x :data.x ,y: data.y})
  }
})
})

socket.on('down' , (data) =>{
connections.forEach(con =>{
  if(con.id!==socket.id){
      con.emit('ondown', {x : data.x , y : data.y});
  }
});
});

socket.on("disconnect" , (reason) => {
  console.log(`${socket.id} is disconnected`);
  connections = connections.filter((con) =>con.id != socket.id);
});

});








io.on("connection", (socket) => {
    socket.on("join-room", (roomId, id, myname) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", id, myname);

        socket.on("messagesend", (message) => {
            console.log(message);
            io.to(roomId).emit("createMessage", message);
        });

        socket.on("tellName", (myname) => {
            console.log(myname);
            socket.to(roomId).emit("AddName", myname);
        });
        socket.on('screenshared' , (id ,roomId) => {
          socket.to(roomId).emit("displayscreen" , id);
        });
   
        socket.on("disconnect", () => {
            socket.to(roomId).emit("user-disconnected", id);
        });
        socket.on("draw" , (x , y ,color, roomId) => {
          socket.to(roomId).emit('makeline', x , y , color);
        });
        
        socket.on("sendmail" , (to , subject , time ,id) => {
          let transporter = nodemailer.createTransport(
            {
              service : 'gmail',
              auth : {
                user : `${email}`,
                pass : pass,
              }
            }
          );
        
            let text = "Please join the meet at ";
            text += time;
            text += " using the link ";
            text += id;
              var mailOptions = {
              from : `${email}`,
              to : to,
              subject : subject,
              text : text,
            };
        
            transporter.sendMail(mailOptions , function(error , info){
              if(error){
              }
              else{
                console.log('sent');
                console.log(info.response);
              }
            });
        
            let hour = time[0];
            hour += time[1];
            let minute = time[3];
            minute += time[4];
            minute -= 15;
            hour -= 0;
            
            cron.schedule(`00 ${minute} ${hour} * * *`, function () {
              mailOptions.subject = "Reminder";
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) console.log(error);
                else console.log('Email sent: ' + info.response);
              });
            });
          
        
          });
        

    });
});

server.listen(process.env.PORT || 3030);