const statesEl = document.getElementById("states");
const saveStateButton = document.getElementById("saveState");
const loadStateButton = document.getElementById("loadState");
const inviteUserButton = document.getElementById("inviteUser");
const projectId = document.body.dataset.projectId;
const username = getUsername();

// Create an initial state for the view
const initialState = cm6.createEditorState("function foo() {\n    console.log(123);\n}");
const view = cm6.createEditorView(initialState, document.getElementById("editor"));
let states = { "Initial State": initialState };

function populateSelect() {
    statesEl.innerHTML = "";

    for (let key of Object.keys(states)) {
        var option = document.createElement("option");
        option.value = key;
        option.text = key;
        statesEl.appendChild(option);
    }
}

let stateNum = 1;
function saveState() {
    let stateName = `Saved State ${stateNum++}`;
    states[stateName] = view.state;
    populateSelect();
    statesEl.value = stateName;
}

function loadState() {
    view.setState(states[statesEl.value])
}

populateSelect();

function inviteUser(event) {
    const inviteeUsername = document.getElementById("inviteeUsername").value;
    const inviteResponseElement = document.getElementById("inviteResponse");

    event.preventDefault();

    // Send a POST request to the server to invite the user
    fetch(`/project/${projectId}/invite-user`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ invitee: inviteeUsername, inviter: username }),
    })
    .then(result => {
        if (result.status === 200) {
            // Invite successfully sent
            inviteResponseElement.innerText = "Invite successfully sent";
        } else if (result.status === 404) {
            // Project not found
            inviteResponseElement.innerText = "Project not found";
        } else if (result.status === 400) {
            // Could not find user
            inviteResponseElement.innerText = "Could not find user";
        } else {
            // An issue occurred
            inviteResponseElement.innerText = "An issue occurred. Please try again later";
        }
    })
    .catch(error => {
        console.error("Error inviting user:", error);
        // Log or handle the error appropriately
        inviteResponseElement.innerText = "An issue occurred. Please try again later";
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

inviteUserButton.addEventListener('click', inviteUser);
saveStateButton.addEventListener('click', saveState);
loadStateButton.addEventListener('click', loadState);

