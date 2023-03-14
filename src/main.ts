/// <reference path="../node_modules/@types/p5/global.d.ts"/>

import { getMarkers, isReady, setupDetector, setupVideoStream } from "./AR-helper";

let capture: ReturnType<typeof createCapture>;

export let cWidth = 320 * 3;
export let cHeight = 240 * 3;

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
		
		const markers = getMarkers();
		console.log(markers);

		strokeWeight(2);
		stroke(255, 0, 0);
		markers.forEach(mark => {
			const { x, y } = mark.corners[0]
			circle(x, y, 4)
			// mark.corners.forEach(({ x, y }) => circle(x, y, 4))
		})	
	}
}
