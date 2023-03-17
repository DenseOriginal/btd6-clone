const calibrationButton = document.getElementById('calibrationButton');
if (!calibrationButton) throw new Error('Can\'t find calibration box');

import { getRawMarkers, markerMapper } from "./AR-helper";
import { canvasHeight, canvasWidth } from "./main";
import { settings } from "./settings";

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

	if (Math.abs(dxTop - dxBottom) > settings.skewThreshold) throw new Error(`Horizontal delta too high: dxTop (${dxTop}) dxBottom (${dxBottom}) delta (${Math.abs(dxTop - dxBottom)})`);
	if (Math.abs(dyLeft - dyRight) > settings.skewThreshold) throw new Error(`Vertical delta too high: dyLeft (${dyLeft}) dyRight (${dyRight}) delta (${Math.abs(dyLeft - dyRight)})`);

	const width = dist(topLeftMarker.center.x, topLeftMarker.center.y, topRightMarker.center.x, topRightMarker.center.y);
	const height = dist(topLeftMarker.center.x, topLeftMarker.center.y, bottomLeftMarker.center.x, bottomLeftMarker.center.y);
	const scaleX = canvasWidth / width;
	const scaleY = canvasHeight / height;

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