const mongoose = require('mongoose');
const express = require('express');
const cookieParse = require('cookie-paser');
const fs = require('fs');
const crypto = ;

const app = express();

let sessions = {};

function addSession(username) {
    let sid = Math.floor(Math.random() * 1000000000);
    let now = Date.now();
    sessions[username] = {id: sid, time: now};
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
  

app.post('account/login', (req, res) => {
    let u = req.body;
    let p1 = User.find( {username: u.username, password: u.password} ).exec()
    p1.then((results) => {
        if (results.length == 0) {
            res.end("Could not find account");
        } else {
            let sid = addSession(u.username);
            res.cookie('login',
                {username: u.username, sessionID: sid},
                {maxAge: 60000 * 2});
            res.end('SUCCESS');
        }
    })
})

app.get('/account/create/:user/:pass', (req, res) => {
    let person1 = User.find({username: req.params.user}).exec();
    person1.then((results) => {
        if (results.length == 0) {
            let currentUser = results[0];
            let newSalt = '' + Math.floor(Math.random() * 1000000000);
            let toHash = req.body + currentUser.salt;
            let h = crypto.createHash('sha3-256)');
            let data = h.update(toHash, 'utf-8');
            let result = data.digest('hex');

            console.log()
            console.log(req.params.pass);
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
            let person = user.save();
            person.then(() => {
                res.end('USER CREATED');
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

const app2 = express();
app2.use(cookieParser());

function authenticate(req, res, next) {
    let c = req.cookies;
    console.log('auth request');
    console.log(c);
    console.log(sessions);
    if (c != undefined) {
        if (sessions[c.login.username] != undefined &&
            sessions[c.login.username].id == c.login.sessionID) {
                next();
        } else {
            res.redirect('/account/index.html');
        }
    } else {
        res.redirect('/account/index.html');
    }
    
}

app.use('/app/*', authenticate);
app.use(express.static('public_html'));