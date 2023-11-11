
const loginButton = document.getElementById("loginButton");
const createAccountButton = document.getElementById("createAccountButton");

/* 
* Defines object for user with HTML input values 
* and send user data to server
*/
function createUser(event) {
    event.preventDefault(); // Prevent the form from submitting and the page from reloading
    
    var username = document.getElementById("newUsername").value;
    var password = document.getElementById("newPassword").value;
    
    let userData = {
        username: username,
        password: password
    }

    let add = fetch('/user/create', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {"Content-Type": "application/json"}
    });
    add.then((response) => {
        if (response.status === 200) {
            console.log("Account successfully created.");
            window.location.href = '/account/home.html';
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
    
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    
    let userData = {
        username: username,
        password: password
    };
    
    let auth = fetch('/user/login/', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {"Content-Type": "application/json"}
    });

    auth.then((response) => {
        if (response.status === 200) {
            console.log("User successfully authenticated.");
            window.location.href = '/account/home.html';
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

    document.getElementById("username").value = '';
    document.getElementById("password").value = '';
}


// Event handlers for form submit buttons 
createAccountButton.addEventListener("click", createUser);
loginButton.addEventListener("click", login);