/// <reference path="../node_modules/@types/p5/global.d.ts"/>

import { getMarkers, isReady, setupDetector, setupVideoStream } from "./AR-helper";
import { calibrationBox, isCalibrationMarker } from "./calibration";
import { drawCalibrationBox, drawDebugMarker, drawDebugText, drawVideoFeed } from "./debug-draw";
import { initSettingsMenu, settings } from "./settings";

let capture: ReturnType<typeof createCapture>;

export let canvasWidth = window.innerWidth;
export let canvasHeight = window.innerHeight;

(window as any).setup = () => {
	initSettingsMenu();
	createCanvas(canvasWidth, canvasHeight);
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
		if (settings.debug) drawCalibrationBox();
		if (settings.showVideoFeed) drawVideoFeed(capture);

		const markers = getMarkers();

		for (const mark of markers) {
			// If this is a calibration id, drawing it
			if (isCalibrationMarker(mark.id)) {
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
