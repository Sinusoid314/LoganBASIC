const debugHTML = 
`
<div id="debugDiv">
    <div id="debugResizer"></div>
  
    <div id="debugWrapper">
      <div id="debugBar" class="bar">
        <button id="debugResumeBtn" disabled>Resume</button>
        <div class="bar-seperator"></div>
        <button id="debugStepIntoBtn" disabled>Step Into</button>
        <button id="debugStepOverBtn" disabled>Step Over</button>
        <button id="debugStepOutBtn" disabled>Step Out</button>
        <button id="debugSkipBtn" disabled>Skip</button>
      </div>
  
      <div id="debugCallStackDiv" class="debugSubDiv">
        <label id="debugCallStackToggle" class="toggle-open">Call Stack</label>
        <div id="debugCallStackPane" class="pane-open">
          <select id="debugCallStackList" size="6"></select>
        </div>
      </div>
  
      <div id="debugLocalsDiv" class="debugSubDiv">
        <label id="debugLocalsToggle" class="toggle-open">Local Variables</label>
        <div id="debugLocalsPane" class="pane-open">
          <ul id="debugLocalsList" class="debugVarList"></ul>
        </div>
      </div>
  
      <div id="debugGlobalsDiv" class="debugSubDiv">
        <label id="debugGlobalsToggle" class="toggle-open">Global Variables</label>
        <div id="debugGlobalsPane" class="pane-open">
          <ul id="debugGlobalsList" class="debugVarList"></ul>
        </div>
      </div>
    </div>
  </div>
  `;

  mainDiv.insertAdjacentHTML("beforebegin", debugHTML);
