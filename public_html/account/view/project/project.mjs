// views/project/project.mjs
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";

let savedContent = localStorage.getItem("projectContent") || ""; // Load saved content

let editor = new EditorView({
  state: EditorState.create({
    doc: savedContent,
    extensions: [basicSetup, javascript()],
  }),
  parent: document.body,
});

document.getElementById('saveButton').addEventListener('click', function() {
  // Get the content from the CodeMirror editor
  var content = editor.state.doc.toString();

  // Save the content to local storage or send it to the server, etc.
  // For now, we'll just log it to the console
  console.log('Saving content:', content);

  // Can also save it to local storage for later retrieval
  localStorage.setItem('savedContent', content);
});