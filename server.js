// Using Node.js `require()`
const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const uuid = require('uuid');
const WebSocket = require('ws')
const wss = new WebSocket.Server({ noServer: true })
// const setupWSConnection = require('./utils.js').setupWSConnection

const port = 80; 
const hostname = 'localhost'; // For now 

// Define the MongoDB connection string
const mongoDBURL = "mongodb+srv://gbenedith:k0HWPrO07X9Cki1l@hivescript.owmolsx.mongodb.net/hivescript?retryWrites=true&w=majority";

mongoose.connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log("Connected to MongoDB");
});

// User Schema 
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    displayName: String,
    dateJoined: String,
    lastActivity: Date,
    notifications: Array,
    unreadNotifications: String,
    hash: String, // Hashing of password 
    salt: String, // Randomized salt 
    owned: [], // Array of projects the user owns
    shared: [] // Array of projects that has been shared to the user 
});

const User = mongoose.model('User', userSchema); 

// Notification Schema
const notificationSchema = new mongoose.Schema({
    reciever: {
      type: String // Username that notification belongs to 
    },
    type: {
      type: String, // Notification type (e.g., 'new document shared', 'new document update', etc.)
    },
    message: {
      type: String, // Notification message 
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

const Notification = mongoose.model('Notification', notificationSchema); 

const projectSchema = new mongoose.Schema({
    projectId: String,
    queenBee: String, // the owner of the project
    workingBees: Array, // the invited participants to the project
    projectTitle: String, // Title of the project
    editorState: Object
});

const Project = mongoose.model('Project', projectSchema); 

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
app.set('views', path.join(__dirname, 'public_html/account/view'));
app.set('view engine', 'ejs');

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
    console.log(sessions);
    if (c != undefined && c.login && c.login.username) {
        if (sessions[c.login.username] != undefined && sessions[c.login.username].id == c.login.sessionID) {
            next();
        } else {
            res.redirect('/index');
        }
    } else {
        res.redirect('/index');
    }
    
}

app.use('/public_html/account', authenticate, express.static('public_html/account'));
// app.use('/public_html', express.static('public_html'));

// app.use(authenticate);
// app.use('/public_html', express.static('public_html'));

// ------------------------------------------------------------------------------------------------------------


// Serve the Server JS file 
app.get('/server.js', (req, res) => {
    res.sendFile(__dirname + '/server.js');
});

app.get('/', (req, res) => {
    let c = req.cookies;
    if (c != undefined && c.login && c.login.username) {
        if (sessions[c.login.username] != undefined && sessions[c.login.username].id == c.login.sessionID) {
            res.redirect('/public_html/account/homepage/home.html');
        } else {
            res.redirect('/index');
        }
    } else {
        res.redirect('/index');
    }
});

app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/public_html/index/index.html');
});

// Serve the Index JS file
app.get('/public_html/index/index.js', (req, res) => {
    res.sendFile(__dirname + '/public_html/index/index.js');
});

// Serve the Index HTML file
app.get('/public_html/index/index.html', (req, res) => {
    res.sendFile(__dirname + '/public_html/index/index.html');
});

// Serve the Index CSS file
app.get('/public_html/index/index.css', (req, res) => {
    res.sendFile(__dirname + '/public_html/index/index.css');
});

// Serve the Home JS file
app.get('/public_html/account/homepage/home.js', (req, res) => {
    res.sendFile(__dirname + '/public_html/account/homepage/home.js');
});

// Serve the Home HTML file
app.get('/public_html/account/homepage/home.html', authenticate, (req, res) => {
    res.sendFile(__dirname + '/public_html/account/homepage/home.html');
});

// Serve the Home CSS file
app.get('/public_html/account/homepage/home.css', (req, res) => {
    res.sendFile(__dirname + '/public_html/account/homepage/home.css');
});

// Serve the Profile JS file
app.get('/public_html/account/view/profile/profile.js', (req, res) => {
    res.sendFile(__dirname + '/public_html/account/view/profile/profile.js');
});

