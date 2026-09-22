export function mountDialog(targetElement, insertPosition = "beforeend")
//
{
  document.head.appendChild(aboutDialogStyle);
  targetElement.insertAdjacentElement(insertPosition, aboutDialog);
}

export function showDialog()
//
{
  aboutDialog.showModal();
}


const templateCSS =
`
<style id="aboutDialogStyle">
  #aboutDialog
  {
    margin-block: auto;
    margin-inline: 20%;
  }

  #aboutIcon
  {
    float: left;
  }

  #aboutForm
  {
    margin-inline: 2em;
    text-align: center;
  }

  #aboutForm ul
  {
    display: block;
    text-align: left;
    margin-top: 0;
    margin-inline: 5em;
    font-weight: bolder;
    border: 0px solid black;
  }

  #aboutForm ul li
  {
    margin-block: 0.3em;
  }

  #aboutCloseBtn
  {
    padding-inline: 1.5em;
    padding-block: 0.5em;
  }
</style>
`;


const templateHTML =
`
<dialog id="aboutDialog" class="buttonFace buttonFaceReleased">
  <form id="aboutForm" method="dialog">
    <div id="aboutContent">
      <h1><img id="aboutIcon" src="./favicon.ico"> Welcome to Logan BASIC!</h1>
      <p>
        Logan BASIC is an online version of the <a href="https://en.wikipedia.org/wiki/BASIC" target="_blank">BASIC programming language</a>
        that creates both text-based and graphics-based programs that run directly in the web browser.
        <br><br>
        To get started, you can:
        <ul>
          <li>Check out the <a href="./examples/examples.html" target="_blank">example programs</a>.</li>
          <li>Browse the <a href="./docs/help/help.html" target="_blank">help files</a>.</li>
          <li>Write your code in the Code Editor, hit the Run button, and watch your program come to life!</li>
        </ul>
        Send any questions, comments, or bug reports to <a href="mailto:sinusoid314@gmail.com">sinusoid314@gmail.com</a>.
        <br>
        See more of my projects at <a href="https://sinusoft.com" target="_blank">sinusoft.com</a>
      </p>
    </div>
    <button id="aboutCloseBtn" type="submit">Close</button>
  </form>
</dialog>
`;


var aboutDialogStyle;
var aboutDialog;


createStyles();
createElements();


function createStyles()
//
{
  const template = document.createElement("template");
  template.innerHTML = templateCSS;

  aboutDialogStyle = template.content.getElementById("aboutDialogStyle");
}

function createElements()
//
{
  const template = document.createElement("template");
  template.innerHTML = templateHTML;

  aboutDialog = template.content.getElementById("aboutDialog");
}
