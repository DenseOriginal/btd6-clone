/// <reference path="../node_modules/@types/p5/global.d.ts"/>

import { getMarkers, isReady, setupDetector, setupVideoStream } from "./AR-helper";

let capture: ReturnType<typeof createCapture>;

(window as any).setup = () => {
	createCanvas(windowWidth, windowHeight);
	capture = createCapture(VIDEO);
  	capture.hide();

	setupVideoStream();
	setupDetector();
	frameRate(10);
};

(window as any).draw = () => {
	if (isReady()) {
		image(capture, 0, 0, windowWidth, windowHeight);
		const markers = getMarkers();
		console.log(markers);

		strokeWeight(2);
		stroke(255, 0, 0);
		markers.forEach(mark => {
			mark.corners.forEach(({ x, y }) => circle(x, y, 10))
		})	
	}
}
