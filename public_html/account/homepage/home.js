const logoutButton = document.getElementById("logoutButton");

const username = getUsername();
const welcomeMessage = document.getElementById('welcomeMessage');
welcomeMessage.textContent = `Welcome, ${username}!`;

function getUsername() {
    const cookie = document.cookie;
    const cookiePairs = cookie.split('; ');

    let username = '';

    for (const cookiePair of cookiePairs) {
        const [name, value] = cookiePair.split('=');
        if (name === 'login') {
            const encodedData = decodeURIComponent(value);
            
            const jsonStart = encodedData.indexOf('{');
            const jsonData = encodedData.substring(jsonStart);

            const data = JSON.parse(jsonData);

            username = data.username;
            // console.log(data);
            return username;
        }
    }
}

function openNotifications() {
    // Add your notification logic here
    alert('Notifications opened!');
}

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
  }
  
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function logout() {
    console.log("log out");
    const user = getUsername();
    const userData = { username: user };
    console.log(user);
    let logout = fetch('/logout', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {"Content-Type": "application/json"}
    });
    logout.then(response => {
        if (response.status === 200) {
            console.log("Logout successful.");
            window.location.href = '/index'; // Redirect to the login page or homepage
        } else {
            console.error("Logout failed.");
        }
    })
    logout.catch(error => {
        console.error("Logout error:", error);
    });
}

logoutButton.addEventListener("click", logout);

