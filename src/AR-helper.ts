import { calibrationBox, cHeight, cWidth } from "./main";

let video: HTMLVideoElement;
let mediaDevices: Partial<MediaDevices> = {};
let detector: any;


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

export function getMarkers(): Marker[] {
	let canvas = document.createElement('canvas');
	canvas.width = cWidth;
	canvas.height = cHeight;
	
	let ctx = canvas.getContext('2d');
	ctx?.drawImage( video, 0, 0, canvas.width, canvas.height );
	const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
    return detector.detect(imageData).map((marker: RawMarker) => markerMapper(marker));
};

export function isReady() {
    return video.readyState === video.HAVE_ENOUGH_DATA;
}

function markerMapper(marker: RawMarker): Marker {
    const { x: originX, y: originY, scaleX, scaleY } = calibrationBox;

    const [
        p1,
        p2,
        p3,
        p4
    ] = marker
        .corners
        .map(({ x, y }) => ({ x: (x - originX) * scaleX, y: (y -originY) * scaleY }));

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
