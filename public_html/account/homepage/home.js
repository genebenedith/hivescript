const username = getUsername();
const welcomeMessage = document.getElementById('welcomeMessage');
welcomeMessage.textContent = `${username.slice(0,1).toUpperCase()}${username.slice(1).toLowerCase()}'s Projects`;

document.addEventListener('DOMContentLoaded', () => {
    fetchUserProjects();

    // Add an event listener for the "Create New Project" card
    const createNewProjectCard = document.getElementById("createNewProjectCard");
    createNewProjectCard.addEventListener("click", createNewProject);
});

function fetchUserProjects() {
    const username = getUsername();

    fetch(`/user/${username}/projects`)
        .then(response => response.json())
        .then(projects => {
            // Display the fetched projects
            displayUserProjects(projects);
        })
        .catch(error => console.error('Error fetching user projects:', error));
}

function displayUserProjects(projects) {
    const projectContainer = document.getElementById('projectContainer');

    projects.forEach(project => {
        const projectCard = createProjectCard(project);
        projectContainer.appendChild(projectCard);
    });
}

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

function getFirstName() {
    const cookie = document.cookie;
    const cookiePairs = cookie.split('; ');

    let firstName = '';

    for (const cookiePair of cookiePairs) {
        const [name, value] = cookiePair.split('=');
        if (name === 'login') {
            const encodedData = decodeURIComponent(value);
            
            const jsonStart = encodedData.indexOf('{');
            const jsonData = encodedData.substring(jsonStart);

            const data = JSON.parse(jsonData);

            firstName = data.firstName;
            return firstName;
        }
    }
}

function createProjectCard(project) {
    const projectCard = document.createElement('div');
    projectCard.classList.add('project-card');

    // Save the project ID and title as custom data attributes
    projectCard.dataset.projectId = project ? project.projectId : '';
    projectCard.dataset.projectTitle = project ? project.projectTitle : '';

    const viewProject = document.createElement('div');
    viewProject.classList.add('viewProject');

    const projectTitle = document.createElement('span');
    projectTitle.classList.add('project-title');
    projectTitle.textContent = project ? project.projectTitle : 'New Project'; // Provide a default title

    viewProject.appendChild(projectTitle);

    // Add pencil icon for modifying project title
    const editIcon = document.createElement('i');
    editIcon.classList.add('fas', 'fa-pencil-alt', 'edit-icon');
    viewProject.appendChild(editIcon);

    // Add trash icon for deleting the project
    const deleteIcon = document.createElement('i');
    deleteIcon.classList.add('fas', 'fa-trash-alt', 'delete-icon');
    viewProject.appendChild(deleteIcon);

    projectCard.appendChild(viewProject);

    projectCard.addEventListener('click', () => {
        const clickedProjectId = projectCard.dataset.projectId;

        // Make a request to the server to fetch project details
        fetch(`/project/${clickedProjectId}`)
            .then(response => {
                if (response.status === 200) {
                    window.location.href = `/project/${clickedProjectId}`;
                } else {
                    console.error('Error fetching project details:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error fetching project details:', error);
            });
    });

    // Handle edit icon click (modify project title)
    editIcon.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent the click from triggering the project card click
        modifyProjectTitle(projectCard);
    });

    // Handle delete icon click (delete project)
    deleteIcon.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent the click from triggering the project card click
        deleteProject(projectCard);
    });

    return projectCard;
}

function modifyProjectTitle(projectCard) {
    // Implement logic to modify the project title here
    const projectId = projectCard.dataset.projectId;
    const newTitle = prompt('Enter the new project title:');
    if (newTitle !== null) {
        // Make a request to the server to update the project title
        fetch(`/project/${projectId}/modify-title`, {
            method: 'POST',
            body: JSON.stringify({ newTitle }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(response => {
                if (response.status === 200) {
                    // Update the UI with the new title
                    projectCard.dataset.projectTitle = newTitle;
                    projectCard.querySelector('.project-title').textContent = newTitle;
                } else {
                    console.error('Error modifying project title:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error modifying project title:', error);
            });
    }
}

function deleteProject(projectCard) {
    // Implement logic to delete the project here
    const projectId = projectCard.dataset.projectId;

    // Make a request to the server to delete the project
    fetch(`/project/${projectId}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => {
            if (response.status === 200) {
                // Remove the project card from the UI
                projectCard.remove();
            } else {
                console.error('Error deleting project:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Error deleting project:', error);
        });
}

function createNewProject() {
    // Handle the logic for creating a new project
    console.log("Create New Project clicked!");

    // Make a request to the server to create a new project
    fetch('/project/create', {
        method: 'POST',
        body: JSON.stringify({ username: getUsername() }),
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => response.json())
        .then(newProject => {
            // Create and append the new project card
            const projectCard = createProjectCard(newProject);
            const projectContainer = document.getElementById('projectContainer');
            projectContainer.appendChild(projectCard);
        })
        .catch(error => console.error('Error creating a new project:', error));
}

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function visitProfile(tab) {
    const username = getUsername();
    console.log(tab);

        // Make a request to the server to fetch user profile
        fetch(`/profile/${username}?tab=${tab}`)
            .then(response => {
                if (response.status === 200) {
                    console.log("soda");
                    window.location.href = `/profile/${username}?tab=${tab}`;
                } else {
                    console.log("pie");
                    console.error('Error fetching user profile:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error fetching user profile:', error);
            });
        console.log('done?');
}

function logout() {
    console.log("log out");
    const user = getUsername();
    const userData = { username: user };
    let logout = fetch('/logout', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: { "Content-Type": "application/json" }
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
