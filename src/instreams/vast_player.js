"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = playVastTag;
exports["destroy"] = destroy;
exports["destroyInit"] = destroyInit;
exports["changeSize"] = changeSize;

var _md = _interopRequireDefault(require("md5"));
var _imaAdPlayer = _interopRequireDefault(require("ima-ad-player"));
var bodyLog = {"campaignId": "-1", "vastNameId": "", "vastCampaignId": "", "mixId": "", "skipOffset": 8, "duration": 0}
var delayTimeShowSkip = 0
var pauseCheck = false
var isAllowBufferingTimeout = false
var isEnableErrorLog = false
var debugConsole = false
var playerGlobal = []
var setTimeoutTimer = []
var vastMediaBitrate = -1
var vastSkippable = false
var startTime = new Date().getTime()
var errorCode = 0
var errorMessage = ''

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {"default": obj};
}

function destroy() {
  debugConsole && console.log(playerGlobal)
  if (playerGlobal) {
    playerGlobal.destroy()
    callBackMessage('DESTROY')
  }
  pauseCheck = false
}

function destroyInit() {
  debugConsole && console.log(playerGlobal)
  if (playerGlobal) {
    playerGlobal.destroy()
  }
  pauseCheck = false
}

function changeSize(domId, video) {
  console.log(video.currentDimensions('width'))
  console.log(video.currentDimensions('height'))
  playerGlobal.resize(video.currentDimensions('width').width, video.currentDimensions('height').height)
}

