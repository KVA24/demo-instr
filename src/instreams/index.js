"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true,
});

var _api = _interopRequireDefault(require("./network/api"));
var _vast_player = _interopRequireDefault(require("./vast_player"));
var _md = _interopRequireDefault(require("md5"));

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

function _typeof(obj) {
	"@babel/helpers - typeof";
	return (
		(_typeof =
			"function" == typeof Symbol && "symbol" == typeof Symbol.iterator
				? function (obj) {
						return typeof obj;
				  }
				: function (obj) {
						return obj &&
							"function" == typeof Symbol &&
							obj.constructor === Symbol &&
							obj !== Symbol.prototype
							? "symbol"
							: typeof obj;
				  }),
		_typeof(obj)
	);
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
	Object.defineProperty(Constructor, "prototype", { writable: false });
	return Constructor;
}

function _defineProperty(obj, key, value) {
	key = _toPropertyKey(key);
	if (key in obj) {
		Object.defineProperty(obj, key, {
			value: value,
			enumerable: true,
			configurable: true,
			writable: true,
		});
	} else {
		obj[key] = value;
	}
	return obj;
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

var WiiSdk = /*#__PURE__*/ (function () {
	function WiiSdk(config) {
		_classCallCheck(this, WiiSdk);
		this.config = config;
		_defineProperty(this, "videoRef", void 0);
		_defineProperty(this, "ads", void 0);
		this.videoRef = document.getElementById(this.config.domId);
		this.ads = this.loadCampaign(this.config);
		this.api = new _api["default"](this.config);
		this.start();
	}

	_createClass(WiiSdk, [
		{
			key: "start",
			value: function start() {
				const remove = document.getElementById("wii_ads-screen") || "";
				remove && this.destroyInit();
				const video = this.videoRef.getElementsByTagName("video");
				video[0].pause();
				this.render(this.videoRef, this.ads);
			},
		},
		{
			key: "loadCampaign",
			value: function loadCampaign() {
				var host = "";
				if (this.config.env === WI.Environment.SANDBOX) {
					host = "https://dev-pubads.wiinvent.tv";
				} else if (this.config.env === WI.Environment.PRODUCTION) {
					host = "https://pubads.wiinvent.tv";
				} else {
					host = "https://pubads-wiinvent.tv360.vn";
				}
				var sign = this.gSi(
					this.config.streamId,
					this.gDI(),
					this.config.tenantId
				);
				var url =
					host +
					"/v1/adserving/instr/campaign/1.0/vmap?sid="
						.concat(this.config.streamId, "&cid=")
						.concat(this.config.channelId, "&p=")
						.concat(this.config.deviceType, "&d=")
						.concat(this.gDI(), "&t=")
						.concat(this.config.tenantId, "&si=")
						.concat(sign);
				return url;
			},
		},
		{
			key: "gSi",
			value: function gSi(streamId, deviceId, tenantId) {
				var salt = this.gSa(20);
				var secret = this.gAdsK(streamId, deviceId, tenantId, salt);
				return salt + secret;
			},
		},
		{
			key: "gAdsK",
			value: function gAdsK(streamId, deviceId, tenantId, salt) {
				var hash = (0, _md["default"])(streamId + deviceId + tenantId + salt);
				return hash;
			},
		},
		{
			key: "gSa",
			value: function gSa(size) {
				var result = "";
				var characters = "abcdefghijklmnopqrstuvwxyz0123456789";
				var charactersLength = characters.length;
				for (var i = 0; i < size; i++) {
					result += characters.charAt(
						Math.floor(Math.random() * charactersLength)
					);
				}
				return result;
			},
		},
		{
			key: "gDI",
			value: function gDI() {
				var viewId = localStorage.getItem("wiinvent-viewer-id");
				if (viewId == null || viewId == undefined) {
					viewId = this.cU();
					localStorage.setItem("wiinvent-viewer-id", viewId);
				}
				return viewId;
			},
		},
		{
			key: "cU",
			value: function cU() {
				var dt = new Date().getTime();
				var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
					/[xy]/g,
					function (c) {
						var r = (dt + Math.random() * 16) % 16 | 0;
						dt = Math.floor(dt / 16);
						return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
					}
				);
				return uuid;
			},
		},
		{
			key: "render",
			value: function render(componentHtml, campaignInfo) {
				_vast_player["default"](
					componentHtml,
					campaignInfo,
					this.config.player,
					this.config,
					this.gDI(),
					this.gSi(this.config.streamId, this.gDI(), this.config.tenantId)
				);
			},
		},
		{
			key: "destroy",
			value: function destroy() {
				_vast_player["destroy"]();
			},
		},
		{
			key: "destroyInit",
			value: function destroyInit() {
				_vast_player["destroyInit"]();
			},
		},
		{
			key: "changeSize",
			value: function changeSize() {
				_vast_player["changeSize"](this.videoRef, this.config.player);
			},
		},
	]);
	return WiiSdk;
})();
exports["default"] = WiiSdk;
