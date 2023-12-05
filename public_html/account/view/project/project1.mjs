const projectId = document.body.dataset.projectId; 

const sourceUser = {
    id: "source",
    label: "Source User",
    color: "orange"
  };
  
  const targetUser = {
    id: "target",
    label: "Target User",
    color: "pink"
  };
  
  console.log("pumpkin")
  const sourceEditor = initEditor("source-editor");
  const sourceSession = sourceEditor.getSession();
  
  const targetEditor = initEditor("target-editor");
  const targetSession = targetEditor.getSession();
  
  // targetEditor.setReadOnly(true);
  
  const targetCursorManagerForSource = new AceCollabExt.AceMultiCursorManager(targetEditor.getSession());
  targetCursorManagerForSource.addCursor(sourceUser.id, sourceUser.label, sourceUser.color, 0);
  
  const targetSelectionManagerForSource = new AceCollabExt.AceMultiSelectionManager(targetEditor.getSession());
  targetSelectionManagerForSource.addSelection(sourceUser.id, sourceUser.label, sourceUser.color, []);
  
  // for target 
  const targetCursorManagerForTarget = new AceCollabExt.AceMultiCursorManager(targetEditor.getSession());
  targetCursorManagerForTarget.addCursor(targetUser.id, targetUser.label, targetUser.color, 0);
  
  const targetSelectionManagerForTarget = new AceCollabExt.AceMultiSelectionManager(targetEditor.getSession());
  targetSelectionManagerForTarget.addSelection(targetUser.id, targetUser.label, targetUser.color, []);
  
  
  const radarView = new AceCollabExt.AceRadarView("target-radar-view", targetEditor);
  
  
  setTimeout(function() {
    // radarView.addView("fake1", "fake1",  "RoyalBlue", {start: 60, end: 75}, 50);
    // radarView.addView("fake2", "fake2",  "lightgreen", {start: 10, end: 50}, 30);
  
    const initialIndicesForSource = AceCollabExt.AceViewportUtil.getVisibleIndexRange(sourceEditor);
    const initialRowsForSource = AceCollabExt.AceViewportUtil.indicesToRows(sourceEditor, initialIndicesForSource.start, initialIndicesForSource.end);
    radarView.addView(sourceUser.id, sourceUser.label, sourceUser.color, initialRowsForSource, 0);
    
    const initialIndicesForTarget = AceCollabExt.AceViewportUtil.getVisibleIndexRange(targetEditor);
    const initialRowsForTarget = AceCollabExt.AceViewportUtil.indicesToRows(sourceEditor, initialIndicesForTarget.start, initialIndicesForTarget.end);
    radarView.addView(targetUser.id, targetUser.label, targetUser.color, initialRowsForTarget, 0);
  }, 0);
  
  sourceSession.getDocument().on("change", function(e) {
    targetEditor.getSession().getDocument().applyDeltas([e]);
  });
  
  sourceSession.on("changeScrollTop", function (scrollTop) {
    setTimeout(function () {
      const viewportIndicesForSource = AceCollabExt.AceViewportUtil.getVisibleIndexRange(sourceEditor);
      const rowsForSource = AceCollabExt.AceViewportUtil.indicesToRows(sourceEditor, viewportIndicesForSource.start, viewportIndicesForSource.end);
      radarView.setViewRows(sourceUser.id, rowsForSource);
    }, 0);
  });
  
  sourceSession.selection.on('changeCursor', function(e) {
    const cursorForSource = sourceEditor.getCursorPosition();
    targetCursorManagerForSource.setCursor(sourceUser.id, cursorForSource);
    radarView.setCursorRow(sourceUser.id, cursorForSource.row);
  });
  
  sourceSession.selection.on('changeSelection', function(e) {
    const rangesJsonForSource = AceCollabExt.AceRangeUtil.toJson(sourceEditor.selection.getAllRanges());
    const rangesForSource = AceCollabExt.AceRangeUtil.fromJson(rangesJsonForSource);
    targetSelectionManagerForSource.setSelection(sourceUser.id, rangesForSource);
  });
  
  // target session
  targetSession.getDocument().on("change", function(e) {
    targetEditor.getSession().getDocument().applyDeltas([e]);
  });
  
  targetSession.on("changeScrollTop", function (scrollTop) {
    setTimeout(function () {
      const viewportIndicesForTarget = AceCollabExt.AceViewportUtil.getVisibleIndexRange(targetEditor);
      const rowsForTarget = AceCollabExt.AceViewportUtil.indicesToRows(targetEditor, viewportIndicesForTarget.start, viewportIndicesForTarget.end);
      radarView.setViewRows(targetUser.id, rowsForTarget);
    }, 0);
  });
  
  targetSession.selection.on('changeCursor', function(e) {
    const cursorForTarget = targetEditor.getCursorPosition();
    targetCursorManagerForTarget.setCursor(targetUser.id, cursorForTarget);
    radarView.setCursorRow(targetUser.id, cursorForTarget.row);
  }); //
  
  targetSession.selection.on('changeSelection', function(e) {
    const rangesJsonForTarget = AceCollabExt.AceRangeUtil.toJson(targetEditor.selection.getAllRanges());
    const rangesForTarget = AceCollabExt.AceRangeUtil.fromJson(rangesJsonForTarget);
    targetSelectionManagerForTarget.setSelection(targetUser.id, rangesForTarget);
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
      console.error('Error fetching editor contents:', error);
      return null;
    }
}

async function saveEditorContents(editorContents) {
    try {
      const response = await fetch(`/project/${projectId}/save-contents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ editorContents }),
      });
  
      if (response.status === 200) {
        console.log('Editor contents saved successfully.');
      } else {
        console.error('Failed to save editor contents.');
      }
    } catch (error) {
      console.error('Error saving editor contents:', error);
    }
}
  
async function initEditor(id) {
    const editor = ace.edit(id);
    editor.setTheme('ace/theme/monokai');
  
    const session = editor.getSession();
    session.setMode('ace/mode/javascript');
  
    // Fetch editor contents from the server
    const editorContents = await fetchEditorContents(projectId);
  
    // Load the editor contents from the server using the project ID
    const response = await fetch(`/project/${projectId}/load-contents`);
    const data = await response.json();

    // Set the editor contents from the server
    session.setValue(data.editorContents);

    return editor;
}
  
document.getElementById('theme-selector').addEventListener('change', function () {
    const selectedTheme = this.value;
    updateEditorTheme(selectedTheme);
});
  
function updateEditorTheme(theme) {
    sourceEditor.setTheme(theme);
  
    targetEditor.setTheme(theme);
}
  
document.getElementById('save-button').addEventListener('click', async () => {
    await saveEditorContents(currentEditorContents);
});