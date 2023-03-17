import { getMarkers } from "./AR-helper";

const ratios = new Map<number, WallRatioConfig>();

ratios.set(5, { id: 5, codeWidth: 3, width: 20, height: 5, rotated: false });

let walls: Marker[] = [];

export const getWalls = () =>
    walls;

export function syncWalls() {
    const markers = getMarkers();
    walls = markers;
}