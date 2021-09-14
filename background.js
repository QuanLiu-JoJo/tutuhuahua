var isShow = false;
var penColor = "black";
var drawWidth = 1;
var drawOpacity = 10;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.info) {
    case "isShow":
      isShow = request.value;
      break;
    case "initPen":
      sendResponse(
        JSON.stringify({
          canvasOpacity: drawOpacity,
          penColor,
          drawWidth,
        })
      );
    default:
  }
});