function playVastTag(domId, vastInfo, video, config, gDi, sign) {
  _imaAdPlayer["default"]({
    video: config.playerType === "VIDEO" ? video.children()[0] : video.children[0],
    displayContainer: domId,
    tag: vastInfo,
    vpaidMode: _imaAdPlayer["default"].vpaidMode.INSECURE,
    locale: 'vi',
    debug: true,
    restoreVideo: true,
    adsRequestOptions: {
      vastLoadTimeout: config.vastLoadTimeout * 1000,
    },
    adsRenderingOptions: {
      loadVideoTimeout: config.mediaLoadTimeout * 1000,
      useStyledLinearAds: true,
      useStyledNonLinearAds: true,
      bitrate: config.bitrate
    },
    timeout: 2000,
  }, function (player, error) {
    domId.children[0].setAttribute("id", "wii_ads-screen")
    player.resize(video.currentDimensions('width').width, video.currentDimensions('height').height)
    playerGlobal = player
    debugConsole = config.debugConsole || false
    if (error) {
      return console.log(error);
    }
    player.on('ad_request', function (request) {
      debugConsole && console.log(request)
      bodyLog = {
        "campaignId": "-1",
        "vastNameId": "",
        "vastCampaignId": "",
        "mixId": "",
        "skipOffset": 8,
        "duration": 0
      }
      errorCode = 0
      errorMessage = ''
      delayTimeShowSkip = 0 
      pauseCheck = false
      isAllowBufferingTimeout = false
      isEnableErrorLog = false
      debugConsole = false
      setTimeoutTimer = []
      vastMediaBitrate = -1
      vastSkippable = false
      startTime = new Date().getTime()
      errorCode = 0
      errorMessage = ''
      callBackMessage('REQUEST')
      request.omidAccessModeRules = {};
      request.omidAccessModeRules[google.ima.OmidVerificationVendor.GOOGLE]
        = google.ima.OmidAccessMode.FULL;
      request.omidAccessModeRules[google.ima.OmidVerificationVendor.OTHER]
        = google.ima.OmidAccessMode.DOMAIN;
    });
    player.on('ads_rendering_settings', function (o) {
      debugConsole && console.log(o)
    })
    player.on('loaded', function (event) {
      player.resize(video.currentDimensions('width').width, video.currentDimensions('height').height)

      debugConsole && console.log(event)
      bodyLog.duration = event.data.ad.data.duration
      vastMediaBitrate = event.data.ad.data.vastMediaBitrate || -1
      vastSkippable = event.data.ad.data.skippable || false

      if (event.data.ad.data.adWrapperIds) {
        event.data.ad.data.adWrapperIds.forEach(item => {
          if (bodyLog.campaignId !== "-1") {
            return
          } else {
            const idInfo = item.split("|")
            if (idInfo.length >= 9 && idInfo[0] === "wiinvent") {
              bodyLog.campaignId = idInfo[1]
              bodyLog.vastCampaignId = idInfo[2]
              bodyLog.vastNameId = idInfo[3]
              bodyLog.mixId = idInfo[4]
              bodyLog.skipOffset = parseInt(idInfo[5])
              delayTimeShowSkip = parseInt(idInfo[6])
              isAllowBufferingTimeout = idInfo[7]
              isEnableErrorLog = idInfo[8]
            }
          }
        })
      } else if (event.data.ad.data.adId !== "") {
        const idInfo = event.data.ad.data.adId.split("|")
        if (idInfo.length >= 9 && idInfo[0] === "wiinvent") {
          bodyLog.campaignId = idInfo[1]
          bodyLog.vastCampaignId = idInfo[2]
          bodyLog.vastNameId = idInfo[3]
          bodyLog.mixId = idInfo[4]
          bodyLog.skipOffset = parseInt(idInfo[5])
          delayTimeShowSkip = parseInt(idInfo[6])
          isAllowBufferingTimeout = idInfo[7]
          isEnableErrorLog = idInfo[8]
        }
      }
      callBackMessage('LOADED')
    })
    player.on('ad_begin', function (o) {
      player.resize(video.currentDimensions('width').width, video.currentDimensions('height').height)
      debugConsole && console.log(o)
      domId.children[0].style.display = 'block';
      domId.children[0].style.zIndex = 3;
      showFullScreen(domId, player)
      if (config.playerType === "VIDEO") video.pause();
    });
    player.on('started', function (event) {
      player.resize(video.currentDimensions('width').width, video.currentDimensions('height').height)

      debugConsole && console.log(event)
      startTime = new Date().getTime()
      callClearTimeout()
      callSetTimeOut(config.bufferingVideoTimeout)
      callBackMessage('START')
      let skipOffset = 8
      if (config.partnerSkipOffset >= 1 && config.partnerSkipOffset <= 50) {
        skipOffset = config.partnerSkipOffset
      } else {
        skipOffset = bodyLog.skipOffset
      }
      setTimeout(function () {
        if (config.alwaysCustomSkip) {
          showSkipButton(config, gDi, sign, domId, player, skipOffset, config.isAutoRequestFocus);
        } else {
          if (!(event.data && vastSkippable)) {
            showSkipButton(config, gDi, sign, domId, player, skipOffset, config.isAutoRequestFocus);
          }
        }
      }, delayTimeShowSkip * 1000)
    });
    player.on('ad_progress', function (o) {
      debugConsole && console.log(o)
      callClearTimeout()
      callSetTimeOut(config.bufferingVideoTimeout)
      // callBackMessage('PROCESS')
    });
    player.on('ad_buffering', function (o) {
      debugConsole && console.log(o)
      callClearTimeout()
      callSetTimeOut(config.bufferingVideoTimeout)
      callBackMessage('BUFFERING')
    });
    player.on('paused', function (o) {
      debugConsole && console.log(o)
      callClearTimeout()
      callBackMessage('PAUSED')
      pauseCheck = true
    });
    player.on('resumed', function (o) {
      debugConsole && console.log(o)
      callClearTimeout()
      callBackMessage('RESUMED')
      pauseCheck = false
    });
    player.on('click', function (o) {
      debugConsole && console.log(o)
      callBackMessage('CLICK')
    });
    player.on('impression', function (o) {
      debugConsole && console.log(o)
      callBackMessage('IMPRESSION')
    });
    player.on('skipped', function (o) {
      debugConsole && console.log(o)
      callClearTimeout()
      callBackMessage('SKIPPED')
    });
    player.on('complete', function (o) {
      debugConsole && console.log(o)
      callClearTimeout()
      callBackMessage('COMPLETE')
    });
    player.on('all_ads_completed', function (o) {
      debugConsole && console.log(o)
      callClearTimeout()
      callBackMessage('All_ADS_COMPLETE')
      destroyInit()
    });
    player.on('error', function (o) {
      debugConsole && console.log(o)
      console.log(0)
      errorCode = o.data.errorCode || 0
      errorMessage = o.data.message || ''
      callBackMessage('PLAYER_ERROR')
      isEnableErrorLog && logError(config, gDi, sign, errorCode, errorMessage)
    });
    player.on('ad_error', function (o) {
      console.log(0)
      debugConsole && console.log(o)
      errorCode = o.data.error.data.errorCode || 0
      errorMessage = o.data.error.data.errorMessage || ''
      callBackMessage('ERROR')
      logError(config, gDi, sign, errorCode, errorMessage)
    });
    player.on('user_close', function (o) {
      debugConsole && console.log(o)
      callBackMessage('USER_CLOSE')
    });
    player.on('ad_end', function (o) {
      debugConsole && console.log(o)
      callClearTimeout()
      callBackMessage('END')
      domId.children[0].style.display = 'none';
      if (config.playerType === "VIDEO") video.play();
    });
    player.play();
  });
}

