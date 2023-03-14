/// <reference path="../node_modules/@types/p5/global.d.ts"/>

import { getMarkers, isReady, setupDetector, setupVideoStream } from "./AR-helper";

let capture: ReturnType<typeof createCapture>;

const calibrationButton = document.getElementById('calibrationButton');
if (!calibrationButton) throw new Error('Can\'t find calibration box');

export let cWidth = 320 * 3;
export let cHeight = 240 * 3;

const debug = false;

// Calibrate id order
// Top left, Top right, Bottom left, Bottom right
const calibrationIds = [3, 0, 1, 2];

let calibrationBox: CalibrationBox = {
	x: 0,
	y: 0,
	width: Infinity,
	height: Infinity
};

(window as any).setup = () => {
	createCanvas(cWidth, cHeight);
	capture = createCapture(VIDEO);
  	capture.hide();

	setupVideoStream();
	setupDetector();
	frameRate(10);
};

(window as any).draw = () => {
	if (isReady()) {
		image(capture, 0, 0, width, height);
		
		drawPlayarea();

		const markers = getMarkers();

		markers.forEach(mark => {


			if (debug) drawDebugMarker(mark);
		})
	}
}

// Max allowed skew in both directions, when calibrating
const skewThreshold = 10;
function calibrate() {
	const calibrationMarkers = getMarkers()
		// Only grab the markers that are used for calibration
		.filter((marker) => calibrationIds.includes(marker.id));
	
	const topLeftMarker = calibrationMarkers.find((marker) => marker.id == calibrationIds[0]);
	const topRightMarker = calibrationMarkers.find((marker) => marker.id == calibrationIds[1]);
	const bottomLeftMarker = calibrationMarkers.find((marker) => marker.id == calibrationIds[2]);
	const bottomRightMarker = calibrationMarkers.find((marker) => marker.id == calibrationIds[3]);

	// Make sure we have all markers;
	if (
		!topLeftMarker ||
		!topRightMarker ||
		!bottomLeftMarker ||
		!bottomRightMarker
	) {
		console.log('Found calibration markers: ', calibrationMarkers);
		throw new Error('Missing calibration markers: ');
	}

	const dyTop = topLeftMarker.center.y - topRightMarker.center.y;
	const dyBottom = bottomLeftMarker.center.y - bottomRightMarker.center.y;

	const dxLeft = topLeftMarker.center.x - bottomLeftMarker.center.x;
	const dxRight = topRightMarker.center.x - bottomRightMarker.center.x;

	if (
		dyTop > skewThreshold ||
		dyBottom > skewThreshold ||
		dxLeft > skewThreshold ||
		dxRight > skewThreshold
	) {
		console.log('Deltas: ', {
			dyTop,
			dyBottom,
			dxLeft,
			dxRight
		});
		throw new Error('Deltas above skewThreshold');
	}

	calibrationBox = {
		x: topLeftMarker.center.x,
		y: topLeftMarker.center.y,
		width: bottomRightMarker.center.x - topLeftMarker.center.x,
		height: bottomRightMarker.center.y - topLeftMarker.center.y,
	};
}

calibrationButton.addEventListener('click', calibrate);

function drawPlayarea() {
	push();
	
	noStroke();
	fill(255);

	rect(
		calibrationBox.x,
		calibrationBox.y,
		calibrationBox.width,
		calibrationBox.height
	)

	pop();
}

function drawDebugMarker(mark: Marker) {
	strokeWeight(2);
	stroke(255, 0, 0);

	const { x, y } = mark.center
	circle(x, y, 4);

	const angle = mark.angle;
	const rotX = cos(angle) * 20;
	const rotY = sin(angle) * 20;

	line(
		x,
		y,
		x + rotX,
		y + rotY
	);

	noStroke();
	fill(0, 255, 0)
	text(mark.id, x, y);
}
