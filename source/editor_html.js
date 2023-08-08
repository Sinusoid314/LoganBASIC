const editorHTML =
`
<div id="menuBar" class="bar">
  <button id="newBtn">New</button>
  <button id="openFileBtn">Open File</button>
  <button id="openURLBtn">Open URL</button>
  <button id="saveBtn">Save</button>
  <div class="bar-seperator"></div>
  <button id="examplesBtn">Examples</button>
  <button id="helpBtn">Help</button>
  <button id="aboutBtn">About</button>
</div>

<div id="editorDiv">
  <label id="editorToggle" class="toggle-open">Code Editor</label>
  <div id="editorPane" class="pane-open">
    <div id="editorWrapper">
      <div id="editorGutter"></div>
      <textarea id="editorCode" wrap="off" spellcheck="false"></textarea>
    </div>
  </div>
</div>

<div id="commandBar" class="bar">
  <button id="runBtn">Run</button>
  <button id="stopBtn" disabled>Stop</button>
  <div class="bar-seperator"></div>
  <button id="debugToggleBtn">Debug</button>
  <div class="bar-seperator"></div>
</div>
`;

mainDiv.insertAdjacentHTML("afterbegin", editorHTML);