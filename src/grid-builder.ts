import { Grid } from 'pathfinding';
import { settings } from './settings';

export function drawEmptyGrid() {
	push();
	stroke(0, 175);
	strokeWeight(1);
	for (let x = 0; x < width; x += settings.gridSize) {
		line(x, 0, x, height);
	}
	for (let y = 0; y < height; y += settings.gridSize) {
		line(0, y, width, y);
	}

	pop();
}

export function drawOverlappedCells(cells: Point[]) {
	const size = settings.gridSize;
	cells.forEach((cell) => rect(
		cell.x * size,
		cell.y * size,
		size,
		size,
	));
}

export function createGridFromPoints(points: Point[], rows: number, cols: number): { grid: Grid, gridHash: number } {
	// Initialize the grid with all zeros
	const grid = new Grid(cols, rows);

	// Key used to check if grid has changed
	let gridHash = 0;

	// Set the value of each cell to 1 if it contains a point
	points.forEach((point) => {
		const row = Math.floor(point.y);
		const col = Math.floor(point.x);

		// Prooooobably not the best way to avoid collions, but eh :shrug:
		gridHash = ((gridHash << 5) - gridHash + (row + col)) | 0;

		if (row >= 1 && row < rows - 1 && col >= 1 && col < cols - 1) {
			grid.setWalkableAt(col - 1, row - 1, false);
			grid.setWalkableAt(col - 1, row, false);
			grid.setWalkableAt(col - 1, row + 1, false);
			grid.setWalkableAt(col, row - 1, false);
			grid.setWalkableAt(col, row, false);
			grid.setWalkableAt(col, row + 1, false);
			grid.setWalkableAt(col + 1, row - 1, false);
			grid.setWalkableAt(col + 1, row, false);
			grid.setWalkableAt(col + 1, row + 1, false);
		}
	});

	return { grid, gridHash };
}

export function calculateIntersections(objects: CollisionObject[], rows: number, cols: number, size: number): Point[] {
	const intersections: Point[] = [];

	// Loop through each object
	objects.forEach((object) => {
		// Loop through each cell in the grid
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				const cellCenter: Point = {
					x: col * size + size / 2,
					y: row * size + size / 2,
				};

				// Check if the cell intersects the wall
				if (doesIntersectWithGeneric(cellCenter, object, size)) {
					intersections.push({ x: col, y: row });
				}
			}
		}
	});

	if (settings.debug) {
		push();
		noStroke();
		fill(255, 0, 0, 175);
		drawOverlappedCells(intersections);
		pop();
	}

	return intersections;
}

function doesIntersectWithGeneric(point: Point, object: CollisionObject, bufferSize: number): boolean {
	switch (object.type) {
		case 'turret': return doesIntersectWithTurret(point, object, bufferSize);
		case 'wall': return doesIntersectWithWall(point, object);
		default:
			const assertNever: never = object;
			return assertNever;
	}
}

function doesIntersectWithWall(point: Point, wall: Wall): boolean {
	const { corners } = wall;
	let intersectionCount = 0;

	for (let i = 0; i < corners.length; i++) {
		const current = corners[i];
		const next = corners[(i + 1) % corners.length];

		if (point.y > Math.min(current.y, next.y)
			&& point.y <= Math.max(current.y, next.y)
			&& point.x <= Math.max(current.x, next.x)
			&& current.y !== next.y) {
			const xIntersection = (point.y - current.y) * (next.x - current.x) / (next.y - current.y) + current.x;

			if (current.x === next.x || point.x <= xIntersection) {
				intersectionCount++;
			}
		}
	}

	return intersectionCount % 2 !== 0;
}

function doesIntersectWithTurret(point: Point, turret: TurretPlacement, bufferSize: number): boolean {
	return dist(point.x, point.y, turret.center.x, turret.center.y) < ((turret.diameter + bufferSize) / 2);
}
