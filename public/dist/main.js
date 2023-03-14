/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isReady = exports.getMarkers = exports.setupVideoStream = exports.setupDetector = void 0;
var video;
var mediaDevices = {};
var detector;
var posit;
var modelSize = 35.0; //millimeters
function setupDetector() {
    detector = new window.AR.Detector({
        dictionaryName: 'ARUCO_4X4_1000'
    });
    posit = new window.POS.Posit(modelSize, windowWidth);
}
exports.setupDetector = setupDetector;
function setupVideoStream() {
    video = document.getElementById("video");
    if (navigator.mediaDevices != undefined) {
        mediaDevices = navigator.mediaDevices;
    }
    if (!mediaDevices.getUserMedia) {
        mediaDevices.getUserMedia = function (constraints) {
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }
            return new Promise(function (resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        };
    }
    mediaDevices
        .getUserMedia({ video: true })
        .then(function (stream) {
        if ("srcObject" in video) {
            video.srcObject = stream;
        }
        else {
            video.src = window.URL.createObjectURL(stream);
        }
    })
        .catch(function (err) {
        console.log(err.name + ": " + err.message);
    });
}
exports.setupVideoStream = setupVideoStream;
function getMarkers() {
    var canvas = document.createElement('canvas');
    canvas.width = windowWidth;
    canvas.height = windowHeight;
    var ctx = canvas.getContext('2d');
    ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    var imageData = ctx === null || ctx === void 0 ? void 0 : ctx.getImageData(0, 0, canvas.width, canvas.height);
    return detector.detect(imageData);
}
exports.getMarkers = getMarkers;
;
function isReady() {
    return video.readyState === video.HAVE_ENOUGH_DATA;
}
exports.isReady = isReady;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/// <reference path="../node_modules/@types/p5/global.d.ts"/>
Object.defineProperty(exports, "__esModule", ({ value: true }));
var AR_helper_1 = __webpack_require__(1);
var capture;
window.setup = function () {
    createCanvas(windowWidth, windowHeight);
    capture = createCapture(VIDEO);
    capture.hide();
    AR_helper_1.setupVideoStream();
    AR_helper_1.setupDetector();
    frameRate(10);
};
window.draw = function () {
    if (AR_helper_1.isReady()) {
        image(capture, 0, 0, windowWidth, windowHeight);
        var markers = AR_helper_1.getMarkers();
        console.log(markers);
        strokeWeight(2);
        stroke(255, 0, 0);
        markers.forEach(function (mark) {
            mark.corners.forEach(function (_a) {
                var x = _a.x, y = _a.y;
                return circle(x, y, 10);
            });
        });
    }
};

})();

/******/ })()
;