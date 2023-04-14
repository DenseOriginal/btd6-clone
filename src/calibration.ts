import { getRawMarkers, isReady, markerMapper } from './AR-helper';
import { canvasHeight, canvasWidth } from './main';
import { settings } from './settings';

const calibrationButton = document.getElementById('calibrationButton');
if (!calibrationButton) throw new Error('Can\'t find calibration box');

// Top left, Top right, Bottom left, Bottom right
export const calibrationIds = [0, 1, 2, 3];

export const isCalibrationMarker = (id: number) => calibrationIds.includes(id);

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

export function calibrate() {
	if (!isReady()) {
		console.warn('Camera not ready, cant calibrate');
		return;
	}

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
		!topLeftMarker
		|| !topRightMarker
		|| !bottomLeftMarker
		|| !bottomRightMarker
	) {
		console.log('Found calibration markers: ', calibrationMarkers);
		throw new Error('Missing calibration markers: ');
	}

	const topLeftPoint = topLeftMarker.corners[0]!;
	const topRightPoint = topRightMarker.corners[1]!;
	const bottomLeftPoint = bottomLeftMarker.corners[3]!;
	const bottomRightPoint = bottomRightMarker.corners[2]!;

	const dxTop = topRightPoint.x - topLeftPoint.x;
	const dxBottom = bottomRightPoint.x - bottomLeftPoint.x;

	const dyLeft = bottomLeftPoint.y - topLeftPoint.y;
	const dyRight = bottomRightPoint.y - topRightPoint.y;

	if (Math.abs(dxTop - dxBottom) > settings.skewThreshold) throw new Error(`Horizontal delta too high: dxTop (${dxTop}) dxBottom (${dxBottom}) delta (${Math.abs(dxTop - dxBottom)})`);
	if (Math.abs(dyLeft - dyRight) > settings.skewThreshold) throw new Error(`Vertical delta too high: dyLeft (${dyLeft}) dyRight (${dyRight}) delta (${Math.abs(dyLeft - dyRight)})`);

	const width = dist(topLeftPoint.x, topLeftPoint.y, topRightPoint.x, topRightPoint.y);
	const height = dist(topLeftPoint.x, topLeftPoint.y, bottomLeftPoint.x, bottomLeftPoint.y);
	const scaleX = canvasWidth / width;
	const scaleY = canvasHeight / height;

	const angleDx = topLeftPoint.x - topRightPoint.x;
	const angleDy = topLeftPoint.y - topRightPoint.y;

	calibrationBox = {
		x: topLeftPoint.x,
		y: topLeftPoint.y,
		width,
		height,
		scaleX,
		scaleY,
		corners: [
			topLeftPoint,
			topRightPoint,
			bottomRightPoint,
			bottomLeftPoint,
		],
		angle: angleDx < 0
			? Math.atan(angleDy / angleDx)
			: Math.atan(angleDy / angleDx) + PI,
		center: {
			x: (topLeftPoint.x + topRightPoint.x + bottomLeftPoint.x + bottomRightPoint.x) / 4,
			y: (topLeftPoint.y + topRightPoint.y + bottomLeftPoint.y + bottomRightPoint.y) / 4,
		},
	};
}

(window as any).calibrate = calibrate;
calibrationButton.addEventListener('click', calibrate);

let autoCalibrateIntervalHook: ReturnType<typeof setInterval>;
export function initAutoCalibrate() {
	try {
		autoCalibrateIntervalHook = setInterval(calibrate, settings.autoCalibrateInterval);
		calibrate();
	} catch (error) {
		console.log(error);
	}
}

export function updateAutoCalibrateInterval(interval: number) {
	try {
		clearInterval(autoCalibrateIntervalHook);
		autoCalibrateIntervalHook = setInterval(calibrate, interval);
		calibrate();
	} catch (error) {
		console.log(error);
	}
}
