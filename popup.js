const bg = chrome.extension.getBackgroundPage();
if (bg.isShow) {
  document.querySelector(".switch").checked = true;
  sendMessage("tutuhuahua", bg.isShow);
}

document.querySelector(".switch").addEventListener("change", (e) => {
  console.log("触发");
  bg.isShow = e.target.checked;
  // popup ---> content
  sendMessage("tutuhuahua", bg.isShow);
});

document.querySelector(".myButton").addEventListener("click", (e) => {
  sendMessage("clearCanvas");
});

function sendMessage(type, value = "") {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      let message = {
        info: type,
        value: value,
      };
      // 后面这段必须得有，不然无法建立连接
      chrome.tabs.sendMessage(tabs[0].id, message, (res) => {
        console.log("popup=>content");
        console.log(res);
      });
    }
  );
}

let aColorBtn = document.getElementsByClassName("color-item");
let colorGroup = document.querySelector(".color-group");
colorGroup.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    for (let i = 0; i < aColorBtn.length; i++) {
      aColorBtn[i].classList.remove("active");
    }
    e.target.classList.add("active");
    activeColor = e.target.style.backgroundColor;
    bg.penColor = activeColor;
    sendMessage("colorChange", bg.penColor);
  }
});
if (bg.penColor) {
  sendMessage("colorChange", bg.penColor);
  for (let i = 0; i < aColorBtn.length; i++) {
    aColorBtn[i].classList.remove("active");
    if (bg.penColor === aColorBtn[i].style.backgroundColor)
      aColorBtn[i].classList.add("active");
  }
}

let fontSize = document.querySelector(".drawWidth input");
fontSize.addEventListener("change", (e) => {
  bg.drawWidth = parseInt(e.target.value);
  fontSize.value = bg.drawWidth;
  sendMessage("widthChange", bg.drawWidth);
});
sendMessage("widthChange", bg.drawWidth);
fontSize.value = bg.drawWidth;

let opacity = document.querySelector(".drawOpacity input");
opacity.addEventListener("change", (e) => {
  console.log(e.target.value);
  bg.drawOpacity = parseInt(e.target.value);
  opacity.value = bg.drawOpacity;
  sendMessage("opacityChange", bg.drawOpacity / 10);
});
sendMessage("opacityChange", bg.drawOpacity / 10);
opacity.value = bg.drawOpacity;

/**
 * Temporary workaround for secondary monitors on MacOS where redraws don't happen
 * @See https://bugs.chromium.org/p/chromium/issues/detail?id=971701
 */
// help.js 防止mac外接屏幕pop卡顿问题
if (
  window.screenLeft < 0 ||
  window.screenTop < 0 ||
  window.screenLeft > window.screen.width ||
  window.screenTop > window.screen.height
) {
  chrome.runtime.getPlatformInfo(function (info) {
    if (info.os === "mac") {
      const fontFaceSheet = new CSSStyleSheet();
      fontFaceSheet.insertRule(`
            @keyframes redraw {
              0% {
                opacity: 1;
              }
              100% {
                opacity: .99;
              }
            }
          `);
      fontFaceSheet.insertRule(`
            html {
              animation: redraw 1s linear infinite;
            }
          `);
      document.adoptedStyleSheets = [
        ...document.adoptedStyleSheets,
        fontFaceSheet,
      ];
    }
  });
}
