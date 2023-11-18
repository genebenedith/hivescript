import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";

let editor = new EditorView({
    doc: 'console.log("Hello world")',
    extensions: [
        basicSetup,
        javascript(),
    ],
    parent: document.body
});

// code-mirror/node_modules/.bin/rollup editor.mjs -f iife -o editor.bundle.js \
//   -p @rollup/plugin-node-resolve

