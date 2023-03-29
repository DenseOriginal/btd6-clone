// Nothing in here
import { settings } from './settings';
import { getCurrentGridMatrix, getPath } from './pathfindering';
import { collideRectCircle, Quadtree } from './quadtree';
import { allShots } from './gatlingTower';

const enemies: Enemy[] = [];
export let quadtree: Quadtree;
export function initQuadtree() {
	quadtree = new Quadtree(0, 0, width, height, 4, 10, 0);
}
let enemiesSpawnIntervalHook: number;

export function initEnemySpawner() {
	updateEnemySpawnInterval(settings.enemySpawnRate);
}

export function updateEnemySpawnInterval(spawnRate: number) {
	clearInterval(enemiesSpawnIntervalHook);
	enemiesSpawnIntervalHook = setInterval(() => {
		if (settings.spawnEnemies) {
			spawnEnemy();
		}
	}, spawnRate);
}

function spawnEnemy() {
	enemies.push(new Enemy(settings.enemyBaseSpeed, quadtree));
}

export function updateEnemies() {
	for (let idx = enemies.length - 1; idx >= 0; idx--) {
		const enemy = enemies[idx];
		if (!enemy.isAlive) {
			quadtree.remove(enemies[idx]);
			enemies.splice(idx, 1);
			continue;
		}

		enemy.update();
	}
}

export function validateAllEnemyPaths() {
	console.log('Re-validating enemy paths');

	for (const enemy of enemies) {
		enemy.isPathStillValid();
	}
}

export class Enemy {
	width: number = 60;
	height: number = 20;
	path: Point[] = [];
	rawPath: Point[] = []; // This is only to check if the path has been obstructed by objects, since this.path is being mapped to pixels, instead of rows and cols
	currentTargetIndex: number = 0;
	position: Point = { x: 0, y: 0 };
	isAlive: boolean = true;
	color: number = random(0, 360);

	constructor(
		public speed: number,
		public quadtree: Quadtree,
	) {
		const size = settings.gridSize;
		const rows = Math.ceil(height / size);

		const spawnSize = rows * settings.spawnBoxSize;
		const yOffset = (rows - spawnSize) / 2;

		const start = {
			x: 0,
			y: Math.floor(random(yOffset, yOffset + spawnSize)),
		};
		this.calculateNewPath(start);
	}

	update() {
		if (!this.isAlive) {
			return;
		}
		// Move towards the current target point
		const targetPoint = this.path[this.currentTargetIndex];
		const distanceToTarget = Math.sqrt(
			(targetPoint.x - this.position.x) ** 2 + (targetPoint.y - this.position.y) ** 2,
		);
		const direction = {
			x: (targetPoint.x - this.position.x) / distanceToTarget,
			y: (targetPoint.y - this.position.y) / distanceToTarget,
		};
		this.position.x += direction.x * this.speed * deltaTime;
		this.position.y += direction.y * this.speed * deltaTime;

		// Check if we've reached the current target point
		if (distanceToTarget < this.speed * deltaTime) {
			this.position = targetPoint;
			this.currentTargetIndex++;
			if (this.currentTargetIndex >= this.path.length) {
				this.die();
			}
		}
		this.render();
		this.quadtree.insert(this);
	}

	isPathStillValid() {
		// Get the cached grid, this is efficient as we dont calculate a new path on every call
		const currentGrid = getCurrentGridMatrix();

		// Loop through the raw path, and make sure every point in the path is walkable
		// the 'isPathClear' variable will only be true if every point is clear
		const isPathClear = this.rawPath.every((point) => currentGrid.isWalkableAt(point.x, point.y));

		// If the path is not clear, calculate a new path, from the current position
		if (!isPathClear) {
			const currentPoint = this.rawPath[this.currentTargetIndex];
			if (!currentPoint || !currentGrid.isWalkableAt(currentPoint.x, currentPoint.y)) {
				console.warn('Enemy was squashed');
				return this.die();
			}

			this.calculateNewPath(currentPoint);
		}
	}

