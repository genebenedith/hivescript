const projectId = document.body.dataset.projectId; 
const inviteUserButton = document.getElementById("inviteUser");
const username = getUsername();
const activeIds = new Set();

let ws = new WebSocket(`ws://${window.location.host}`);
ws.addEventListener('open', (event) => {
    console.log('WebSocket connection opened.');
});

async function main() {
    const info = await getUserInfo(); 
    const displayName = info.displayName;
    
    const currentUser = {
        id: `${username}`,
        label: `${displayName}`,
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
        const initialIndicesForTarget = AceCollabExt.AceViewportUtil.getVisibleIndexRange(targetEditor);
        const initialRowsForTarget = AceCollabExt.AceViewportUtil.indicesToRows(targetEditor, initialIndicesForTarget.start, initialIndicesForTarget.end);
        radarView.addView(currentUser.id, currentUser.label, currentUser.color, initialRowsForTarget, 0);
    }, 0);

    ws.addEventListener('close', (event) => {
        console.log('WebSocket closed. Reconnecting...');
        setTimeout(() => {
            ws.close();
            ws = new WebSocket(`ws://${window.location.host}`);
        }, 1000);
    });

    ws.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
        // Handle the error as needed
    });
    
    
    function debounce(func, delay) {
        let timeout;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    const debouncedEditorSend = debounce(() => {
        const editorContents = targetSession.getValue();
        const message = {
            type: 'editor-update', 
            id: currentUser.id,
            content: editorContents
        };
        console.log(`Editor contents sent from @${username}!`);
        ws.send(JSON.stringify(message));
    }, 0);

    const debouncedCursorSend = debounce(() => {
        const cursorForTarget = targetEditor.getCursorPosition();

        const rangesJson = AceCollabExt.AceRangeUtil.toJson(targetEditor.selection.getAllRanges());
        const ranges = AceCollabExt.AceRangeUtil.fromJson(rangesJson);
        
        const viewportIndices = AceCollabExt.AceViewportUtil.getVisibleIndexRange(targetEditor);
        const rows = AceCollabExt.AceViewportUtil.indicesToRows(targetEditor, viewportIndices.start, viewportIndices.end);

        const message = {
            type: 'cursor-update',
            id: currentUser.id,
            cursorPosition: cursorForTarget,
            cursorLabel: currentUser.label,
            cursorColor: currentUser.color,
            rows: rows,
            ranges: ranges
        };
        console.log(`Cursor Information sent from @${username}: ${JSON.stringify(message)}.`);
        ws.send(JSON.stringify(message));
    }, 0);

    const debouncedScrollbarSend = debounce(() => {
        const cursorForTarget = targetEditor.getCursorPosition();
        const viewportIndices = AceCollabExt.AceViewportUtil.getVisibleIndexRange(targetEditor);
        const rows = AceCollabExt.AceViewportUtil.indicesToRows(targetEditor, viewportIndices.start, viewportIndices.end);
        
        const message = {
            type: 'scrollbar-update',
            id: currentUser.id,
            cursorPosition: cursorForTarget,
            cursorLabel: currentUser.label,
            cursorColor: currentUser.color,
            rows: rows
        };

        console.log(`Scrollbar Information sent: ${JSON.stringify(message)}.`)
        ws.send(JSON.stringify(message));
    }, 0);

    const debouncedSelectionSend = debounce(() => {
        const cursorForTarget = targetEditor.getCursorPosition();
        
        const rangesJson = AceCollabExt.AceRangeUtil.toJson(targetEditor.selection.getAllRanges());
        const ranges = AceCollabExt.AceRangeUtil.fromJson(rangesJson);
        
        const viewportIndices = AceCollabExt.AceViewportUtil.getVisibleIndexRange(targetEditor);
        const rows = AceCollabExt.AceViewportUtil.indicesToRows(targetEditor, viewportIndices.start, viewportIndices.end);
        
        const message = {
            type: 'selection-update',
            id: currentUser.id,
            cursorPosition: cursorForTarget,
            cursorLabel: currentUser.label,
            cursorColor: currentUser.color,
            rows: rows,
            ranges: ranges
        };

        console.log(`Selection Information sent from @${username}: ${JSON.stringify(message)}.`)
        ws.send(JSON.stringify(message));
    }, 0);
    
    targetSession.getDocument().on("change", function(e) {
        if (ws.readyState === WebSocket.OPEN) {
            debouncedEditorSend();
            
        } else {
            console.error('WebSocket is not in OPEN state.');
        }
        
    });

    targetSession.selection.on('changeCursor', function (e) {
        const cursorForTarget = targetEditor.getCursorPosition();
        console.log(currentUser, cursorForTarget);
        targetCursorManagerForTarget.setCursor(currentUser.id, cursorForTarget);
        radarView.setCursorRow(currentUser.id, cursorForTarget.row);
        console.log("pieee 3");
        console.log(e);

        if (ws.readyState === WebSocket.OPEN) {
            console.log("lakes");
            debouncedCursorSend();
        } else {
            console.error('WebSocket is not in OPEN state.');
        }
    });

    targetSession.on("changeScrollTop", function (scrollTop) {
        setTimeout(function () {
            const viewportIndicesForTarget = AceCollabExt.AceViewportUtil.getVisibleIndexRange(targetEditor);
            const rowsForTarget = AceCollabExt.AceViewportUtil.indicesToRows(targetEditor, viewportIndicesForTarget.start, viewportIndicesForTarget.end);
            radarView.setViewRows(currentUser.id, rowsForTarget);
            console.log("pieee 2");
        }, 0);

        if (ws.readyState === WebSocket.OPEN) {
            debouncedScrollbarSend();
        } else {
            console.error('WebSocket is not in OPEN state.');
        }
    });

    targetSession.selection.on('changeSelection', function(e) {
        const rangesJsonForTarget = AceCollabExt.AceRangeUtil.toJson(targetEditor.selection.getAllRanges());
        const rangesForTarget = AceCollabExt.AceRangeUtil.fromJson(rangesJsonForTarget);
        targetSelectionManagerForTarget.setSelection(currentUser.id, rangesForTarget);
        
        if (ws.readyState === WebSocket.OPEN) {
            debouncedSelectionSend();
        } else {
            console.error('WebSocket is not in OPEN state.');
        }
    }); 

    ws.addEventListener('message', (event) => {
        const receivedMessage = JSON.parse(event.data);

        switch (receivedMessage.type) {
            case 'editor-update':
                if (receivedMessage.id !== currentUser.id) {
                    if (receivedMessage.content !== targetSession.getValue()) {
                        console.log(`Editor contents sent from @${receivedMessage.id}!`);
                        targetSession.setValue(receivedMessage.content);
                        console.log(currentUser);
                        targetCursorManagerForTarget.setCursor(currentUser.id, receivedMessage.cursorPosition);
                        console.log(targetEditor.getCursorPosition());
                    }
                    break;
                }
            case 'cursor-update':
                console.log('Received cursor-update:', receivedMessage.id, receivedMessage.cursorPosition, receivedMessage.cursorLabel, receivedMessage.cursorColor);
                if (!activeIds.has(receivedMessage.id)) {
                    console.log('Setting cursor:', receivedMessage.id, receivedMessage.cursorPosition, receivedMessage.cursorLabel, receivedMessage.cursorColor);
                    activeIds.add(receivedMessage.id);

                    const ranges = AceCollabExt.AceRangeUtil.jsonToRanges(receivedMessage.ranges);
                    
                    targetCursorManagerForTarget.addCursor(receivedMessage.id, receivedMessage.cursorLabel, receivedMessage.cursorColor, 0);
                    targetCursorManagerForTarget.setCursor(receivedMessage.id, receivedMessage.cursorPosition);
                    targetSelectionManagerForTarget.addSelection(receivedMessage.id, receivedMessage.cursorLabel, receivedMessage.cursorColor, ranges);

                    radarView.addView(receivedMessage.id, receivedMessage.cursorLabel, receivedMessage.cursorColor, receivedMessage.cursorPosition, receivedMessage.cursorPosition.row);
                    radarView.setViewRows(receivedMessage.id, receivedMessage.rows);
                } else {
                    console.log('Updating cursor row:', receivedMessage.id, receivedMessage.cursorPosition.row);
                    
                    const ranges = AceCollabExt.AceRangeUtil.jsonToRanges(receivedMessage.ranges);
                    
                    targetCursorManagerForTarget.setCursor(receivedMessage.id, receivedMessage.cursorPosition);
                    targetSelectionManagerForTarget.setSelection(receivedMessage.id, ranges);

                    radarView.setCursorRow(receivedMessage.id, receivedMessage.cursorPosition.row);
                }
                break;
            case 'scrollbar-update':
                if (receivedMessage.id !== currentUser.id) {
                    if (!activeIds.has(receivedMessage.id)) {
                        console.log('Setting cursor:', receivedMessage.id, receivedMessage.cursorPosition, receivedMessage.cursorLabel, receivedMessage.cursorColor);
                        activeIds.add(receivedMessage.id);

                        radarView.addView(receivedMessage.id, receivedMessage.cursorLabel, receivedMessage.cursorColor, receivedMessage.cursorPosition, receivedMessage.cursorPosition.row);
                        radarView.setViewRows(receivedMessage.id, receivedMessage.rows);
                    } else {
                        console.log('Updating scrollbar:', receivedMessage.id, receivedMessage.cursorPosition.row);
                        
                        radarView.setViewRows(receivedMessage.id, receivedMessage.rows);
                    }
                    break;
                }
            case 'selection-update':
                if (!activeIds.has(receivedMessage.id)) {
                    console.log('Setting cursor:', receivedMessage.id, receivedMessage.cursorPosition, receivedMessage.cursorLabel, receivedMessage.cursorColor);
                    activeIds.add(receivedMessage.id);

                    const ranges = AceCollabExt.AceRangeUtil.jsonToRanges(receivedMessage.ranges);
                    
                    targetCursorManagerForTarget.addCursor(receivedMessage.id, receivedMessage.cursorPosition);
                    targetSelectionManagerForTarget.addSelection(receivedMessage.id, receivedMessage.cursorLabel, receivedMessage.cursorColor, ranges);

                    radarView.addView(receivedMessage.id, receivedMessage.cursorLabel, receivedMessage.cursorColor, receivedMessage.cursorPosition, receivedMessage.cursorPosition.row);
                    radarView.setViewRows(receivedMessage.id, receivedMessage.rows);
                } else {
                    console.log('Updating selection:', receivedMessage.id, receivedMessage.cursorPosition.row);
                
                    const ranges = AceCollabExt.AceRangeUtil.jsonToRanges(receivedMessage.ranges);

                    targetSelectionManagerForTarget.setSelection(receivedMessage.id, ranges);

                    radarView.setViewRows(receivedMessage.id, receivedMessage.rows);
                    
                    radarView.setCursorRow(receivedMessage.id, receivedMessage.cursorPosition.row);
                    
                }
                break;
            }
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
            body: JSON.stringify({ editorContents: editorContents, inviter: username }),
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
    };
    
    
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