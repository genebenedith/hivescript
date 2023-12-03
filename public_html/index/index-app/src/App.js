import './App.css';
import './index.css'
import React from "react";
import { useState, useEffect } from "react" ;
// import {Login_Active, Login_Inactive} from './Login_Components.js';
// import {CreateAccount_Active, CreateAccount_Inactive} from './CreateAccount_Components.js';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Fade from '@mui/material/Fade';
// import Grow from '@mui/material/Grow';
// import Box from '@mui/material/Box';
// import Paper from '@mui/material/Paper';
// import Slide from '@mui/material/Slide';
// import Zoom from '@mui/material/Zoom';
// import Switch from '@mui/material/Switch';
// import { alertClasses } from '@mui/material';
// import { Password } from 'primereact/password';
// import ReactCSSTransitionGroup from 'react-transition-group'; // ES6
import { motion } from "framer-motion"
const navigate=useNavigate();

var ReactCSSTransitionGroup = require('react-transition-group'); // ES5 with npm

const FADE_INTERVAL_MS = 1750

// type FadeHelper = { fade: 'fade-in' | 'fade-out' }

function App() {
  const [setting, setSetting] = React.useState(true);
  const [show, setShow] = useState({
    fade: 'fade-in',
  });
  const [pass, setPass] = useState('');
  const toggle = () => setSetting(!setting);

  const handleChange = (e) => {
    setSetting((old) => !old);
  };

  const handleSubmit = (e) => {
    if (setting){
      createUser(e)
    }
    else{
      login(e)
    }
  };


  
function login(event) {
  event.preventDefault(); // Prevent the form from submitting and the page from reloading
  
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  
  let userData = {
      username: username,
      password: password
  };
  
  let auth = fetch('/login', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {"Content-Type": "application/json"}
  });

  auth.then((response) => {
      if (response.status === 200) {
        alert("SUCCESS!!!!!")
          console.log("User successfully authenticated.");
          window.location.href = '/account/homepage/home.html';
      } else if (response.status === 500) {
          alert("Issue authenticating user.");
      } else if (response.status === 400) {
          console.log("Cannot find user.")
          alert("Cannot find user.");
      };
  });
  auth.catch((error) => {
      console.log("There was an error authenticating user. Try again.");
      console.log(error);
  });

  // document.getElementById("username").value = '';
  document.getElementById("password").value = '';
}


