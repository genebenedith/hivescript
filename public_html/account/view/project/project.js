// const statesEl = document.getElementById("states");
//         const saveStateEl = document.getElementById("saveState");
//         const loadStateEl = document.getElementById("loadState");

//         // Create an initial state for the view
//         const initialState = cm6.createEditorState("function foo() {\n    console.log(123);\n}");
//         const view = cm6.createEditorView(initialState, document.getElementById("editor"));
//         let states = { "Initial State": initialState };

//         function populateSelect() {
//             statesEl.innerHTML = "";

//             for (let key of Object.keys(states)) {
//                 var option = document.createElement("option");
//                 option.value = key;
//                 option.text = key;
//                 statesEl.appendChild(option);
//             }
//         }

//         let stateNum = 1;
//         function saveState() {
//             let stateName = `Saved State ${stateNum++}`;
//             states[stateName] = view.state;
//             populateSelect();
//             statesEl.value = stateName;
//         }

//         function loadState() {
//             view.setState(states[statesEl.value])
//         }

//         populateSelect();

import * as Y from 'yjs';
import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next';
import { WebrtcProvider } from 'y-webrtc';

import { EditorState } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { basicSetup } from '@codemirror/basic-setup';
import { javascript } from '@codemirror/lang-javascript';
import * as random from 'lib0/random';
import { EditorView } from '@codemirror/view';

export const usercolors = [
  { color: '#30bced', light: '#30bced33' },
  { color: '#6eeb83', light: '#6eeb8333' },
  { color: '#ffbc42', light: '#ffbc4233' },
  { color: '#ecd444', light: '#ecd44433' },
  { color: '#ee6352', light: '#ee635233' },
  { color: '#9ac2c9', light: '#9ac2c933' },
  { color: '#8acb88', light: '#8acb8833' },
  { color: '#1be7ff', light: '#1be7ff33' }
]

export const userColor = usercolors[random.uint32() % usercolors.length]

const ydoc = new Y.Doc()
const provider = new WebrtcProvider('codemirror6-demo-room-2', ydoc)
const ytext = ydoc.getText('codemirror')

provider.awareness.setLocalStateField('user', {
  name: 'Anonymous ' + Math.floor(Math.random() * 100),
  color: userColor.color,
  colorLight: userColor.light
})

const state = EditorState.create({
  doc: ytext.toString(),
  extensions: [
    keymap.of([
      ...yUndoManagerKeymap
    ]),
    basicSetup,
    javascript(),
    yCollab(ytext, provider.awareness)
  ]
})

const view = new EditorView({ state, parent: /** @type {HTMLElement} */ (document.querySelector('#editor')) })

// Additional Code for Saving and Loading States

// Additional Code for Saving and Loading States

const statesEl = document.getElementById("states");
const saveStateEl = document.getElementById("saveState");
const loadStateEl = document.getElementById("loadState");

let states = { "Initial State": state };

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

saveStateEl.addEventListener('click', saveState);
loadStateEl.addEventListener('click', loadState);