"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EventType = exports.Environment = exports.ENV = exports.DeviceType = exports.ContentType = void 0;
Object.defineProperty(exports, "InstreamSdk", {
  enumerable: true,
  get: function get() {
    return _index["default"];
  }
});
exports.MappingType = void 0;
Object.defineProperty(exports, "OverlaySdk", {
  enumerable: true,
  get: function get() {
    return _index2["default"];
  }
});

var _index = _interopRequireDefault(require("./instreams/index"));
var _index2 = _interopRequireDefault(require("./overlays/index"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var EventType = {
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
exports.EventType = EventType;
var PlayerType = {
  'VIDEO_JS': 'VIDEO_JS',
  'SHAKA': 'SHAKA',
  'HLS': 'HLS',
  'AKAMAI': 'AKAMAI'
};
exports.PlayerType = PlayerType;
var Environment = {
  'SANDBOX': 'SANDBOX',
  'PRODUCTION': "PRODUCTION",
  'VIETTEL_PRODUCTION': "VIETTEL_PRODUCTION"
};
exports.Environment = Environment;
var DeviceType = {
  'PHONE': 'PHONE',
  'TV': 'TV',
  'WEB': 'WEB'
};
exports.DeviceType = DeviceType;
var ContentType = {
  'VOD': "VOD",
  "LIVESTREAM": "LIVESTREAM"
};
exports.ContentType = ContentType;
var Type = {
  'PROFILE': 'PROFILE',
  'OVERLAY': 'OVERLAY'
};
exports.Type = Type;