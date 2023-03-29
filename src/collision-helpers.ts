class CollisionDetection {
	private collideDebug: boolean = false;

	collidePointCircle(x: number, y: number, cx: number, cy: number, d: number) {
		// 2d
		if (dist(x, y, cx, cy) <= d / 2) {
			return true;
		}
		return false;
	}

	collidePointLine(px: number, py: number, x1: number, y1: number, x2: number, y2: number, buffer: number = 0.1) {
		// get distance from the point to the two ends of the line
		const d1 = dist(px, py, x1, y1);
		const d2 = dist(px, py, x2, y2);

		// get the length of the line
		const lineLen = dist(x1, y1, x2, y2);

		// if the two distances are equal to the line's length, the point is on the line!
		// note we use the buffer here to give a range, rather than one #
		if (d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer) {
			return true;
		}
		return false;
	}

	collideLineCircle(x1: number, y1: number, x2: number, y2: number, cx: number, cy: number, diameter: number) {
		// is either end INSIDE the circle?
		// if so, return true immediately
		const inside1 = this.collidePointCircle(x1, y1, cx, cy, diameter);
		const inside2 = this.collidePointCircle(x2, y2, cx, cy, diameter);
		if (inside1 || inside2) return true;

		// get length of the line
		let distX = x1 - x2;
		let distY = y1 - y2;
		const len = Math.sqrt((distX * distX) + (distY * distY));

		// get dot product of the line and circle
		const dot = (((cx - x1) * (x2 - x1)) + ((cy - y1) * (y2 - y1))) / len ** 2;

		// find the closest point on the line
		const closestX = x1 + (dot * (x2 - x1));
		const closestY = y1 + (dot * (y2 - y1));

		// is this point actually on the line segment?
		// if so keep going, but if not, return false
		const onSegment = this.collidePointLine(closestX, closestY, x1, y1, x2, y2, undefined);
		if (!onSegment) return false;

		// draw a debug circle at the closest point on the line
		if (this.collideDebug) {
			ellipse(closestX, closestY, 10, 10);
		}

		// get distance to closest point
		distX = closestX - cx;
		distY = closestY - cy;
		const distance = Math.sqrt((distX * distX) + (distY * distY));

		if (distance <= diameter / 2) {
			return true;
		}
		return false;
	}

	collidePointPoly(px: number, py: number, vertices: Point[]) {
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
			if (((vc.y >= py && vn.y < py) || (vc.y < py && vn.y >= py))
                && (px < (vn.x - vc.x) * (py - vc.y) / (vn.y - vc.y) + vc.x)) {
				collision = !collision;
			}
		}
		return collision;
	}

	// POLYGON/CIRCLE
	collideCirclePoly(cx: number, cy: number, diameter: number, vertices: Point[], interior: boolean = false) {
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
			const collision = this.collideLineCircle(vc.x, vc.y, vn.x, vn.y, cx, cy, diameter);
			if (collision) return true;
		}

		// test if the center of the circle is inside the polygon
		if (interior === true) {
			const centerInside = this.collidePointPoly(cx, cy, vertices);
			if (centerInside) return true;
		}

		// otherwise, after all that, return false
		return false;
	}
}

export const collisionDetection = new CollisionDetection();
