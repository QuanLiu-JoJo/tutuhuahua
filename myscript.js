console.log("tutuhuahua script start");

let haveListenUnload = false;

let canvas = document.createElement("canvas");
canvas.style.position = "absolute";
canvas.style.top = 0;
canvas.style.left = 0;
canvas.style.zIndex = 9999;
canvas.style.visibility = "hidden";
canvas.id = "tuHuaCanvas";
document.body.appendChild(canvas);
let ctx = canvas.getContext("2d");
let pageWidth = document.body.clientWidth;
let pageHeight = document.body.clientHeight;
canvas.width = pageWidth;
canvas.height = pageHeight;

let canvasOpacity = 0.2;
let penColor = "black";
let drawWidth = 1;
chrome.runtime.sendMessage({ info: "initPen", value: 0 }, function (response) {
  let res = JSON.parse(response);
  // console.log(res);
  canvasOpacity = res.canvasOpacity / 10;
  penColor = res.penColor;
  drawWidth = res.drawWidth;
});

// 用于保存路径用于半透明线路绘制
let global_canvas = document.createElement("canvas");
let global_ctx = global_canvas.getContext("2d");
global_canvas.width = pageWidth;
global_canvas.height = pageHeight;

let haveReadHistory = false;
function readHistory() {
  var img = new Image();
  img.onload = function () {
    ctx.drawImage(img, 0, 0);
    global_ctx.drawImage(canvas, 0, 0);
  };
  img.src = localStorage.getItem(`canvas_content_for_${window.location.href}`);
  canvas.style.visibility = "visible";
  sendMessageToBg("isShow", true);
  listenUnload();
  haveReadHistory = true;
}

if (
  localStorage.getItem(`canvas_content_for_${window.location.href}`) !== null &&
  localStorage.getItem(`is_canvas_show_for_${window.location.href}`) ===
    "visible"
) {
  readHistory();
}

let isDraw = false;
let lastPoint = { x: undefined, y: undefined };

// 画线函数
function drawLine(x1, y1, x2, y2) {
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1; // 此处需用不透明的线画存下来的global_canvas
  ctx.drawImage(global_canvas, 0, 0);
  ctx.globalAlpha = canvasOpacity;
  ctx.strokeStyle = penColor;
  ctx.stroke();
}

canvas.addEventListener("mousedown", (e) => {
  isDraw = true;
  let [x, y] = [e.clientX + window.pageXOffset, e.clientY + window.pageYOffset];
  lastPoint = { x, y };
  ctx.beginPath();
});
canvas.addEventListener("mousemove", (e) => {
  if (isDraw) {
    // ctx.beginPath();
    ctx.lineWidth = drawWidth;
    ctx.globalAlpha = canvasOpacity;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    let [x, y] = [
      e.clientX + window.pageXOffset,
      e.clientY + window.pageYOffset,
    ];
    drawLine(lastPoint.x, lastPoint.y, x, y);
    lastPoint = { x, y };
    // ctx.closePath();
  }
});
canvas.addEventListener("mouseup", () => {
  global_ctx.clearRect(0, 0, global_canvas.width, global_canvas.height);
  global_ctx.drawImage(canvas, 0, 0);
  isDraw = false;
  ctx.closePath();
});

// get popup2content info
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // console.log(request.info, request.isShow);
  if (request.info === "tutuhuahua") {
    if (request.value) {
      if (!haveReadHistory) readHistory();
      canvas.style.visibility = "visible";
      // console.log("展现");
      if (!haveListenUnload) listenUnload();
    } else {
      canvas.style.visibility = "hidden";
    }
  }

  if (request.info == "clearCanvas") {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    global_ctx.clearRect(0, 0, canvas.width, canvas.height);
    localStorage.removeItem(`canvas_content_for_${window.location.href}`);
  }

  if (request.info == "colorChange") {
    penColor = request.value;
    ctx.strokeStyle = penColor;
  }

  if (request.info == "widthChange") {
    drawWidth = request.value;
    ctx.lineWidth = drawWidth;
  }

  if (request.info == "opacityChange") {
    canvasOpacity = request.value;
    ctx.globalAlpha = canvasOpacity;
  }
});

function sendMessageToBg(type, value) {
  chrome.runtime.sendMessage({ info: type, value }, function (response) {});
}

function listenUnload() {
  let listenId = window.addEventListener("unload", () => {
    let dataurl = canvas.toDataURL("image/png");
    localStorage.setItem(`canvas_content_for_${window.location.href}`, dataurl);
    localStorage.setItem(
      `is_canvas_show_for_${window.location.href}`,
      canvas.style.visibility
    );
    sendMessageToBg("isShow", false);
  });
  haveListenUnload = true;
  return listenId;
}
