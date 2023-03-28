import { getMarkers } from "./AR-helper";
import { isCalibrationMarker } from "./calibration";
import { settings } from "./settings";

const ratios = new Map<number, WallRatioConfig>();
const markerCache = new Map<number, Marker>();

ratios.set(4, { id: 4, codeWidth: 3, width: 12, height: 4, rotated: false });
ratios.set(5, { id: 5, codeWidth: 3, width: 16, height: 4, rotated: false });
ratios.set(6, { id: 6, codeWidth: 3, width: 16, height: 4, rotated: false });
ratios.set(7, { id: 7, codeWidth: 3, width: 12, height: 4, rotated: false });
ratios.set(8, { id: 8, codeWidth: 3, width: 20, height: 4, rotated: false });

let walls: Record<number, Wall> = [];

export const getWalls = () =>
	Object.values(walls);

export function syncWalls() {
	const markers = getMarkers();
	const currentFrame = frameCount;

	const foundWalls = markers
		.filter(mark => ratios.get(mark.id))
		.map(mark => checkCache(mark))
		.map(mark => {
			const ratio = ratios.get(mark.id)!;

			const center = mark.center;
			const markUnit = (
				dist(mark.corners[0].x, mark.corners[0].y, mark.corners[1].x, mark.corners[1].y) +
				dist(mark.corners[1].x, mark.corners[1].y, mark.corners[2].x, mark.corners[2].y) +
				dist(mark.corners[2].x, mark.corners[2].y, mark.corners[3].x, mark.corners[3].y) +
				dist(mark.corners[3].x, mark.corners[3].y, mark.corners[0].x, mark.corners[0].y)
			) / 4;
			const width = (ratio.width / ratio.codeWidth) * markUnit;
			const height = (ratio.height / ratio.codeWidth) * markUnit;

			const angle = Math.atan((width) / (height)) * -1;
			const len = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);
			const deltaAngle = PI - angle * 2;

			const rotationAngle = angle + mark.angle;

			const p1: Point = { x: center.x + cos(rotationAngle) * len, y: center.y + sin(rotationAngle) * len }
			const p2: Point = { x: center.x - cos(rotationAngle) * len, y: center.y - sin(rotationAngle) * len }
			const p3: Point = { x: center.x + cos(rotationAngle + deltaAngle) * len, y: center.y + sin(rotationAngle + deltaAngle) * len }
			const p4: Point = { x: center.x - cos(rotationAngle + deltaAngle) * len, y: center.y - sin(rotationAngle + deltaAngle) * len }

			return {
				...mark,
				type: 'wall' as const,
				corners: [
					p1,
					p3,
					p2,
					p4
				]
			}
		})
		.reduce((acc, cur) => ({ ...acc, [cur.id]: { ...cur, timestamp: currentFrame } }), {} as Record<number, Wall>);

	walls = Object.values({ ...walls, ...foundWalls })
		.filter(wall => currentFrame - wall.timestamp < settings.preserveWallsFrames)
		.reduce((acc, wall) => ({ ...acc, [wall.id]: wall }), {} as Record<number, Wall>);
}

function checkCache(marker: Marker): Marker {
	if (markerCache.has(marker.id)) {
		const cacheHit = markerCache.get(marker.id)!;
		const cacheCenter = cacheHit.center;
		const center = marker.center;

		if (
			dist(cacheCenter.x, cacheCenter.y, center.x, center.y) > settings.cacheHitThreshold ||
			Math.abs(cacheHit.angle - marker.angle) > settings.cacheHitThreshold
		) {
			// Cache hit is invalid
			markerCache.set(marker.id, marker);
			return marker;
		} else {
			// Cache is good
			return cacheHit;
		}
	}


	markerCache.set(marker.id, marker);
	return marker;
}