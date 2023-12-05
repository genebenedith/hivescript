const loginButton = document.getElementById("loginButton");
const createAccountButton = document.getElementById("createAccountButton");

/* 
* Defines object for user with HTML input values 
* and send user data to server
*/

var createAccount_setting = false;
var login_setting = true;

function createUser(event) {
    event.preventDefault(); // Prevent the form from submitting and the page from reloading

    if (!createAccount_setting){
        goToCreateAccount(event);
        return;
    }

    var firstName = document.getElementById("firstName").value;
    var lastName = document.getElementById("lastName").value;
    var username = document.getElementById("newUsername").value;
    var password = document.getElementById("newPassword").value;
    
    let userData = {
        firstName: firstName,
        lastName: lastName,
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
            goToLogin(event);
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

/* Sends inputted information to server to process login authentication  
*/
function login(event) {
    event.preventDefault(); // Prevent the form from submitting and the page from reloading

    if (!login_setting){
        goToLogin(event);
        return;
    }

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
            console.log("User successfully authenticated.");
            window.location.href = '/public_html/account/homepage/home.html';
        } else if (response.status === 500) {
            alert("Incorrect password.");
        } else if (response.status === 400) {
            console.log("Cannot find user.");
            alert("Cannot find user.");
        };
    });
    auth.catch((error) => {
        console.log("There was an error authenticating user. Try again.");
        console.log(error);
    });

    document.getElementById("username").value = '';
    document.getElementById("password").value = '';
}


function goToCreateAccount(event){
    // alert("hello");
    //event.preventDefault();
    if (createAccount_setting){
        return;
    }
    createAccount_setting = true;
    login_setting = false;
    
    var back = document.getElementById("contain-createUser");
    document.getElementById("title").innerHTML = "";
    document.getElementById("login-form").innerHTML = "";
    const image=document.createElement("img");
    image.src = '/public_html/img/hivescript_new_logo.png';
    document.getElementById("login-imgContain").appendChild(image);
    document.getElementById("login-switchText1").innerHTML = '<h2>Welcome to HiveScript.</h2>';
    document.getElementById("login-switchText2").innerHTML = '<h3>Have an account?</h3>';
    // document.getElementById("login-buttonContain").innerHTML = '<button class="indexPageButton-SWITCH" id="loginButton">Login</button>'
    // loginButton = document.getElementById("loginButton");

    //////// now replace he components of the right-most div; the "creat user" side.
    document.getElementById("createTitle").innerHTML = "Create Account";
    document.getElementById("create-form").innerHTML = '<input type="text" id="firstName" class="indexTextInput-create" name="firstName" placeholder="First Name"><input type="text" id="lastName" class="indexTextInput-create" name="lastName" placeholder="Last Name"><input type="text" id="newUsername" class="indexTextInput-create" name="username" placeholder="New username"><input type="text" id="newPassword" class="indexTextInput-create" name="password" placeholder="New password">'; // <input type="submit" class="indexPageButton-SUBMIT" id="createAccount_SUMBIT" value="Create Account" onClick={createUser}></input>
    document.getElementById("create-imgContain").innerHTML = "";
    document.getElementById("create-switchText1").innerHTML = "";
    document.getElementById("create-switchText2").innerHTML = "";
}

function goToLogin(event){
    // event.preventDefault();
    if (login_setting){
        return;
    }
    login_setting=true;
    createAccount_setting=false;


    document.getElementById("title").innerHTML = "<br></br>Login";
    document.getElementById("login-form").innerHTML = '<input type="text" id="username" class="indexTextInput" name="username" placeholder="Username"><input type="text" id="password" class="indexTextInput" name="password" placeholder="Password">';
    document.getElementById("login-imgContain").innerHTML='';
    document.getElementById("login-switchText1").innerHTML = '';
    document.getElementById("login-switchText2").innerHTML = '';


    document.getElementById("createTitle").innerHTML="";
    document.getElementById("create-form").innerHTML="<form></form>";
    const image=document.createElement("img");
    image.src = '/public_html/img/hivescript_new_logo.png';
    document.getElementById("create-imgContain").appendChild(image);
    document.getElementById("create-switchText1").innerHTML="<h2>Welcome to HiveScript.</h2>";
    document.getElementById("create-switchText2").innerHTML='<h3>New here?</h3>';
}


// Event handlers for form submit buttons 
createAccountButton.addEventListener("click", createUser);
loginButton.addEventListener("click", login);
