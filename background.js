var isShow = false;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.info) {
    case "isShow":
      isShow = request.value;
      break;
    default:
  }
});

var penColor = "black";
var drawWidth = 1;
var drawOpacity = 10;
