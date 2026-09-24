export const workerMessageMap = new Map();
export var expectedResultMessageID = 0;

export function setExpectedResultMessageID(newMessageID)
//
{
  expectedResultMessageID = newMessageID;
}

export function reset()
//
{
  expectedResultMessageID = 0;
  pendingMessages = [];
}


var pendingMessages = [];


onmessage = onThreadMessage;


function dispatchMessage(message)
//Call the appropriate message-handling function
{
  workerMessageMap.get(message.data.msgId)(message.data.msgData);
}

function onThreadMessage(message)
//Process messages sent from the UI thread
{
  /*
  console.clear();
  console.log("Current Message: " + message.data.msgId);
  console.log("Expected Message: " + expectedResultMessageID);
  console.log("Pending Messages:");
  pendingMessages.forEach(msg => console.log(msg.data.msgId));
  console.log("\nStack:");
  mainVM.stack.forEach(item => console.log(item));
  */

  if(!expectedResultMessageID)
  {
    dispatchMessage(message);
    return;
  }

  if(message.data.msgId == expectedResultMessageID)
  {
    expectedResultMessageID = 0;

    dispatchMessage(message);
    if(expectedResultMessageID) return;

    while(pendingMessages.length)
    {
      dispatchMessage(pendingMessages.shift());
      if(expectedResultMessageID) return;
    }
  }
  else
    pendingMessages.push(message);
}

