const canvasHTML = 
`
<div id="canvasDiv">
  <label id="canvasToggle" class="toggle-open">Canvas</label>
  <div id="canvasPane" class="pane-open">
    <canvas id="progCanvas" width=500 height=300 tabindex="0"></canvas>
  </div>
</div>
`;

mainDiv.insertAdjacentHTML("beforeend", canvasHTML);