export function collidePointCircle(point: Point, center: Point, d: number) {
	// 2d
	if (dist(point.x, point.y, center.x, center.y) <= d / 2) {
		return true;
	}
	return false;
}

export function collidePointLine(point: Point, start: Point, end: Point, buffer: number = 0.1) {
	// get distance from the point to the two ends of the line
	const d1 = dist(point.x, point.y, start.x, start.y);
	const d2 = dist(point.x, point.y, end.x, end.y);

	// get the length of the line
	const lineLen = dist(start.x, start.y, end.x, end.y);

	// if the two distances are equal to the line's length, the point is on the line!
	// note we use the buffer here to give a range, rather than one #
	if (d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer) {
		return true;
	}
	return false;
}

export function collideLineCircle(start: Point, end: Point, center: Point, diameter: number) {
	// is either end INSIDE the circle?
	// if so, return true immediately
	const inside1 = collidePointCircle(start, center, diameter);
	const inside2 = collidePointCircle(end, center, diameter);
	if (inside1 || inside2) return true;

	// get length of the line
	let distX = start.x - end.x;
	let distY = start.y - end.y;
	const len = Math.sqrt((distX * distX) + (distY * distY));

	// get dot product of the line and circle
	const dot = (((center.x - start.x) * (end.x - start.x)) + ((center.y - start.y) * (end.y - start.y))) / len ** 2;

	// find the closest point on the line
	const closestX = start.x + (dot * (end.x - start.x));
	const closestY = start.y + (dot * (end.y - start.y));

	// is this point actually on the line segment?
	// if so keep going, but if not, return false
	const onSegment = collidePointLine({ x: closestX, y: closestY }, start, end);
	if (!onSegment) return false;

	// get distance to closest point
	distX = closestX - center.x;
	distY = closestY - center.y;
	const distance = Math.sqrt((distX * distX) + (distY * distY));

	if (distance <= diameter / 2) {
		return true;
	}
	return false;
}

export function collidePointPoly(point: Point, vertices: Point[]) {
	let collision = false;

	// go through each of the vertices, plus the next vertex in the list
	let next = 0;
	for (let current = 0; current < vertices.length; current++) {
		// get next vertex in list if we've hit the end, wrap around to 0
		next = current + 1;
		if (next === vertices.length) next = 0;

		// get the PVectors at our current position this makes our if statement a little cleaner
		const vc = vertices[current]; // c for "current"
		const vn = vertices[next]; // n for "next"

		// compare position, flip 'collision' variable back and forth
		if (((vc.y >= point.y && vn.y < point.y) || (vc.y < point.y && vn.y >= point.y))
			&& (point.x < (vn.x - vc.x) * (point.y - vc.y) / (vn.y - vc.y) + vc.x)) {
			collision = !collision;
		}
	}
	return collision;
}

// POLYGON/CIRCLE
export function collideCirclePoly(center: Point, diameter: number, vertices: Point[], interior: boolean = false) {
	// go through each of the vertices, plus the next vertex in the list
	let next = 0;
	for (let current = 0; current < vertices.length; current++) {
		// get next vertex in list if we've hit the end, wrap around to 0
		next = current + 1;
		if (next === vertices.length) next = 0;

		// get the PVectors at our current position this makes our if statement a little cleaner
		const vc = vertices[current]; // c for "current"
		const vn = vertices[next]; // n for "next"

		// check for collision between the circle and a line formed between the two vertices
		const collision = collideLineCircle({ x: vc.x, y: vc.y }, { x: vn.x, y: vn.y }, center, diameter);
		if (collision) return true;
	}

	// test if the center of the circle is inside the polygon
	if (interior === true) {
		const centerInside = collidePointPoly(center, vertices);
		if (centerInside) return true;
	}

	// otherwise, after all that, return false
	return false;
}
