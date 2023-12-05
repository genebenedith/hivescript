const projectId = document.body.dataset.projectId; 
const inviteUserButton = document.getElementById("inviteUser");
const username = getUsername();



// const ws = new WebSocket(`ws://${window.location.host}`);

// ws.addEventListener('open', (event) => {
//     console.log('WebSocket connection opened.');
// });

// ws.addEventListener('message', (event) => {
//     // Handle incoming messages (live updates) from the server
//     const message = JSON.parse(event.data);

//     // Example: Update the target user's label
//     currentUser.label = message.label;

//     // Update your UI or perform other actions based on the incoming message
// });

async function main() {
    const info = await getUserInfo(); 
    const displayName = info.displayName;
    
    const currentUser = {
        id: "current",
        label: `${displayName}`,
        // label: "",
        color: getRandomColor()
    };
    
    const editorContents = await fetchEditorContents();

    const targetEditor = initEditor("target-editor");
    const targetSession = targetEditor.getSession();

    // for target 
    const targetCursorManagerForTarget = new AceCollabExt.AceMultiCursorManager(targetEditor.getSession());
    targetCursorManagerForTarget.addCursor(currentUser.id, currentUser.label, currentUser.color, 0);

    const targetSelectionManagerForTarget = new AceCollabExt.AceMultiSelectionManager(targetEditor.getSession());
    targetSelectionManagerForTarget.addSelection(currentUser.id, currentUser.label, currentUser.color, []);


    const radarView = new AceCollabExt.AceRadarView("target-radar-view", targetEditor);


    setTimeout(function() {
        radarView.addView("fake1", "fake1",  "RoyalBlue", {start: 60, end: 75}, 50);
        radarView.addView("fake2", "fake2",  "lightgreen", {start: 10, end: 50}, 30);

        const initialIndicesForTarget = AceCollabExt.AceViewportUtil.getVisibleIndexRange(targetEditor);
        const initialRowsForTarget = AceCollabExt.AceViewportUtil.indicesToRows(targetEditor, initialIndicesForTarget.start, initialIndicesForTarget.end);
        radarView.addView(currentUser.id, currentUser.label, currentUser.color, initialRowsForTarget, 0);
    }, 0);

    // target session
    targetSession.getDocument().on("change", function(e) {
        const editorContents = targetSession.getValue();
    });
    
    targetSession.on("changeScrollTop", function (scrollTop) {
        setTimeout(function () {
        const viewportIndicesForTarget = AceCollabExt.AceViewportUtil.getVisibleIndexRange(targetEditor);
        const rowsForTarget = AceCollabExt.AceViewportUtil.indicesToRows(targetEditor, viewportIndicesForTarget.start, viewportIndicesForTarget.end);
        radarView.setViewRows(currentUser.id, rowsForTarget);
        }, 0);
    });
    
    targetSession.selection.on('changeCursor', function(e) {
        const cursorForTarget = targetEditor.getCursorPosition();
        targetCursorManagerForTarget.setCursor(currentUser.id, cursorForTarget);
        radarView.setCursorRow(currentUser.id, cursorForTarget.row);
    }); //
    
    targetSession.selection.on('changeSelection', function(e) {
        const rangesJsonForTarget = AceCollabExt.AceRangeUtil.toJson(targetEditor.selection.getAllRanges());
        const rangesForTarget = AceCollabExt.AceRangeUtil.fromJson(rangesJsonForTarget);
        targetSelectionManagerForTarget.setSelection(currentUser.id, rangesForTarget);
    }); 
    
    async function fetchEditorContents() {
        try {
            const response = await fetch(`/project/${projectId}/load-contents`);
            if (response.status === 200) {
                const data = await response.json();
                return data.editorContents;
            } else {
                console.error('Failed to fetch editor contents.');
                return null;
            }
        } catch (error) {
            console.error('Failed to fetch editor contents:', error);
            return null;
        }
    }

    function saveEditorContents(editorContents) {
        let save = fetch(`/project/${projectId}/save-contents`, {
            method: 'POST',
            body: JSON.stringify({ editorContents }),
            headers: {"Content-Type": "application/json"}
        });

        save.then((response) => {
            if (response.status === 200) {
                console.log('Editor contents saved successfully.');
            } else if (response.status === 500) {
                console.log('Failed to save editor contents.');
            } else if (response.status === 404) {
                console.log('Cannot find project.')
            };
        });
        save.catch((error) => {
            console.log("There was an error saving editor contents. Try again.");
            console.log(error);
        });

    }
    
    function initEditor(id) {
        const editor = ace.edit(id);
        editor.setTheme('ace/theme/monokai');
    
        const session = editor.getSession();
        session.setMode('ace/mode/javascript');
    
        // Set the editor contents from the server
        session.setValue(editorContents);
        return editor;
    }
    
    document.getElementById('theme-selector').addEventListener('change', function () {
        const selectedTheme = this.value;
        updateEditorTheme(selectedTheme);
    });
    
    function updateEditorTheme(theme) {
        console.log("change theme");
        targetEditor.setTheme(theme);
    }
    
    document.getElementById('save-button').addEventListener('click', async () => {
        await saveEditorContents(targetSession.getValue());
    });
}

main();

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

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

function getUserInfo() {
    return fetch(`/user/${username}`, {
        method: 'GET',
        headers: { "Content-Type": "application/json" }
    })
        .then((response) => {
            if (response.status === 200) {
                console.log("User info successfully retrieved.");
                return response.json();
            } else if (response.status === 404) {
                console.log("Cannot find user.");
            }
        })
        .then((data) => {
            if (data) {
                return data.user;
            }
        })
        .catch((error) => {
            console.log("There was an error fetching user information. Try again later.");
            console.log(error);
        });
}


inviteUserButton.addEventListener('click', inviteUser);