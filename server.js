// Using Node.js `require()`
const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');

const port = 81; 
const hostname = '143.198.232.14';

// Define the MongoDB connection string
const mongoDBURL = "mongodb+srv://gbenedith:7sAuBQAmMIiZvuBG@ostaa-data.japycpp.mongodb.net/ostaa?retryWrites=true&w=majority";

mongoose.connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log("Connected to MongoDB");
});

// Create a schema for user 

// User Schema 
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    displayName: String,
    lastActivity: Date,
    notifications: Array,
    hash: String, // Hashing of password 
    salt: String, // Randomized salt 
    owned: Array, // Array of projects the user owns
    shared: Array // Array of projects that has been shared to the user 
});

// Notification Schema
const notificationSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
    },
    type: {
      type: String, // Notification type (e.g., 'new document shared', 'new document update', etc.)
      required: true,
    },
    message: {
      type: String, // Notification message 
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isRead: {
      type: Boolean,
      default: false, // Whether the user has read the notification or not 
    },
  });

let sessions = {};

function addSession(username) {
    let sid = Math.floor(Math.random() * 1000000000);
    let now = Date.now();
    sessions[username] = {id: sid, time: now};
    return sid;
}

function removeSessions(username) {
    let now = Date.now();
    let usernames = Object.keys(sessions);
    for (let i = 0; i < usernames.length; i++) {
        let last = sessions[usernames[i]].time;
        if (last + 120000 < now) {
            delete sessions[usernames[i]]
        }
    }
    console.log(sessions);
}

setInterval(removeSessions, 5000);

// ------------------------------------------------------------------------------------------------------------

const app = express();
app.use(cookieParser());
app.use(express.json());

// Error handling middleware for JSON parsing errors
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError) {
      res.status(400).json({ error: 'Invalid JSON data' });
    } else {
      next();
    }
  });

function authenticate(req, res, next) {
    let c = req.cookies;
    console.log('auth request');
    // console.log(c);
    console.log(sessions);
    if (c != undefined && c.login && c.login.username) {
        if (sessions[c.login.username] != undefined && sessions[c.login.username].id == c.login.sessionID) {
            next();
        } else {
            res.redirect('/app/index.html');
        }
    } else {
        res.redirect('/app/index.html');
    }
    
}
  
// ------------------------------------------------------------------------------------------------------------
app.use('/account/*', authenticate);
app.get('/account/*', (req, res, next) => { 
    next();
});
app.use(express.static('public_html'))


// Serve the Server JS file 
app.get('/server.js', (req, res) => {
    res.sendFile(__dirname + '/server.js');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public_html/app/index.html');
});

// Serve the Index JS file
app.get('/public_html/app/index.js', (req, res) => {
    res.sendFile(__dirname + '/public_html/app/index.js');
});

// Serve the Index HTML file
app.get('/app/index.html', (req, res) => {
    res.sendFile(__dirname + '/public_html/app/index.html');
});

// Serve the Index CSS file
app.get('/public_html/app/index.css', (req, res) => {
    res.sendFile(__dirname + '/public_html/app/index.css');
});

// Serve the Home JS file
app.get('/public_html/account/home.js', (req, res) => {
    res.sendFile(__dirname + '/public_html/account/home.js');
});

// Serve the Home HTML file
app.get('/public_html/account/home.html', (req, res) => {
    res.sendFile(__dirname + '/public_html/account/home.html');
});

// Serve the Home CSS file
app.get('/public_html/account/home.css', (req, res) => {
    res.sendFile(__dirname + '/public_html/account/home.css');
});

// Serve the Post JS file
app.get('/public_html/account/post.js', (req, res) => {
    res.sendFile(__dirname + '/public_html/account/post.js');
});

// Serve the Post HTML file
app.get('/public_html/account/post.html', (req, res) => {
    res.sendFile(__dirname + '/public_html/account/post.html');
});

// Serve the Post CSS file
app.get('/public_html/account/post.css', (req, res) => {
    res.sendFile(__dirname + '/public_html/account/post.css');
});

// ------------------------------------------------------------------------------------------------------------



app.post('account/login', (req, res) => {
    let u = req.body;
    let p1 = User.find( {username: u.username, password: u.password} ).exec()
    p1.then((results) => {
        if (results.length == 0) {
            res.end("Could not find account");
        } else {
            console.log('here');
            let currentUser = results[0];
            let toHash = userData.password + currentUser.salt;
            console.log("honeycomb")
            console.log(toHash);
            let h = crypto.createHash('sha3-256');
            let data = h.update(toHash, 'utf-8');
            let result = data.digest('hex');

            console.log(currentUser.salt);
            console.log("beehive");
            console.log(toHash);
            console.log(result);

            if (result == currentUser.hash) {
                console.log('Username and password match.');
                let sid = addSession(userData.username);
                res.cookie('login', 
                {username: userData.username, sessionID: sid}, 
                { maxAge: 60000 * 2 });
                res.status(200).send('User successfully authenticated.');
            } else {
                res.status(500).send('ISSUE OCCURRED.');
            }
        }
    })
})

app.post('/register', (req, res) => {
    let userData = req.body;
    let person = User.find({username: { $regex: userData.username, $options: "i" }}).exec();
    console.log("cats");
    person.then((results) => {
        if (results.length == 0) {
            console.log("dogs");
            let newSalt = '' + Math.floor(Math.random() * 1000000000);
            let toHash = req.body + currentUser.salt;
            let h = crypto.createHash('sha3-256)');
            let data = h.update(toHash, 'utf-8');
            let result = data.digest('hex');

            console.log(newSalt);
            console.log(toHash);
            console.log(result);

            let user = new User({
                username: req.params.user,
                password: req.params.pass,
                hash: result,
                salt: newSalt,
                owned: Array,
                shared: Array 
            });
            let savedUser = newUser.save();
            console.log("rain");
            savedUser.then(() => {
                console.log("Account successfully created.");
                console.log("New user: " + newUser);
                res.status(200).send("Account successfully created.");
            });
            person.catch(() => {
                res.end('DATABASE SAVE ISSUE');
            });
        } else {
            res.end('USERNAME ALREADY TAKEN');
        }
    })
    
})


setinterval(removeSessions, 5000);