// Serve the Profile EJS file
app.get('/profile/:username', authenticate, async (req, res) => {
    console.log("here");
    console.log("cake");
    const username = req.params.username;
    const tab = req.query.tab || 'profile';
    
    try {
        const user = await User.findOne({ username: username }).exec();
        if (!user) {
            // Handle case where user with the specified username is not found
            res.status(404).send('User not found');
        } else {
            // Render the user's profile page with the user details
            res.render('profile/profile', { user: user, tab: tab });
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Serve the Profile CSS file
app.get('/public_html/account/view/profile/profile.css', (req, res) => {
    res.sendFile(__dirname + '/public_html/account/view/profile/profile.css');
});

// Serve the Project MJS file
app.get('/public_html/account/view/project/project.mjs', (req, res) => {
    res.sendFile(__dirname + '/public_html/account/view/project/project.mjs');
});

// Serve the Project CSS file
app.get('/public_html/account/view/project/project.css', (req, res) => {
    res.sendFile(__dirname + '/public_html/account/view/project/project.css');
});

// // Serve the Help JS file
// app.get('/help.js', (req, res) => {
//     res.sendFile(__dirname + '/help/help.js');
// });

// Serve the Help HTML file
app.get('/help', (req, res) => {
    res.sendFile(__dirname + '/public_html/help/help.html');
});

// Serve the Help CSS file
app.get('/public_html/help/help.css', (req, res) => {
    res.sendFile(__dirname + '/public_html/help/help.css');
});

// Serve the image file
app.get('/public_html/img/hivescript_new_logo.png', (req, res) => {
    res.sendFile(__dirname + '/public_html/img/hivescript_new_logo.png');
});

app.get('/project/:projectId', authenticate, async (req, res) => {
    const projectId = req.params.projectId;
    
    try {
        const project = await Project.findOne({ projectId: projectId }).exec();
        if (!project) {
            // Handle case where project with the specified ID is not found
            res.status(404).send('Project not found');
        } else {
            // Render the project page with the project details
            res.render('project/project', { project: project });
        }
    } catch (error) {
        console.error('Error fetching project details:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/project/:projectId/save-state', async (req, res) => {
    const projectId = req.params.projectId;
    const { editorState } = req.body;

    try {
        const project = await Project.findOne({ projectId }).exec();

        if (!project) {
            console.log("Project not found.");
            res.status(404).send("Project not found.");
            return;
        }

        // Update the editor state in the project document
        project.editorState = editorState;
        await project.save();

        res.status(200).send("Editor state saved successfully.");
    } catch (error) {
        console.error("Error saving editor state:", error);
        res.status(500).send("Error saving editor state.");
    }
});

app.get('/project/load-state/:projectId', async (req, res) => {
    const projectId = req.params.projectId;

    try {
        const project = await Project.findOne({ projectId }).exec();

        if (!project) {
            console.log("Project not found.");
            res.status(404).send("Project not found.");
            return;
        }

        // Return the editor state as JSON
        res.status(200).json({
            editorState: project.editorState,
        });
    } catch (error) {
        console.error("Error loading editor state:", error);
        res.status(500).send("Error loading editor state.");
    }
});

// Handle request to get projects owned by user
app.get('/user/:username/projects/owned', authenticate, async (req, res) => {
    const username = req.params.username;

    try {
        const user = await User.findOne({ username: username }).exec();
        if (!user) {
            res.status(404).send('User not found');
            return;
        }

        // Fetch the projects owned by the user
        const projects = await Project.find({ queenBee: username }).exec();

        // Map the projects to include only relevant information (projectId and projectTitle)
        const mappedProjects = projects.map(project => ({
            projectId: project.projectId,
            projectTitle: project.projectTitle
        }));

        res.json(mappedProjects);
    } catch (error) {
        console.error('Error fetching user projects:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Handle request to get projects shared with user
app.get('/user/:username/projects/shared', authenticate, async (req, res) => {
    const username = req.params.username;

    try {
        const user = await User.findOne({ username: username }).exec();
        if (!user) {
            res.status(404).send('User not found');
            return;
        }

        // Fetch the projects shared with the user
        const projects = await Project.find({ workingBees: { $in: [username] } }).exec();

        // Map the projects to include only relevant information (projectId and projectTitle)
        const mappedProjects = projects.map(project => ({
            projectId: project.projectId,
            projectTitle: project.projectTitle
        }));

        res.json(mappedProjects);
    } catch (error) {
        console.error('Error fetching shared projects:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Handle request to get notification count and update notification badge on homepage
app.get('/user/:username/update-notification-badge', authenticate, async (req, res) => {
    const username = req.params.username;
    console.log(username);

    try {
        const user = await User.findOne({ username }).exec();

        if (!user) {
            res.status(404).send('User not found');
            return;
        }

        let unreadNotificationCount = 0;

        // Loop through the notifications array and count unread notifications
        for (let i = 0; i < user.notifications.length; i++) {
            const notificationId = user.notifications[i];
            const notification = await Notification.findById(notificationId).exec();
    
            if (notification && !notification.isRead) {
                unreadNotificationCount++;
            }
        }

        console.log(unreadNotificationCount);

        user.unreadNotifications = unreadNotificationCount.toString();
        await user.save();

        // Send count to client
        res.status(200).json({ unreadNotificationCount });

    } catch (error) {
        console.error('Error updating notification badge:', error);
        res.status(500).send('Internal Server Error');
    }
});

// POST Requests ------------------------------------------------------------------------------------------------------------

// Handle request to log into existing user account
app.post('/login', (req, res) => {
    let userData = req.body;
    let user = User.find({username: userData.username}).exec();

    user.then((results) => {
        if (results.length === 0) {
            console.log("User does not exist.");
            res.status(400).send("User does not exist.");
        } else {
            let currentUser = results[0];
            let toHash = userData.password + currentUser.salt;
            console.log(toHash);
            let h = crypto.createHash('sha3-256');
            let data = h.update(toHash, 'utf-8');
            let result = data.digest('hex');

            console.log(currentUser.salt);
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
    });
})

// Handle request to create new user account
app.post('/register', (req, res) => {
    let userData = req.body;
    let person = User.find({username: { $regex: userData.username, $options: "i" }}).exec();
    person.then((results) => {
        if (results.length == 0) {
            let newSalt = '' + Math.floor(Math.random() * 1000000000);
            let toHash = userData.password + newSalt;
            let h = crypto.createHash('sha3-256');
            let data = h.update(toHash, 'utf-8');
            let result = data.digest('hex');

            console.log(newSalt);
            console.log(toHash);
            console.log(result);

            const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            const d = new Date();
            let monthJoined = month[d.getUTCMonth()];
            let yearJoined = d.getUTCFullYear();
            let dateJoined = `${monthJoined} ${yearJoined}`;

            let newUser = new User({
                username: userData.username,
                firstName: userData.firstName,
                lastName: userData.lastName,
                displayName: userData.username,
                dateJoined: dateJoined,
                notifications: Array,
                hash: result,
                salt: newSalt,
                owned: Array,
                shared: Array 
            });
            let savedUser = newUser.save();
            savedUser.then(() => {
                console.log("Account successfully created.");
                console.log("New user: " + newUser);
                res.status(200).send("Account successfully created.");
            });
            savedUser.catch(() => {
                console.log("Issue creating account.");
                res.status(500).send("Issue creating account.");
            })
        } else {
            console.log("Username is taken.");
            res.status(400).send("Username is taken.");
        }
    })
    
})

// Handle request to log out and end session
app.post('/logout', (req, res) => {
    const username = req.body.username;
    if (username) {
        delete sessions[username];
        res.clearCookie('login');
        console.log(`User ${username} logged out.`);
        res.status(200).send('User logged out successfully.');
    } else {
        console.log('No user to log out.');
        res.status(400).send('No user to log out.');
    }
});

// Handle request to create project
app.post('/project/create', async (req, res) => {
    console.log('Received data:', req.body);
    const userData = req.body;

    try {
        const user = await User.findOne({ username: userData.username }).exec();

        if (!user) {
            console.log("User does not exist.");
            res.status(400).send("User does not exist.");
            return;
        }

        // Generate a unique project ID using uuid
        const newProjectId = uuid.v4();

        const newProject = new Project({
            projectId: newProjectId,
            queenBee: userData.username,
            workingBees: [],
            projectTitle: "New Project", // Provide a default title
            editorState: null, 
        });

        await newProject.save();

        // Update the user's "owned" array with the new project's ID
        user.owned.push(newProject._id);
        await user.save();

        // Send the JSON response with project information
        res.status(200).json({
            projectId: newProject.projectId,
            projectTitle: newProject.projectTitle
        });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).send("Error creating project.");
    }
});

// Handle request to modify the project title
app.post('/project/:projectId/modify-title', async (req, res) => {
    const projectId = req.params.projectId;
    const { newTitle } = req.body;

    try {
        const project = await Project.findOne({ projectId }).exec();

        if (!project) {
            console.log("Project not found.");
            res.status(404).send("Project not found.");
            return;
        }

        // Update the project title
        project.projectTitle = newTitle;
        await project.save();

        res.status(200).send("Project title modified successfully.");
    } catch (error) {
        console.error("Error modifying project title:", error);
        res.status(500).send("Error modifying project title.");
    }
});

// Handle request to delete a project
app.post('/project/:projectId/delete', async (req, res) => {
    const projectId = req.params.projectId;

    try {
        // Find and delete the project
        const deletedProject = await Project.findOneAndDelete({ projectId }).exec();

        if (!deletedProject) {
            console.log("Project not found.");
            res.status(404).send("Project not found.");
            return;
        }

        // Remove the project ID from the owner's "owned" array
        const owner = await User.findOne({ username: deletedProject.queenBee }).exec();
        owner.owned = owner.owned.filter(id => id.toString() !== deletedProject._id.toString());
        await owner.save();

        res.status(200).send("Project deleted successfully.");
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).send("Error deleting project.");
    }
});

// Handle request to invite a user to the project
async function createNotification(username, type, message) {
    try {
        const notification = new Notification({
            receiver: username,
            type: type,
            message: message,
        });

        await notification.save();

        return notification._id; // Return the ID of the created notification
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
}

app.post('/project/:projectId/invite-user', async (req, res) => {
    const projectId = req.params.projectId;
    const inviteeUsername = req.body.invitee;
    const inviterUsername = req.body.inviter; 

    try {
        const project = await Project.findOne({ projectId }).exec();

        if (!project) {
            console.log("Project not found.");
            res.status(404).send("Project not found.");
            return;
        }

        const inviteeUser = await User.findOne({ username: inviteeUsername }).exec();

        if (!inviteeUser) {
            console.log("User not found.");
            res.status(400).send("User not found.");
            return;
        }

        const inviterUser = await User.findOne({ username: inviterUsername }).exec();

        if (!inviterUser) {
            console.log("Inviter not found.");
            res.status(400).send("Inviter not found.");
            return;
        }

        // Customize the notification message
        const message = `${inviterUser.firstName} ${inviterUser.lastName} (@${inviterUser.username}) has invited you to collaborate on a new project!`;

        // Create a notification for the invitee
        const notificationId = await createNotification(inviteeUsername, 'New document shared! 🎉', message);

        // Add the notification ID to the invitee's notifications array
        inviteeUser.notifications.push(notificationId);
        await inviteeUser.save();

        // Add the project ID to the invitee's shared array
        inviteeUser.shared.push(project._id);
        await inviteeUser.save();

        // Add the invitee username to the project's workingBees array
        project.workingBees.push(inviteeUsername);
        await project.save();

        res.status(200).send("User invited successfully.");
    } catch (error) {
        console.error("Error inviting user:", error);
        res.status(500).send("Error inviting user.");
    }
});





app.listen(port, async () => {
    console.log(`Server is running at http://${hostname}:${port}`);
    
});
