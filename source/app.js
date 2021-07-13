require('dotenv').config()
let express = require("express");
let app = express();
let stream = require("./stream/stream");

let path = require("path");
const cookieParser = require('cookie-parser')


// Google Authentication
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '943227346724-oeeg8btr8fe21vv6k29ffan4oufq9vtb.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);

//Static files
app.use("/public", express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(cookieParser());


//Starts from here, landingpage
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/landingpage.html");
});

app.post('/landingpage', (req,res)=>{
  let token = req.body.token;

  async function verify() { 
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,  
      });
      const payload = ticket.getPayload();
      const userid = payload['sub'];
    }
    verify()
    .then(()=>{
        res.cookie('session-token', token);
        res.send('success')
    })
    .catch(console.error);

})

//Set newroom and join
app.get("/entercall", checkAuthenticated,(req, res) => {

  res.sendFile(__dirname + "/entercall.html");
});
app.get("/newroom", checkAuthenticated,(req, res) => {
  res.sendFile(__dirname + "/newroom.html");
});
app.get('/protectedRoute', checkAuthenticated, (req,res)=>{
  res.send('This route is protected')
})

app.get('/logout', (req, res)=>{
  res.clearCookie('session-token');
  res.sendFile(__dirname + "/landingpage.html");
})

function checkAuthenticated(req, res, next){

  let token = req.cookies['session-token'];

  let user = {};
  async function verify() {
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      });
      const payload = ticket.getPayload();
      user.name = payload.name;
      user.email = payload.email;
      user.picture = payload.picture;
    }
    verify()
    .then(()=>{
        req.user = user;
        next();
    })
    .catch(err=>{
      res.sendFile(__dirname + "/landingpage.html");
    })

}
//Start the server
let server = app.listen(process.env.PORT || 3000, () =>
  console.log("Server is running succesfully.")
);
let io = require("socket.io").listen(server);
io.of("/stream").on("connection", stream);
