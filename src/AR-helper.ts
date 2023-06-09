import { calibrationBox, isCalibrationMarker } from './calibration';
import { settings } from './settings';

let video: HTMLVideoElement;
let worker: Worker;

export const captureWidth = 320 * 1.5;
export const captureHeight = 240 * 1.5;

const captureToCanvasRatioX = window.innerWidth / captureWidth;
const captureToCanvasRatioY = window.innerHeight / captureHeight;

export function setupDetector() {
	worker = new Worker('marker-webworker.js');
	worker.onerror = console.log;
	worker.onmessageerror = console.log;
	worker.onmessage = (e: MessageEvent<RawMarker[]>) => onMarkersDetected(e.data);
}

function onMarkersDetected(inputMarkers: RawMarker[]) {
	rawMarkers = inputMarkers;
	markers = inputMarkers
		.map((marker: RawMarker) => shiftTowardsCenter(marker))
		.map((marker: RawMarker) => translateMarker(marker))
		.map((marker: RawMarker) => markerMapper(marker));
}

export function setupVideoStream() {
	// Get the html video element and set the correct width and height
	video = document.getElementById('video') as HTMLVideoElement;
	video.width = captureWidth;
	video.height = captureHeight;

	// Error if there's no mediaDevices
	if (!navigator.mediaDevices) {
		throw Error('getUserMedia is not implemented in this browser');
	}

	navigator.mediaDevices
		.getUserMedia({ video: true })
		.then((stream) => {
			if ('srcObject' in video) {
				// Idk what this is, but it's from the js-aruco examples
				video.srcObject = stream;
			} else {
				// Eeeehhh this works, sorry i guess
				(video as any).src = window.URL.createObjectURL(stream as any);
			}
		})
		.catch((err) => {
			console.log(`${err.name}: ${err.message}`);
			throw new Error('Uuuhhh stuff happened during media device setup :(');
		});
}

export function syncMarkers() {
	// Idk why we create a canvas element, but this code is mostly from the js-aruco examples
	const canvas = document.createElement('canvas');
	canvas.width = captureWidth;
	canvas.height = captureHeight;

	// Get the context to the canvas, this is kinda similar to p5js
	const ctx = canvas.getContext('2d');

	// Draw the current frame from the webcam onto the canvas
	ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

	// Get the image back from the canvas
	// I think this is basicly only to convert the webcam video into some other format
	// but idk
	const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);

	// Step 21: Sprinkle in some magic from js-aruco library and boom
	// Code detection
	return worker.postMessage(imageData);
}

let markers: Marker[] = [];
export const getMarkers = () => markers;
let rawMarkers: RawMarker[] = [];
export const getRawMarkers = () => rawMarkers;

export function isReady() {
	// Idk what this is ＼（〇_ｏ）／
	return video.readyState === video.HAVE_ENOUGH_DATA;
}

export function markerMapper(marker: RawMarker): Marker {
	// Add the center point and angle to the marker data.

	const [
		p1,
		p2,
		p3,
		p4,
	] = marker.corners;

	const dx = p2.x - p1.x;
	const dy = p2.y - p1.y;

	return {
		...marker,
		corners: [p1, p2, p3, p4],
		center: {
			x: (p1.x + p2.x + p3.x + p4.x) / 4,
			y: (p1.y + p2.y + p3.y + p4.y) / 4,
		},
		angle: dx < 0
			? Math.atan(dy / dx)
			: Math.atan(dy / dx) + PI,
	};
}

function translateMarker(marker: RawMarker): RawMarker {
	const {
		x: originX, y: originY, scaleX, scaleY, angle: originAngle,
	} = calibrationBox;

	// Allooooooooooot of mart stuff, basicly translation and rotaion every corner relative to the top left calibration corner
	const [
		p1,
		p2,
		p3,
		p4,
	] = marker
		.corners
		.map(({ x, y }) => {
			// This first part here converts the cartesian corner cordinates, into polar cordinates
			// Relative to the top left corner of the calibration box (the origin)
			const dx = x - originX;
			const dy = y - originY;
			const len = Math.sqrt(dx ** 2 + dy ** 2) * -1;
			const cornerAngle = dx < 0
				? Math.atan(dy / dx)
				: Math.atan(dy / dx) + PI;

			// Offset the polar angle by the angle of the calibration box
			// This means that we can use a calibration box, even though its angled relative to the camera
			// It also means it waaaay easier to set up
			const mappedAngle = cornerAngle - originAngle;

			// This uses the mapped angle to convert the corners polar cordinates back into cartesian cordinates
			// This means the corner has been rotated relative to the origin
			const mappedX = originX + Math.cos(mappedAngle) * len;
			const mappedY = originY + Math.sin(mappedAngle) * len;

			// Draw some visual debug information
			// But dont draw it for the calibration markers, as those are used for the absolute position of the camera
			// It therefore doesnt make sense to draw stuff for them
			if (!isCalibrationMarker(marker.id) && settings.debug) {
				push();

				// Draw a blue line representing the absolute positioning of the corner
				strokeWeight(1);
				stroke(0, 0, 255, 200);
				line(
					originX * captureToCanvasRatioX,
					originY * captureToCanvasRatioY,
					x * captureToCanvasRatioX,
					y * captureToCanvasRatioY,
				);

				// Draw a red line representing the relative and rotated position of the corner
				stroke(255, 0, 0, 200);
				line(
					originX * captureToCanvasRatioX,
					originY * captureToCanvasRatioY,
					mappedX * captureToCanvasRatioX,
					mappedY * captureToCanvasRatioY,
				);
				pop();
			}

			// Step 5: Success
			// Yaaayyy :)
			return {
				x: (mappedX - originX) * scaleX,
				y: (mappedY - originY) * scaleY,
			};
		});

	// Return the transformed marker
	return {
		...marker,
		corners: [p1, p2, p3, p4],
	};
}

const videoFeedCenterX = captureWidth / 2;
const videoFeedCenterY = captureHeight / 2;
function shiftTowardsCenter(marker: RawMarker): RawMarker {
	if (isCalibrationMarker(marker.id)) return marker;

	const [
		p1,
		p2,
		p3,
		p4,
	] = marker
		.corners
		.map(({ x, y }) => {
			// This first part here converts the cartesian corner cordinates, into polar cordinates
			// Relative to the center of the video feed
			const dx = x - videoFeedCenterX;
			const dy = y - videoFeedCenterY;
			const lenToCenter = Math.sqrt(dx ** 2 + dy ** 2);
			const newLen = lenToCenter * -1 * settings.objectOffsetMultiplier;
			const angleToCenter = dx < 0
				? Math.atan(dy / dx)
				: Math.atan(dy / dx) + PI;

			// This uses the mapped angle to convert the corners polar cordinates back into cartesian cordinates
			// This means the corner has been rotated relative to the origin
			const mappedX = videoFeedCenterX + Math.cos(angleToCenter) * newLen;
			const mappedY = videoFeedCenterY + Math.sin(angleToCenter) * newLen;

			// Step 5: Success
			// Yaaayyy :)
			return {
				x: mappedX,
				y: mappedY,
			};
		});

	// Return the transformed marker
	return {
		...marker,
		corners: [p1, p2, p3, p4],
	};
}
