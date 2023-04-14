import { getMarkers } from './AR-helper';
import { GatlingTower } from './gatlingTower';
import { settings } from './settings';
import { SprayTower } from './sprayTower';
import { TurretParent } from './turretParentClass';

const ratios = new Map<number, TurretRatioConfig>();
const markerCache = new Map<number, Marker>();
export const activeTurrets = new Map<number, TurretParent>();

ratios.set(40, { id: 40, codeWidth: 2.5, diameter: 4, rotationOffset: Math.PI / 2, type: 'gatling' });
ratios.set(41, { id: 41, codeWidth: 2.5, diameter: 4, rotationOffset: Math.PI / 2, type: 'gatling' });
ratios.set(42, { id: 40, codeWidth: 2.5, diameter: 4, rotationOffset: Math.PI / 2, type: 'gatling' });
ratios.set(43, { id: 41, codeWidth: 2.5, diameter: 4, rotationOffset: Math.PI / 2, type: 'gatling' });
ratios.set(50, { id: 50, codeWidth: 2.5, diameter: 4, rotationOffset: Math.PI / 2, type: 'spray' });
ratios.set(51, { id: 51, codeWidth: 2.5, diameter: 4, rotationOffset: Math.PI / 2, type: 'spray' });

let turrets: Record<number, TurretPlacement> = [];

export const getTurrets = () => Object.values(turrets);

export function syncTurrets() {
	const markers = getMarkers();
	const currentFrame = frameCount;

	const foundTurrets = markers
		.filter((mark) => ratios.get(mark.id))
		.map((mark) => checkCache(mark))
		.map((mark) => {
			const ratio = ratios.get(mark.id)!;

			const markUnit = (
				dist(mark.corners[0].x, mark.corners[0].y, mark.corners[1].x, mark.corners[1].y)
				+ dist(mark.corners[1].x, mark.corners[1].y, mark.corners[2].x, mark.corners[2].y)
				+ dist(mark.corners[2].x, mark.corners[2].y, mark.corners[3].x, mark.corners[3].y)
				+ dist(mark.corners[3].x, mark.corners[3].y, mark.corners[0].x, mark.corners[0].y)
			) / 4;
			const diameter = (ratio.diameter / ratio.codeWidth) * markUnit;

			return {
				...mark,
				angle: mark.angle - ratio.rotationOffset,
				diameter,
				type: 'turret' as const,
				turretType: ratio.type,
			};
		})
		.reduce((acc, cur) => ({ ...acc, [cur.id]: { ...cur, timestamp: currentFrame } }), {} as Record<number, TurretPlacement>);

	turrets = Object.values({ ...turrets, ...foundTurrets })
		.filter((turret) => currentFrame - turret.timestamp < settings.preserveWallsFrames)
		.reduce((acc, turret) => ({ ...acc, [turret.id]: turret }), {} as Record<number, TurretPlacement>);
}

function checkCache(marker: Marker): Marker {
	if (markerCache.has(marker.id)) {
		const cacheHit = markerCache.get(marker.id)!;
		const cacheCenter = cacheHit.center;
		const { center } = marker;

		if (
			dist(cacheCenter.x, cacheCenter.y, center.x, center.y) > settings.cacheHitThreshold
			|| Math.abs(cacheHit.angle - marker.angle) > settings.cacheHitThreshold
		) {
			// Cache hit is invalid
			markerCache.set(marker.id, marker);
			return marker;
		}
		// Cache is good
		return cacheHit;
	}

	markerCache.set(marker.id, marker);
	return marker;
}

export function syncTurretObj() {
	const markerTurrets = getTurrets();
	const markerIds: number[] = [];

	markerTurrets.forEach((markerTurret) => {
		markerIds.push(markerTurret.id);
		if (!activeTurrets.has(markerTurret.id)) {
			switch (markerTurret.turretType) {
				case 'gatling': {
					activeTurrets.set(markerTurret.id, new GatlingTower(markerTurret.diameter, markerTurret.center.y, markerTurret.center.y, 15, 25));
					break;
				}
				case 'spray': {
					activeTurrets.set(markerTurret.id, new SprayTower(markerTurret.diameter, markerTurret.center.y, markerTurret.center.y, 25, 25));
					break;
				}
			}
		} else if (activeTurrets.has(markerTurret.id)) {
			const tur = activeTurrets.get(markerTurret.id)!;
			tur.updateFromPlacement(markerTurret);
		}
	});
	activeTurrets.forEach((turret, id, turrets) => {
		if (!markerIds.includes(id)) {
			turrets.delete(id);
		}
	});
}
export function updateTurretObj() {
	activeTurrets.forEach((markerTurret) => {
		markerTurret.update();
	});
}
