let video: HTMLVideoElement;
let mediaDevices: Partial<MediaDevices> = {};
let detector: any;
let posit: any;
let modelSize = 35.0; //millimeters


export function setupDetector() {
    detector = new (window as any).AR.Detector({
		dictionaryName: 'ARUCO_4X4_1000'
	});
	posit = new (window as any).POS.Posit(modelSize, windowWidth);
}

export function setupVideoStream() {
    video = document.getElementById("video") as HTMLVideoElement;
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
	canvas.width = windowWidth;
	canvas.height = windowHeight;
	
	let ctx = canvas.getContext('2d');
	ctx?.drawImage( video, 0, 0, canvas.width, canvas.height );
	const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
    return detector.detect(imageData);
};

export function isReady() {
    return video.readyState === video.HAVE_ENOUGH_DATA;
}