function createUser(event) {
  event.preventDefault(); // Prevent the form from submitting and the page from reloading
  
  var firstName = document.getElementById("firstName").value;
  var lastName  = document.getElementById("lastName").value;
  var username  = document.getElementById("newUsername").value;
  var password  = document.getElementById("newPassword").value;
  
  let userData = {
      firstName: firstName,
      lastName:  lastName,
      username:  username,
      password:  password
  }

  let add = fetch('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {"Content-Type": "application/json"}
  });
  add.then((response) => {
      if (response.status === 200) {
          console.log("Account successfully created.");
          // window.location.href = '/public_html/account/homepage/home.html';
      } else if (response.status === 500) {
          alert("Issue creating account.");
      } else if (response.status === 400) {
          console.log("Username is already taken.")
          alert("Username is already taken.");
      };
  });
  add.catch((error) => {
      console.log("There was an error creating the account. Try again.");
      console.log(error);
  });
  // document.getElementById("firstName").value = '';
  // document.getElementById("lastName").value = '';
  document.getElementById("newUsername").value = '';
  document.getElementById("newPassword").value = '';
}

  if (setting){
    return(
    <div id="bodyContainer">
      
    <link href='https://fonts.googleapis.com/css?family=Montserrat' rel='stylesheet'></link>
    <link rel="stylesheet" href="./index.css"></link>

    <div id="containBoth">
    {/* <motion.div
  animate={{
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
  }}
/> */}
      <div id="contain-login" class="eachContainer">
        {/* <Login_Active /> */}
        <div className="contain-login-ACTIVE">
          <link rel="stylesheet" href="./index.css"></link>
        <h1>Login</h1>
        <form>
          <input type="text" id="username" className="indexTextInput" name="username" placeholder='Username'></input>
          <br></br>
          <input type="text" id="password" className="indexTextInput" name="password" placeholder="Password"></input>
          <br></br>
          <input type="submit" className="indexPageButton-SUBMIT" id="loginButton" value="Login" onClick={login}></input>
        </form>
      </div>
      </div>
      <div id="contain-createUser" class="eachContainer">
        <div className="contain-createUser-INACTIVE"> 
          <img src="./hivescript_new_logo.png" alt="logo"></img>
          <h2>Welcome to HiveScript.</h2>
          <h3>New here?</h3>
          <button className="indexPageButton-SWITCH" onClick={handleChange}>Create Account</button>
        </div>
      </div>
      </div>  
    </div>  // end containBoth
    )
  }
  else{
    return (
      <div id="bodyContainer">
      
    <link href='https://fonts.googleapis.com/css?family=Montserrat' rel='stylesheet'></link>
    <link rel="stylesheet" href="./index.css"></link>

    <div id="containBoth">

      <div id="contain-login" class="eachContainer">
        <div className="contain-login-INACTIVE"> 
      <img src="./hivescript_new_logo.png" alt="logo"></img>
      <h2>Welcome to HiveScript.</h2>
          <h3>Have an account already?</h3>
          <button className="indexPageButton-SWITCH" onClick={handleChange}>Sign In</button>
    </div>


      </div>

      <div id="contain-createUser" class="eachContainer">
        {/* <CreateAccount_Active/> */}
        <div className="contain-createUser-ACTIVE">
        <h1 id="createTitle">
          Create Account
        </h1>
        <form>
          <input type="text" id="firstName" className="indexTextInput" name="firstName" placeholder='First Name'></input><br></br>
          <input type="text" id="lastName" className="indexTextInput" name="lastName" placeholder="Last Name"></input><br></br>
          <input type="text" id="newUsername" className="indexTextInput" name="username" placeholder='New username'></input><br></br>
          <input type="text" id="newPassword" className="indexTextInput" name="password" placeholder="New password"></input><br></br>
          <input type="submit" className="indexPageButton-SUBMIT" id="createAccount_SUMBIT" value="Create Account" onClick={createUser}></input> 
        </form>
       </div>
      </div>
      </div>  
    </div>  // end containBoth
    )
  }
}


///////////////   Functions that used to be in /public_html/index.js


function createUser(event) {
  event.preventDefault(); // Prevent the form from submitting and the page from reloading
  
  var username = document.getElementById("newUsername").value;
  var password = document.getElementById("newPassword").value;
  
  let userData = {
      username: username,
      password: password
  }

  let add = fetch('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {"Content-Type": "application/json"}
  });
  add.then((response) => {
      if (response.status === 200) {
          console.log("Account successfully created.");
          <a href="../../../account/homepage/home.html">Redirect to Html page</a>

          // window.location.href = '/public_html/account/homepage/home.html';
      } else if (response.status === 500) {
          alert("Issue creating account.");
      } else if (response.status === 400) {
          console.log("Username is already taken.")
          alert("Username is already taken.");
      };
  });
  add.catch((error) => {
      console.log("There was an error creating the account. Try again.");
      console.log(error);
  });

  document.getElementById("newUsername").value = '';
  document.getElementById("newPassword").value = '';
}


function login(event) {
  event.preventDefault(); // Prevent the form from submitting and the page from reloading
  
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  
  let userData = {
      username: username,
      password: password
  };
  
  let auth = fetch('/login', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {"Content-Type": "application/json"}
  });

  auth.then((response) => {
      if (response.status === 200) {
        alert("SUCCESS!!!!!")
          console.log("User successfully authenticated.");
          // window.location.pathname = '/public_html/account/homepage/home.html';

          
          // window.location.href = '/account/homepage/home.html';

      } else if (response.status === 500) {
          alert("Issue authenticating user.");
      } else if (response.status === 400) {
          console.log("Cannot find user.")
          alert("Cannot find user.");
      };
  });
  auth.catch((error) => {
      console.log("There was an error authenticating user. Try again.");
      console.log(error);
  });

  // document.getElementById("username").value = '';
  document.getElementById("password").value = '';
}

export default App;

