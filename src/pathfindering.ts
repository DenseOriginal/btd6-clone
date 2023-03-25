import { calculateIntersections, createGridFromPoints, drawOverlappedCells } from "./grid-builder";
import { settings } from "./settings";
import { getWalls } from "./walls";
import * as PF from "pathfinding"

let finder: PF.Finder;
let gridMatrix: PF.Grid;

export function syncPathfinderWithWall() {
	const walls = getWalls();
	const size = settings.gridSize
	const rows = Math.ceil(height / size);
	const cols = Math.ceil(width / size);

	const occupiedCells = calculateIntersections(walls, rows, cols, size);
	gridMatrix = createGridFromPoints(occupiedCells, rows, cols);
	finder = new PF.DijkstraFinder({diagonalMovement: PF.DiagonalMovement.OnlyWhenNoObstacles});
}

export function getPath(start: Point, end: Point): Point[] {
	if (!finder || !gridMatrix) return []

	const path = finder.findPath(
		start.x,
		start.y,
		end.x,
		end.y,
		gridMatrix.clone()
	);

	// const smooooothPath = PF.Util.smoothenPath(gridMatrix.clone(), path);
	const smooooothPath = path;
	return smooooothPath.map<Point>((point) => ({ x: point[0], y: point[1] }))
}

export function debugDrawFromStartToEnd() {
	const size = settings.gridSize
	const rows = Math.ceil(height / size);
	const cols = Math.ceil(width / size);

	const startEndPath = getPath(
		{ x: 0, y: Math.floor(rows / 2) },
		{ x: cols - 1, y: Math.floor(rows / 2) }
	);

	push();
	noStroke();
	fill(0, 0, 255, 175);
	drawOverlappedCells(startEndPath)
	pop();
}
