//Nothing in here
import { settings } from "./settings";
import { getPath } from "./pathfindering"

let enemies: Enemy[] = [];
let enemiesSpawnIntervalHook: number;

export function spawnEnemyInterval(spawn: boolean) {
    clearInterval(enemiesSpawnIntervalHook)
	if(spawn){enemiesSpawnIntervalHook=setInterval(spawnEnemy, 2500)};
}

function spawnEnemy() {
    enemies.push(new Enemy(0.3));
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

export class Enemy {
    path: Point[];
    currentTargetIndex: number;
    speed: number;
    position: Point;
    isAlive: boolean = true;

    constructor(speed: number) {
        const size = settings.gridSize
        const rows = Math.ceil(height / size);
        const cols = Math.ceil(width / size);
        this.path = getPath(
            { x: 0, y: Math.floor(rows / 2) },
            { x: cols - 1, y: Math.floor(rows / 2) }
        );
        this.path = this.path.map((point) => {
            return {
                x: point.x * settings.gridSize,
                y: point.y * settings.gridSize + settings.gridSize / 2,
            };
        });
        this.currentTargetIndex = 1;
        this.speed = speed;
        this.position = this.path[0];
        const lastPoint = this.path[this.path.length - 1];
        const dx = lastPoint.x - this.path[this.path.length - 2].x;
        const dy = lastPoint.y - this.path[this.path.length - 2].y;
        const extensionX = lastPoint.x + dx;
        const extensionY = lastPoint.y + dy;
        this.path.push({ x: extensionX, y: extensionY });
        this.path.push({ x: extensionX, y: extensionY });
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
                this.isAlive = false;
            }
        }
        this.render();
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
        translate(this.position.x, this.position.y);
        rotate(angle);
        rect(0 - 10, 0 - 5, 20, 10);
        pop();
    }
}

