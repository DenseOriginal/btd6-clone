/// <reference path="../node_modules/@types/p5/global.d.ts"/>

import { getMarkers, getRawMarkers, isReady, markerMapper, setupDetector, setupVideoStream } from "./AR-helper";
import { initSettingsMenu, settings } from "./settings";

let capture: ReturnType<typeof createCapture>;

const calibrationButton = document.getElementById('calibrationButton');
if (!calibrationButton) throw new Error('Can\'t find calibration box');

export let cWidth = 320 * 3;
export let cHeight = 240 * 3;

// Calibrate id order
// Top left, Top right, Bottom left, Bottom right
export const calibrationIds = [3, 0, 1, 2];

export let calibrationBox: CalibrationBox = {
	x: 0,
	y: 0,
	width: Infinity,
	height: Infinity,
	scaleX: 1,
	scaleY: 1,
	center: { x: Infinity, y: Infinity },
	angle: 0,
	corners: [],
};

(window as any).setup = () => {
	initSettingsMenu();
	createCanvas(cWidth, cHeight);
	capture = createCapture(VIDEO);
  	capture.hide();

	setupVideoStream();
	setupDetector();
	frameRate(settings.targetFrameRate);
};

(window as any).draw = () => {
	background(255);

	if (isReady()) {
		drawPlayarea();

		// If debug, draw transparent video feed on top of canvas
		if (settings.debug) {
			push();
			tint(255, 255 / 3);
			image(capture, 0, 0, width, height)

			noFill();
			strokeWeight(1);
			stroke(0, 0, 255);

			// Draw rect showing the calibratyion box on the source image
			beginShape();
			calibrationBox.corners.forEach((point) => vertex(point.x, point.y))
			endShape('close');

			const angle = calibrationBox.angle;
			const rotX = cos(angle) * 30;
			const rotY = sin(angle) * 30;

			line(
				calibrationBox.center.x,
				calibrationBox.center.y,
				calibrationBox.center.x + rotX,
				calibrationBox.center.y + rotY
			);

			pop();
		}

		const markers = getMarkers();

		for (const mark of markers) {
			// If this is a calibration id, drawing it
			if (calibrationIds.includes(mark.id)) {
				if (settings.debug) drawDebugMarker(mark);
				continue
			};

			const [p1, p2, p3, p4] = mark.corners;
	
			noStroke();
			fill(255, 100, 100);
	
			beginShape();
			vertex(p1.x, p1.y);
			vertex(p2.x, p2.y);
			vertex(p3.x, p3.y);
			vertex(p4.x, p4.y);
			endShape()
	
			if (settings.debug) drawDebugMarker(mark);
		}

		if (settings.debug) drawDebugText();
	}
}

// Max allowed skew in both directions, when calibrating
const skewThreshold = 10;
function calibrate() {
	const calibrationMarkers = getRawMarkers()
		// Only grab the markers that are used for calibration
		.filter((marker) => calibrationIds.includes(marker.id))
		.map((marker) => markerMapper(marker));
	
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

	const dxTop = topRightMarker.center.x - topLeftMarker.center.x;
	const dxBottom = bottomRightMarker.center.x - bottomLeftMarker.center.x;

	const dyLeft = bottomLeftMarker.center.y - topLeftMarker.center.y;
	const dyRight = bottomRightMarker.center.y - topRightMarker.center.y;

	if (
		Math.abs(dxTop - dxBottom) > skewThreshold ||
		Math.abs(dyLeft - dyRight) > skewThreshold
	) {
		console.log('Deltas: ', {
			dxTop,
			dxBottom,
			dyLeft,
			dyRight
		});
		throw new Error('Deltas above skewThreshold');
	}
	
	const width = dist(topLeftMarker.center.x, topLeftMarker.center.y, topRightMarker.center.x, topRightMarker.center.y);
	const height = dist(topLeftMarker.center.x, topLeftMarker.center.y, bottomLeftMarker.center.x, bottomLeftMarker.center.y);
	const scaleX = cWidth / width;
	const scaleY = cHeight / height;

	const angleDx = topLeftMarker.center.x - topRightMarker.center.x;
	const angleDy = topLeftMarker.center.y - topRightMarker.center.y;

	calibrationBox = {
		x: topLeftMarker.center.x,
		y: topLeftMarker.center.y,
		width,
		height,
		scaleX,
		scaleY,
		corners: [
			topLeftMarker.center,
			topRightMarker.center,
			bottomRightMarker.center,
			bottomLeftMarker.center,
		],
		angle: angleDx < 0 ?
			Math.atan(angleDy / angleDx) :
			Math.atan(angleDy / angleDx) + PI,
		center: {
            x: (topLeftMarker.center.x + topRightMarker.center.x + bottomLeftMarker.center.x + bottomRightMarker.center.x) / 4,
            y: (topLeftMarker.center.y + topRightMarker.center.y + bottomLeftMarker.center.y + bottomRightMarker.center.y) / 4
        },
	};
}

calibrationButton.addEventListener('click', calibrate);

function drawPlayarea() {
	push();
	
	noStroke();
	fill(100, 255, 100);

	rect(
		0,
		0,
		calibrationBox.width * calibrationBox.scaleX,
		calibrationBox.height * calibrationBox.scaleY
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

function drawDebugText() {
	const messages = [
		`Frame rate: ${frameRate().toFixed(2)}`,
		`Target frame rate: ${settings.targetFrameRate}`,
		`Calibration box angle: ${calibrationBox.angle.toFixed(4)}`,
	];

	fill(0);
	messages.forEach((message, idx) => {
		text(message, 10, 20 + idx * 10);
	})
}