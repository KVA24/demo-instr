"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _network = _interopRequireDefault(require("./network"));
var _ = require("..");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Api = /*#__PURE__*/function () {
  function Api(config) {
    _classCallCheck(this, Api);
    this.network = new _network["default"]();
    this.config = config;
  }
  _createClass(Api, [{
    key: "getHost",
    value: function getHost() {
      var that = this;
      if (that.config.env === _.ENV.SANDBOX) {
        return 'https://dev-pubads.wiinvent.tv';
      } else if (that.config.env === _.ENV.PRODUCTION) {
        return 'https://pubads.wiinvent.tv';
      } else {
        return 'https://pubads-wiinvent.tv360.vn';
      }
    }
  }, {
    key: "getCampaign",
    value: function getCampaign(url) {
      var that = this;
      var endpoint = this.getHost() + url;
      var headers = [['Content-Type', 'application/json'], ['X-Tenant-Id', that.config.wi_tenant_id]];
      return that.network.xhr(endpoint, headers, null, _.HTTP_METHOD.GET).then(function (data) {
        return data;
      }, function (error) {
        return error;
      });
    }
  }, {
    key: "getHtmlAd",
    value: function getHtmlAd(url) {
      var that = this;
      return that.network.xhr(url, null, null, _.HTTP_METHOD.GET);
    }
  }]);
  return Api;
}();
exports["default"] = Api;