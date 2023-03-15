import { calibrationBox, calibrationIds, cHeight, cWidth } from "./main";
import { settings } from "./settings";

let video: HTMLVideoElement;
let mediaDevices: Partial<MediaDevices> = {};
let detector: any;
const cacheHitThreshold = 3;

const rawMarkerCache = new Map<number, RawMarker>();

export function setupDetector() {
	detector = new (window as any).AR.Detector({
		dictionaryName: 'ARUCO_4X4_1000'
	});
}

export function setupVideoStream() {
	video = document.getElementById("video") as HTMLVideoElement;
	video.width = cWidth;
	video.height = cHeight;
	if (navigator.mediaDevices != undefined) {
		mediaDevices = navigator.mediaDevices;
	}

	if (!mediaDevices.getUserMedia) {
		mediaDevices.getUserMedia = function (constraints) {
			var getUserMedia = (navigator as any).webkitGetUserMedia || (navigator as any).mozGetUserMedia;

			if (!getUserMedia) {
				return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
			}

			return new Promise(function (resolve, reject) {
				getUserMedia.call(navigator, constraints, resolve, reject);
			});
		}
	}

	mediaDevices
		.getUserMedia({ video: true })
		.then(function (stream) {
			if ("srcObject" in video) {
				video.srcObject = stream;
			} else {
				(video as any).src = window.URL.createObjectURL(stream as any);
			}
		})
		.catch(function (err) {
			console.log(err.name + ": " + err.message);
		}
		);
}

export function getRawMarkers(): RawMarker[] {
	let canvas = document.createElement('canvas');
	canvas.width = cWidth;
	canvas.height = cHeight;

	let ctx = canvas.getContext('2d');
	ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
	const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
	return detector.detect(imageData);
};

export function getMarkers(): Marker[] {
	return getRawMarkers()
		.map((marker: RawMarker) => checkCache(marker))
		.map((marker: RawMarker) => translateMarker(marker))
		.map((marker: RawMarker) => markerMapper(marker))
}

export function isReady() {
	return video.readyState === video.HAVE_ENOUGH_DATA;
}

export function markerMapper(marker: RawMarker): Marker {
	const [
		p1,
		p2,
		p3,
		p4
	] = marker.corners;

	const dx = p2.x - p1.x;
	const dy = p2.y - p1.y;

	return {
		...marker,
		corners: [p1, p2, p3, p4],
		center: {
			x: (p1.x + p2.x + p3.x + p4.x) / 4,
			y: (p1.y + p2.y + p3.y + p4.y) / 4
		},
		angle: dx < 0 ?
			Math.atan(dy / dx) :
			Math.atan(dy / dx) + PI
	}
}

function translateMarker(marker: RawMarker): RawMarker {
	const { x: originX, y: originY, center: originCenter, scaleX, scaleY, angle: originAngle } = calibrationBox;

	const [
		p1,
		p2,
		p3,
		p4
	] = marker
		.corners
		.map(({ x, y }) => {
			const dx = x - originX;
			const dy = y - originY;
			const len = Math.sqrt(dx ** 2 + dy ** 2) * -1;
			const cornerAngle = dx < 0 ?
				Math.atan(dy / dx) :
				Math.atan(dy / dx) + PI;

			const mappedAngle = cornerAngle - originAngle;
			const mappedX = originX + Math.cos(mappedAngle) * len;
			const mappedY = originY + Math.sin(mappedAngle) * len;

			if (!calibrationIds?.includes(marker.id) && settings.debug) {
				push();
				strokeWeight(1)
				stroke(0, 0, 255, 200);
				line(
					originX,
					originY,
					originX + cos(cornerAngle) * len,
					originY + sin(cornerAngle) * len
				)

				stroke(255, 0, 0, 200);
				line(
					originX,
					originY,
					mappedX,
					mappedY
				)
				pop()
			}


			return {
				x: (mappedX - originX) * scaleX,
				y: (mappedY - originY) * scaleY
			}
		});

	return {
		...marker,
		corners: [p1, p2, p3, p4]
	}
}

function checkCache(marker: RawMarker): RawMarker {
	if (rawMarkerCache.has(marker.id)) {
		const cacheHit = rawMarkerCache.get(marker.id)!;
		const cacheCenter = markerMapper(cacheHit).center;
		const center = markerMapper(marker).center;

		if (dist(cacheCenter.x, cacheCenter.y, center.x, center.y) > cacheHitThreshold) {
			// Cache hit is invalid
			rawMarkerCache.set(marker.id, marker);
			return marker;
		} else {
			// Cache is good
			return cacheHit;
		}
	}


	rawMarkerCache.set(marker.id, marker);
	return marker;
}