function showFullScreen(domId, player) {
  var nodeFS = document.createElement("button");
  nodeFS.setAttribute("id", "wii_button-fullscreen")
  nodeFS.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" height=\"1em\" viewBox=\"0 0 448 512\"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#ffffff}</style><path d=\"M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V352zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V352z\"/></svg>";
  nodeFS.style.color = '#ffffff';
  nodeFS.style.position = 'absolute';
  nodeFS.style.bottom = '10px';
  nodeFS.style.right = '20px';
  nodeFS.style.fontSize = '14px';
  nodeFS.style.background = 'transparent';
  nodeFS.style.border = 'none';
  nodeFS.style.cursor = 'pointer';
  domId.children[0].appendChild(nodeFS);
  nodeFS.addEventListener('click', function () {
    callBackMessage('FULLSCREEN')
  });
  player.on('complete', function () {
    removeNode(domId, 'wii_button-fullscreen')
  });
  player.on('ad_end', function () {
    removeNode(domId, 'wii_button-fullscreen')
  });
}

function showSkipButton(config, gDi, sign, domId, player, skipOffset, isAutoRequestFocus) {
  var skipTime = skipOffset;
  var node = document.createElement("button");
  node.setAttribute("id", "wii_button-skip")
  node.innerHTML = "B\u1ECF qua sau ".concat(skipTime, " giây");
  setInterval(function () {
    if (!pauseCheck) skipTime -= 1;
    if (skipTime > 0) {
      node.innerHTML = "B\u1ECF qua sau ".concat(skipTime, " giây");
    } else if (skipTime === 0) {
      // var styles = "\n #wii_button-skip:focus {" +
      //   "\n background: #ffffff !important;" +
      //   "\n color: #000000 !important;" +
      //   "\n border: none !important;" +
      //   "\n outline: none !important;" +
      //   "\n }," +
      //   "\n ";
      // var styleSheet = document.createElement("style");
      // styleSheet.type = "text/css";
      // styleSheet.innerText = styles;
      // document.head.appendChild(styleSheet);
      node.innerHTML = "B\u1ECF qua quảng cáo " + " &nbsp " + "<svg xmlns=\"http://www.w3.org/2000/svg\" height=\"1em\" viewBox=\"0 0 320 512\" font-size='14px'><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#ffffff}</style><path d=\"M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 241V96c0-17.7 14.3-32 32-32s32 14.3 32 32V416c0 17.7-14.3 32-32 32s-32-14.3-32-32V271l-11.5 9.6-192 160z\"/></svg>";
      node.style.cursor = 'pointer';
      node.style.border = '1px solid rgba(255,255,255,.5)';
      node.addEventListener('click', function () {
        callBackMessage('SKIPPED')
        player.stop()
        removeNode(domId, 'wii_button-skip')
        logSkip(config, gDi, sign);
      });
      node.addEventListener('mouseover', function () {
        node.style.background = "rgba(0,0,0,.9)"
        node.style.border = '1px solid rgb(255,255,255)';
      });
      node.addEventListener('mouseout', function () {
        node.style.background = "rgba(0,0,0,.7)"
        node.style.border = '1px solid rgb(255,255,255,.5)';
      });
      node.addEventListener('focus', function () {
        node.style.background = "#ffffff"
        node.style.color = "#000000"
        node.style.border = 'none';
        node.style.outline = 'none';
        node.innerHTML = "B\u1ECF qua quảng cáo " + " &nbsp " + "<svg xmlns=\"http://www.w3.org/2000/svg\" height=\"1em\" viewBox=\"0 0 320 512\" font-size='14px'><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#000000}</style><path d=\"M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 241V96c0-17.7 14.3-32 32-32s32 14.3 32 32V416c0 17.7-14.3 32-32 32s-32-14.3-32-32V271l-11.5 9.6-192 160z\"/></svg>";
      });
      if (isAutoRequestFocus) {
        node.focus()
      }
    } else return
  }, 1000);
  node.style.display = 'flex';
  node.style.justifyContent = 'center';
  node.style.alignItems = 'center';
  node.style.background = 'rgba(0,0,0,.7)';
  node.style.border = 'none';
  node.style.borderRadius = '5px';
  node.style.padding = '10px 15px';
  node.style.color = '#ffffff';
  node.style.position = 'absolute';
  node.style.bottom = '40px';
  node.style.right = '20px';
  node.style.zIndex = 3;
  node.style.opacity = '1';
  node.style.textAlign = 'center';
  node.style.fontFamily = 'sans-serif';
  node.style.fontStyle = '13px';
  node.style.fontWeight = 'normal';
  domId.children[0].appendChild(node);
  player.on('complete', function () {
    removeNode(domId, 'wii_button-skip')
  });
  player.on('ad_end', function () {
    removeNode(domId, 'wii_button-skip')
  });
}

