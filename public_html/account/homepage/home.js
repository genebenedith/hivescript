const logoutButton = document.getElementById("logoutButton");

const username = getUsername();
const welcomeMessage = document.getElementById('welcomeMessage');
welcomeMessage.textContent = `${username}'s Projects`;

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
            return username;
        }
    }
}

function createNewProjectCard() {
    const projectContainer = document.getElementById('projectContainer');

    const newProjectCard = document.createElement('div');
    newProjectCard.classList.add('project-card');

    const viewProject = document.createElement('div');
    viewProject.classList.add('viewProject');

    const projectTitle = document.createElement('span');
    projectTitle.classList.add('project-title');
    projectTitle.textContent = `New Project ${projectContainer.children.length}`;

    viewProject.appendChild(projectTitle);
    newProjectCard.appendChild(viewProject);

    projectContainer.appendChild(newProjectCard);

    newProjectCard.addEventListener('click', () => {
        console.log(`Clicked on ${projectTitle.textContent}`);
    });
}

function openNotifications() {
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

