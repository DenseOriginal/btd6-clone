import { Grid } from "pathfinding";
import { settings } from "./settings";

export function drawEmptyGrid() {
	push()
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
	const size = settings.gridSize
	cells.forEach((cell) => rect(
		cell.x * size,
		cell.y * size,
		size,
		size,
	))
}

export function createGridFromPoints(points: Point[], rows: number, cols: number): Grid {
	// Initialize the grid with all zeros
	const grid = new Grid(cols, rows);

	// Set the value of each cell to 1 if it contains a point
	points.forEach(point => {
		const row = Math.floor(point.y);
		const col = Math.floor(point.x);
		if (row >= 0 && row < rows && col >= 0 && col < cols) {
			grid.setWalkableAt(col, row, false);
		}
	});

	return grid;
}

export function calculateIntersections(walls: Wall[], rows: number, cols: number, size: number): Point[] {
	const intersections: Point[] = [];

	// Loop through each wall
	walls.forEach(wall => {
		// Loop through each cell in the grid
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				const cellCenter: Point = {
					x: col * size + size / 2,
					y: row * size + size / 2
				};

				// Check if the cell intersects the wall
				if (doesIntersect(cellCenter, wall)) {
					intersections.push({ x: col, y: row });
				}
			}
		}
	});

	return intersections;
}

function doesIntersect(point: Point, wall: Wall): boolean {
	const corners = wall.corners;
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