function logSkip(config, gDi, sign,) {
  var host = "";
  if (config.env === "SANDBOX") {
    host = 'https://dev-pubads.wiinvent.tv';
  } else if (config.env === "PRODUCTION") {
    host = 'https://pubads.wiinvent.tv';
  } else {
    host = 'https://pubads-wiinvent.tv360.vn';
  }
  var url = host + "/v1/w/tracking/skip?si=".concat(sign, "&tid=").concat(config.tenantId, "&cid=").concat(bodyLog.campaignId, "&mid=").concat(bodyLog.mixId, "&d=").concat(gDi, "&pf=").concat(config.deviceType, "&vcid=").concat(bodyLog.vastCampaignId, "&vnid=").concat(bodyLog.vastNameId, "&sid=").concat(config.streamId, "&type=").concat("INSTREAM", "&du=").concat(bodyLog.duration, "&br=").concat(config.bitrate)
  fetch(url, {
    headers: {
      'Accept': '*/*',
      'User-Agent': 'request',
    }
  })
    .then(response => response.text())
    .then(text => console.log(text))
}

function logError(config, gDi, sign, erCode, erMes) {
  var host = "";
  if (config.env === "SANDBOX") {
    host = 'https://dev-pubads.wiinvent.tv';
  } else if (config.env === "PRODUCTION") {
    host = 'https://pubads.wiinvent.tv';
  } else {
    host = 'https://pubads-wiinvent.tv360.vn';
  }
  var url = host + "/v1/w/logs/error"
  const params =
    {
      "tid": config.tenantId,
      "cid": bodyLog.campaignId,
      "em": erMes,
      "ec": erCode,
      "br": config.bitrate,
      "vbr": vastMediaBitrate,
      "vsa": vastSkippable,
      "du": new Date().getTime() - startTime,
      "d": gDi,
      "mid": bodyLog.mixId,
      "pf": config.deviceType,
      "type": "INSTREAM",
      "si": gSi(config.tenantId, bodyLog.campaignId, bodyLog.mixId)
    }
  fetch(url, {
    headers: {
      'Accept': '*/*',
      'User-Agent': 'request',
      'Content-Type': 'application/json'
    },
    method: "POST",
    body: JSON.stringify(params)
  })
    .then(response => response.text())
    .then(text => console.log(text))
}

function callBackMessage(message) {
  const data = {
    "type": message,
    "campaignId": bodyLog.campaignId,
    "duration": bodyLog.duration,
    "errorCode": errorCode || '',
    "errorMessage": errorMessage || ''
  }
  window.parent.postMessage(data, "*")
}

function callSetTimeOut(time) {
  if (isAllowBufferingTimeout) {
    setTimeoutTimer = setTimeout(() => {
      playerGlobal.destroy();
    }, time * 1000)
  }
}

function callClearTimeout() {
  clearTimeout(setTimeoutTimer)
}

function removeNode(domId, node) {
  const remove = document.getElementById(node) || ''
  remove && domId.children[0].removeChild(remove);
}

function gSa(size) {
  var result = '';
  var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < size; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function gAdsK(tenantId, campaignId, mixId, salt) {
  var hash = (0, _md["default"])(tenantId + campaignId + mixId + salt);
  return hash;
}

function gSi(tenantId, campaignId, mixId) {
  var salt = gSa(20);
  var secret = gAdsK(tenantId, campaignId, mixId, salt)
  return salt + secret;
}