	private calculateNewPath(start: Point) {
		const size = settings.gridSize;
		const rows = Math.ceil(height / size);
		const cols = Math.ceil(width / size);
		this.rawPath = getPath(
			start,
			{ x: cols - 1, y: Math.floor(rows / 2) },
		);

		if (this.rawPath.length < 2) return this.die();

		this.path = this.rawPath.map((point) => ({
			x: point.x * settings.gridSize,
			y: point.y * settings.gridSize + settings.gridSize / 2,
		}));
		this.currentTargetIndex = 1;
		this.position = this.path[0];
		try {
			const lastPoint = this.path[this.path.length - 1];
			const dx = lastPoint.x - this.path[this.path.length - 2].x;
			const dy = lastPoint.y - this.path[this.path.length - 2].y;
			const extensionX = lastPoint.x + dx;
			const extensionY = lastPoint.y + dy;
			this.path.push({ x: extensionX, y: extensionY });
			this.path.push({ x: extensionX, y: extensionY });
		} catch (error) {
			console.log(error);
			console.log({ raw: this.rawPath, path: this.path });
		}
	}

	// Some goofy looking enemies
	render() {
		const nextPoint = this.path[this.currentTargetIndex + 1];
		if (!nextPoint) {
			return;
		}

		const dx = nextPoint.x - this.position.x;
		const dy = nextPoint.y - this.position.y;
		const angle = Math.atan2(dy, dx);

		push();
		// Draw the enemies path
		colorMode(HSB, 360);
		stroke(this.color, 360, 360);
		noFill();
		beginShape();
		for (let i = this.currentTargetIndex; i < this.path.length; i++) {
			const point = this.path[i];
			vertex(point.x, point.y);
		}
		endShape();

		noStroke();
		fill(this.color, 360, 360);
		translate(this.position.x, this.position.y);
		rotate(angle + PI);

		// This are relative to the current origin, and we have already translated to the enemy position
		const xPos = 0;
		const yPos = 0;
		const scale = 0.2;

		// Enemy Ship Design
		noStroke();
		fill(this.color % 360, 360, 300);
		ellipse(xPos, yPos, 100 * scale, 100 * scale);
		triangle(xPos + (60 * scale), yPos + (75 * scale), xPos + (120 * scale), yPos + (100 * scale), xPos + (250 * scale), yPos + (20 * scale));
		triangle(xPos + (60 * scale), yPos - (75 * scale), xPos + (120 * scale), yPos - (100 * scale), xPos + (250 * scale), yPos - (20 * scale));
		quad(xPos - (350 * scale), yPos + (30 * scale), xPos - (220 * scale), yPos + (30 * scale), xPos + (70 * scale), yPos + (75 * scale), xPos + (170 * scale), yPos + (120 * scale));
		quad(xPos - (350 * scale), yPos - (30 * scale), xPos - (220 * scale), yPos - (30 * scale), xPos + (70 * scale), yPos - (75 * scale), xPos + (170 * scale), yPos - (120 * scale));

		fill((this.color + 100) % 360, 360, 300);
		ellipse(xPos - (32 * scale), yPos, 30 * scale, 30 * scale);
		quad(xPos + (15 * scale), yPos + (50 * scale), xPos - (10 * scale), yPos + (50 * scale), xPos + (5 * scale), yPos + (65 * scale), xPos + (80 * scale), yPos + (80 * scale));
		quad(xPos + (15 * scale), yPos - (50 * scale), xPos - (10 * scale), yPos - (50 * scale), xPos + (5 * scale), yPos - (65 * scale), xPos + (80 * scale), yPos - (80 * scale));

		colorMode(RGB, 255);

		// Thruster Flame
		fill(255, 255, 0);
		triangle(xPos + (60 * scale), yPos + (20 * scale), xPos + (60 * scale), yPos - (20 * scale), xPos + (400 * scale), yPos);
		fill(240, 200, 60);
		triangle(xPos + (60 * scale), yPos + (10 * scale), xPos + (60 * scale), yPos - (10 * scale), xPos + (300 * scale), yPos);

		pop();
	}

	die() {
		this.isAlive = false;
	}
}

export function bulletsCollide() {
	for (let i = allShots.length - 1; i >= 0; i--) {
		const projectile = allShots[i];

		// Retrieve objects in the quadtree that overlap with the projectile
		const objects = quadtree.retrieve(projectile) || [];
		for (let j = 0; j < objects.length; j++) {
			const object = objects[j];
			if (
				object instanceof Enemy
				&& collideRectCircle(
					object.position.x,
					object.position.y,
					object.width,
					object.height,
					projectile.positionX,
					projectile.positionY,
					projectile.diameter,
				)
			) {
				console.log('Hit!', object);
				allShots.splice(i, 1);
				object.isAlive = false;
			}
		}
	}
}
