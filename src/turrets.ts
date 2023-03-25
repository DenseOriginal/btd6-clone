import { getMarkers } from "./AR-helper";
import { isCalibrationMarker } from "./calibration";
import { settings } from "./settings";

const ratios = new Map<number, TurretRatioConfig>();
const markerCache = new Map<number, Marker>();

ratios.set(40, { id: 40, codeWidth: 2.5, diameter: 4, rotationOffset: Math.PI / 2 });
ratios.set(41, { id: 41, codeWidth: 2.5, diameter: 4, rotationOffset: Math.PI / 2 });

let turrets: Record<number, TurretPlacement> = [];

export const getTurrets = () =>
    Object.values(turrets);

export function syncTurrets() {
    const markers = getMarkers();
	const currentFrame = frameCount;

    const foundTurrets = markers
        .filter(mark => ratios.get(mark.id))
		.map(mark => checkCache(mark))
        .map(mark => {
            const ratio = ratios.get(mark.id)!;

            const markUnit = (
                dist(mark.corners[0].x, mark.corners[0].y, mark.corners[1].x, mark.corners[1].y) +
                dist(mark.corners[1].x, mark.corners[1].y, mark.corners[2].x, mark.corners[2].y) +
                dist(mark.corners[2].x, mark.corners[2].y, mark.corners[3].x, mark.corners[3].y) +
                dist(mark.corners[3].x, mark.corners[3].y, mark.corners[0].x, mark.corners[0].y)
            ) / 4;
            const diameter = (ratio.diameter / ratio.codeWidth) * markUnit;

            return {
				...mark,
				angle: mark.angle - ratio.rotationOffset,
				diameter,
            }
        })
		.reduce((acc, cur) => ({ ...acc, [cur.id]: { ...cur, timestamp: currentFrame } }), {} as Record<number, TurretPlacement>);

	turrets = Object.values({ ...turrets, ...foundTurrets })
		.filter(turret => currentFrame - turret.timestamp < settings.preserveWallsFrames)
		.reduce((acc, turret) => ({ ...acc, [turret.id]: turret }), {} as Record<number, TurretPlacement>);
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