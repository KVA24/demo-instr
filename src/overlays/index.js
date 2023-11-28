"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _typeof(obj) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {writable: false});
  return Constructor;
}

function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return _typeof(key) === "symbol" ? key : String(key);
}

function _toPrimitive(input, hint) {
  if (_typeof(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (_typeof(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}

var started = false;
var version = "1.3.6";
var loaded = false;
var WI = /*#__PURE__*/function () {
  function WI(config) {
    _classCallCheck(this, WI);
    this.config = config;
    this.isEnded = false;
  }

  _createClass(WI, [{
    key: "start",
    value: function start() {
      this.init();
      document.querySelector('iframe#wiinvent-iframe').onload = function () {
        loaded = true;
      };
    }
  }, {
    key: "init",
    value: function init() {
      if (this.config.type === WI.Type.PROFILE) {
        showProfile(this.config);
        this.embedCallback(this.config);
      } else {
        var v;
        if (document.getElementById(this.config.domId).getElementsByTagName('video')[0]) {
          v = document.getElementById(this.config.domId).getElementsByTagName('video')[0];
        } else {
          v = document.getElementById(this.config.domId);
        }
        addIframe(v, this.config);
        this.embedCallback(this.config);
        if (this.config.playerType === WI.PlayerType.VIDEO_JS) {
          document.getElementsByClassName('vjs-control-bar')[0].style.zIndex = 2;
          document.getElementsByClassName('vjs-big-play-button')[0].style.zIndex = 2;
        } else if (this.config.playerType === WI.PlayerType.HLS) {
          var script = document.createElement('script');
          script.src = 'https://cdn.plyr.io/1.8.2/plyr.js';
          document.head.appendChild(script);
          var link = document.createElement("link");
          link.href = "https://cdn.plyr.io/1.8.2/plyr.css";
          link.type = "text/css";
          link.rel = "stylesheet";
          document.head.appendChild(link);
          var video = document.getElementById(this.config.domId);
          script.onload = function () {
            plyr.setup(video);
          };
        }
      }
      document.querySelector('iframe#wiinvent-iframe').onload = function () {
        loaded = true;
      };
    }
  }, {
    key: "stop",
    value: function stop() {
      var embed = document.getElementById("wiinvent-iframe");
      embed.remove();
      this.isEnded = true;
    }
  }, {
    key: "show",
    value: function show() {
      if (this.isEnded) {
        this.start();
        this.isEnded = false;
      }
      if (loaded) {
        var iframe = document.getElementById('wiinvent-iframe');
        iframe.style.opacity = 1;
        iframe.style.display = "";
      }
    }
  }, {
    key: "hide",
    value: function hide() {
      var iframe = document.getElementById('wiinvent-iframe');
      iframe.style.display = "none";
      iframe.style.opacity = 0;
    }
  }, {
    key: "requestAds",
    value: function requestAds() {
      var message = {
        'type': 'ADS_REQUEST',
        'data': {}
      };
      this.callToEmbed(message);
    }
  }, {
    key: "requestAdsWithVastLink",
    value: function requestAdsWithVastLink(vastLink) {
      var message = {
        'type': 'ADS_REQUEST_WITH_VAST_LINK',
        'data': {
          "vastLink": vastLink
        }
      };
      this.callToEmbed(message);
    }
  }, {
    key: "timeUpdate",
    value: function timeUpdate(currentTime) {
      var message = {
        'type': 'UPDATE_TIME',
        'data': {
          'currentSecond': currentTime || ""
        }
      };
      this.callToEmbed(message);
    }
  }, {
    key: "callToEmbed",
    value: function callToEmbed(message) {
      if (document.getElementById('wiinvent-iframe')) {
        var iframe = document.getElementById('wiinvent-iframe').contentWindow;
        iframe.postMessage(JSON.stringify(message), '*');
      }
    }
  }, {
    key: "embedCallback",
    value: function embedCallback(config) {
      var $that = this;
      var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
      var eventer = window[eventMethod];
      var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
      eventer(messageEvent, function (e) {
        var mess;
        try {
          mess = parseData(e.data);
          if (mess.type === "LOAD_CONFIG_SUCCESS") {
            showIframe();
            var iframe = document.getElementById('wiinvent-iframe');
            iframe.style.display = "block";
          } else if (mess.action === "click") {
            clickIframe(config);
          } else if (mess.type === "CLOSE_PROFILE_PAGE") {
            config.closeProfilePage();
          } else if (mess.type === "LOGIN") {
            if (config.onUserLogin) config.onUserLogin();
            if (config.login) config.login();
          } else if (mess.type === "DETAIL_VIDEO") {
            config.getVideoDetail(mess.data.videoId, mess.data.isLiveStream);
          } else if (mess.type === "DETAIL_CATEGORY") {
            config.getCategoryDetail(mess.data.categoryId);
          } else if (mess.type === "SET_DB") {
            if (mess.data) {
              localStorage.setItem(mess.data.key, JSON.stringify(mess.data.value));
            }
          } else if (mess.type == "GET_DB") {
            var message = {
              'type': 'GET_DB',
              'data': {
                'value': localStorage.getItem(mess.data.key)
              }
            };
            this.callToEmbed(message);
          } else if (mess.type === "ADS_REQUEST_START") {
            config.onAdsRequestStart(mess.data.campaignId);
          } else if (mess.type === "ADS_REQUEST_SUCCESS") {
            config.onAdsRequestSuccess(mess.data.campaignId);
          } else if (mess.type === "ADS_REQUEST_ERROR") {
            config.onAdsRequestError(mess.data.campaignId, mess.data.message);
          } else if (mess.type === "TOKEN_EXPIRE") {
            config.onTokenExpire();
          } else if (mess.type === "ADS_EVENT") {
            config.onAdsEvent(mess.data.eventType, mess.data.eventData);
            if (mess.data.eventType === WI.EventType.START && mess.data.eventData.isLinear) {
              document.getElementsByClassName('vjs-control-bar')[0].style.zIndex = 0;
              document.getElementsByClassName('vjs-big-play-button')[0].style.zIndex = 0;
            } else {
              document.getElementsByClassName('vjs-control-bar')[0].style.zIndex = 2;
              document.getElementsByClassName('vjs-big-play-button')[0].style.zIndex = 2;
            }
          } else if (mess.type === "OVELAY_DISPLAY") {
            var count = mess.data.count;
            if (count === 0) {
              $that.hide();
            } else {
              $that.show();
            }
          }
        } catch (e) {
        }
      });
    }
  }], [{
    key: "EventType",
    get: function get() {
      return {
        'REQUEST': 'REQUEST',
        'START': 'START',
        'IMPRESSION': 'IMPRESSION',
        "CLICK": "CLICK",
        'COMPLETE': 'COMPLETE',
        "SKIPPED": "SKIPPED",
        "USER_AD_BLOCK": "USER_AD_BLOCK",
        "VOLUME_MUTED": "VOLUME_MUTED",
        "VOLUME_ON": "VOLUME_ON",
        'ERROR': 'ERROR'
      };
    }
  }, {
    key: "PlayerType",
    get: function get() {
      return {
        'VIDEO_JS': 'VIDEO_JS',
        'SHAKA': 'SHAKA',
        'HLS': 'HLS',
        'AKAMAI': 'AKAMAI'
      };
    }
  }, {
    key: "Environment",
    get: function get() {
      return {
        'LOCAL': 'LOCAL',
        'SANDBOX': 'SANDBOX',
        'PRODUCTION': "PRODUCTION"
      };
    }
  }, {
    key: "DeviceType",
    get: function get() {
      return {
        'PHONE': 'PHONE',
        'TV': 'TV',
        'WEB': 'WEB'
      };
    }
  }, {
    key: "ContentType",
    get: function get() {
      return {
        'VOD': "VOD",
        "LIVESTREAM": "LIVESTREAM"
      };
    }
  }, {
    key: "Type",
    get: function get() {
      return {
        'PROFILE': 'PROFILE',
        'OVERLAY': 'OVERLAY'
      };
    }
  }, {
    key: "MappingType",
    get: function get() {
      return {
        'WI': "WI",
        "THIRDPARTY": "THIRDPARTY"
      };
    }
  }]);
  return WI;
}();
exports["default"] = WI;

function parseData(data) {
  if (!data) return {};
  if (_typeof(data) === 'object') return data;
  if (typeof data === 'string') return JSON.parse(data);
  return {};
}

function clickIframe(config) {
  var v;
  if (document.getElementById(config.domId).getElementsByTagName('video')[0]) {
    v = document.getElementById(config.domId).getElementsByTagName('video')[0];
  } else {
    v = document.getElementById(config.domId);
  }
  if (v.paused) {
    v.play();
  } else {
    v.pause();
  }
}

document.addEventListener("keydown", function (inEvent) {
  if (document.getElementById('wiinvent-iframe')) {
    var iframe = document.getElementById('wiinvent-iframe').contentWindow;
    if (iframe) {
      var message = {
        'type': 'TV_REMOTE',
        'data': {
          'keycode': inEvent.keyCode
        }
      };
      iframe.postMessage(JSON.stringify(message), '*');
    }
  }
});

function showProfile(config) {
  var env = config.env;
  var deviceType = config.deviceType || WI.DeviceType.WEB;
  var hostPath;
  if (env === WI.Environment.PRODUCTION) {
    hostPath = "https://embed.wiinvent.tv/profile.html";
  } else if (env === WI.Environment.SANDBOX) {
    hostPath = "https://dev.embed.wiinvent.tv/profile.html";
  } else {
    hostPath = "https://embed-wiinvent.tv360.vn/channel.html";
  }
  var tempId = gVI();
  var deviceId = config.deviceId;
  if (deviceId == '' || deviceId == null || deviceId == undefined) deviceId = tempId;
  var viewId = config.viewerId;
  if (viewId == '' || viewId == null || viewId == undefined) viewId = tempId;
  var url = "".concat(hostPath, "?thirdPartyToken=").concat(config.thirdPartyToken, "&deviceType=").concat(deviceType, "&accountId=").concat(config.tenantId, "&viewerId=").concat(viewId, "&deviceId=").concat(deviceId, "&version=").concat(version, "&os=WEB");
  var iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.setAttribute('allowtransparency', "true");
  iframe.setAttribute('id', "wiinvent-iframe");
  document.getElementById(config.domId).appendChild(iframe);
  var styles = "\n        #wiinvent-iframe {\n            border: none;\n            width: 100%;\n            height: 100%;\n          },\n        ";
  var styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

function addIframe(v, config) {
  var channelId = config.channelId || "-1";
  var streamId = config.streamId || "-1";
  var deviceType = config.deviceType || WI.DeviceType.WEB;
  var env = config.env || WI.Environment.SANDBOX;
  var contentType = config.contentType || WI.ContentType.VOD;
  var hostPath;
  if (env === WI.Environment.PRODUCTION) {
    hostPath = "https://embed.wiinvent.tv/profile.html";
  } else if (env === WI.Environment.SANDBOX) {
    hostPath = "https://dev.embed.wiinvent.tv/profile.html";
  } else {
    hostPath = "https://embed-wiinvent.tv360.vn/channel.html";
  }
  var tempId = gVI();
  var deviceId = config.deviceId;
  if (deviceId == '' || deviceId == null || deviceId == undefined) deviceId = tempId;
  var viewId = config.viewerId;
  if (viewId == '' || viewId == null || viewId == undefined) viewId = 0;
  var url = "".concat(hostPath, "?deviceType=").concat(deviceType, "&deviceId=").concat(deviceId, "&contentType=").concat(contentType, "&os=WEB&channelId=").concat(channelId, "&streamId=").concat(streamId, "&viewerId=").concat(viewId, "&accountId=").concat(config.tenantId, "&thirdPartyToken=").concat(config.thirdPartyToken, "&version=").concat(version);
  var iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.setAttribute('allowtransparency', "true");
  iframe.setAttribute('id', "wiinvent-iframe");
  if (v) {
    v.parentElement.style.position = "relative";
    v.parentElement.appendChild(iframe);
    iframe.style.display = "none";
  }
}

function showIframe() {
  var styles = "\n        #wiinvent-iframe {\n            position: absolute;\n            top: 0;\n            left: 0;\n            z-index: 1;\n            border: none;\n            width: 100%;\n            height: 100%;\n            background-color: unset;\n            opacity:0;\n          },\n        ";
  var styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

function seek(e) {
  var percent = e.offsetX / this.offsetWidth;
  wiinPlayer.currentTime = percent * wiinPlayer.duration;
  e.target.value = Math.floor(percent / 100);
  e.target.innerHTML = progressBar.value + '% played';
}

function playPauseVideo() {
  if (wiinPlayer.paused || wiinPlayer.ended) {
    changeButtonType(btnPlayPause, 'pause', '<i class="fa fa-pause"></i>');
    wiinPlayer.play();
  } else {
    changeButtonType(btnPlayPause, 'play', '<i class="fa fa-play"></i>');
    wiinPlayer.pause();
  }
}

function reWind(time) {
  wiinPlayer.currentTime += time;
  updateProgressBar();
}

function stopVideo() {
  wiinPlayer.pause();
  btnPlayPause.innerHTML = '<i class="fa fa-play"></i>';
  if (wiinPlayer.currentTime) wiinPlayer.currentTime = 0;
}

function muteVolume() {
  if (wiinPlayer.muted) {
    changeButtonType(btnMute, 'mute');
    wiinPlayer.muted = false;
  } else {
    changeButtonType(btnMute, 'unmute');
    wiinPlayer.muted = true;
  }
}

function replayVideo() {
  resetwiinPlayer();
  wiinPlayer.play();
}

function updateProgressBar() {
  var percentage = Math.floor(100 / wiinPlayer.duration * wiinPlayer.currentTime);
  progressBar.value = percentage;
  progressBar.innerHTML = percentage + '% played';
  document.getElementById('wiiin-player-result--current').innerHTML = secondsToHms(wiinPlayer.currentTime) + ' /';
}

function changeButtonType(btn, value) {
  btn.title = value;
  btn.className = value;
  if (value === "play") {
    btnPlayPause.innerHTML = '<i class="fa fa-play"></i>';
  }
  if (value === "pause") {
    btnPlayPause.innerHTML = '<i class="fa fa-pause"></i>';
  }
}

function resetwiinPlayer() {
  progressBar.value = 0;
  wiinPlayer.currentTime = 0;
  changeButtonType(btnPlayPause, 'pause');
}

function openFullScreen(config) {
  var v;
  if (document.getElementById(config.domId).getElementsByTagName('video')[0]) {
    v = document.getElementById(config.domId).getElementsByTagName('video')[0];
  } else {
    v = document.getElementById(config.domId);
  }
  var wiinPlayer = v;
  if (wiinPlayer.requestFullscreen) {
    wiinPlayer.requestFullscreen();
  } else if (wiinPlayer.mozRequestFullScreen) {
    wiinPlayer.mozRequestFullScreen();
  } else if (wiinPlayer.webkitRequestFullscreen) {
    wiinPlayer.webkitRequestFullscreen();
  } else if (wiinPlayer.msRequestFullscreen) {
    wiinPlayer.msRequestFullscreen();
  }
}

function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
  document.getElementById('btnFullScreen').onclick = function () {
    openFullScreen();
  };
  document.getElementById('btnFullScreen').innerHTML = " <i class=\"fas fa-expand\">";
}

function secondsToHms(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);
  if (s < 10) {
    s = "0" + s;
  }
  if (h > 0) {
    return h + ":" + m + ":" + s;
  } else if (m > 0) {
    return m + ":" + s;
  } else {
    return '0:' + s;
  }
}

var lastClickedId = null;
var itemArray = document.getElementsByClassName("item");

function addEventListeners() {
  for (var i = 0; i < itemArray.length; i++) {
    itemArray[i].addEventListener("mouseover", _onMouseOverEvent);
    itemArray[i].addEventListener("click", _onClickEvent);
    itemArray[i].addEventListener("keydown", function (e) {
      if (e.keyCode === 13) {
        _onClickEvent(e);
      }
    });
  }
}

function _onClickEvent(e) {
  if (lastClickedId) {
    document.getElementById(lastClickedId).classList.remove("clicked");
  }
  document.getElementById(e.target.id).classList.add("clicked");
  lastClickedId = e.target.id;
  console.log(lastClickedId + " is clicked!");
}

function _onMouseOverEvent(e) {
  for (var i = 0; i < itemArray.length; i++) {
    itemArray[i].blur();
  }
  document.getElementById(e.target.id).focus();
}

function gVI() {
  var viewId = localStorage.getItem("wiinvent-viewer-id");
  if (viewId == null || viewId == undefined) {
    viewId = cU();
    localStorage.setItem("wiinvent-viewer-id", viewId);
  }
  return viewId;
}

function cU() {
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
  });
  return uuid;
}