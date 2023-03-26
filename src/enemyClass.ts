//Nothing in here
import { settings } from "./settings";
import { getCurrentGridMatrix, getPath } from "./pathfindering"

let enemies: Enemy[] = [];
let enemiesSpawnIntervalHook: number;

export function initEnemySpawner() {
	updateEnemySpawnInterval(settings.enemySpawnRate)
}

export function updateEnemySpawnInterval(spawnRate: number) {
	clearInterval(enemiesSpawnIntervalHook)
	enemiesSpawnIntervalHook = setInterval(() => {
		if (settings.spawnEnemies) {
			spawnEnemy();
		}
	}, spawnRate);
}

function spawnEnemy() {
    enemies.push(new Enemy(settings.enemyBaseSpeed));
}

export function updateEnemies() {
	for (let idx = enemies.length - 1; idx >= 0; idx--) {
		const enemy = enemies[idx];
		if (!enemy.isAlive) {
			enemies.splice(idx, 1);
			continue;
		}

		enemy.update();
	}
}

export function validateAllEnemyPaths() {
	for (const enemy of enemies) {
		enemy.isPathStillValid();
	}
}

export class Enemy {
    path: Point[] = [];
	rawPath: Point[] = []; // This is only to check if the path has been obstructed by objects, since this.path is being mapped to pixels, instead of rows and cols
    currentTargetIndex: number = 0;
    position: Point = { x: 0, y: 0 };
    isAlive: boolean = true;

    constructor(
		public speed: number
	) {
		const size = settings.gridSize
        const rows = Math.ceil(height / size);
		const start = { x: 0, y: Math.floor(rows / 2) }
        this.calculateNewPath(start);
    }

    update() {
        if (!this.isAlive) {
            return;
        }
        // Move towards the current target point
        const targetPoint = this.path[this.currentTargetIndex];
        const distanceToTarget = Math.sqrt(
            (targetPoint.x - this.position.x) ** 2 + (targetPoint.y - this.position.y) ** 2
        );
        const direction = {
            x: (targetPoint.x - this.position.x) / distanceToTarget,
            y: (targetPoint.y - this.position.y) / distanceToTarget
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
    }

	isPathStillValid() {
		// Get the cached grid, this is efficient as we dont calculate a new path on every call
		const currentGrid = getCurrentGridMatrix();

		// Loop through the raw path, and make sure every point in the path is walkable
		// the 'isPathClear' variable will only be true if every point is clear
		const isPathClear = this.rawPath.every((point) => currentGrid.isWalkableAt(point.x, point.y));

		// If the path is not clear, calculate a new path, from the current position
		if (!isPathClear) {
			const currentPoint = this.rawPath[this.currentTargetIndex]
			if (!currentPoint || !currentGrid.isWalkableAt(currentPoint.x, currentPoint.y)) {
				console.warn('Enemy was squashed');
				return this.die();
			}

			this.calculateNewPath(currentPoint);
		}
	}

	private calculateNewPath(start: Point) {
		const size = settings.gridSize
        const rows = Math.ceil(height / size);
        const cols = Math.ceil(width / size);
        this.rawPath = getPath(
            start,
            { x: cols - 1, y: Math.floor(rows / 2) }
        );

		if (this.rawPath.length < 2) return this.die();
	
        this.path = this.rawPath.map((point) => {
            return {
                x: point.x * settings.gridSize,
                y: point.y * settings.gridSize + settings.gridSize / 2,
            };
        });
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

    //Some goofy looking enemies
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
		stroke(0, 175);
		noFill()
		beginShape()
		for (let i = this.currentTargetIndex; i < this.path.length; i++) {
			const point = this.path[i];
			vertex(point.x, point.y)
		}
		endShape()

		noStroke()
		fill(0)
        translate(this.position.x, this.position.y);
        rotate(angle);
        rect(0 - 10, 0 - 5, 20, 10);
        pop();
    }

	die() {
		this.isAlive = false;
	}
}

