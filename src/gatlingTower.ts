import { GatlingProjectile } from './gatlingProjectile';
import { settings } from './settings';
import { TurretParent } from './turretParentClass';

export const allShots: GatlingProjectile[] = [];
export function updateAllShots() {
	for (let i = allShots.length - 1; i >= 0; i--) {
		allShots[i].update();
		if (allShots[i].positionX > width
			|| allShots[i].positionX < 0
			|| allShots[i].positionY > height
			|| allShots[i].positionY < 0) {
			allShots.splice(i, 1);
		}
	}
}
export class GatlingTower extends TurretParent {
	public barrelTipX: number = 0;
	public barrelTipY: number = 0;
	public shots: GatlingProjectile[] = [];
	public shootTimeOut: number = 0;

	constructor(
		public diameter: number,
		public positionX: number,
		public positionY: number,
		public rateOfFire: number,
		public projectileSpeed: number,
	) {
		super(diameter, positionX, positionY, rateOfFire);
	}

	update() {
		const directionX = cos(this.angle);
		const directionY = sin(this.angle);
		this.barrelTipX = this.diameter * 1 * directionX + this.positionX;
		this.barrelTipY = this.diameter * 1 * directionY + this.positionY;

		this.draw();
		this.shoot();
		// this.updateShots();
	}

	draw() {
		push();
		noStroke();
		fill(255, 100, 100);

		circle(this.positionX, this.positionY, this.diameter);

		strokeWeight(10);
		stroke(255, 50, 50);

		line(
			this.positionX,
			this.positionY,
			this.barrelTipX,
			this.barrelTipY,
		);
		pop();
	}

	shoot() {
		if (this.shootTimeOut == settings.rateOfGatling) {
			allShots.push(new GatlingProjectile(this.diameter / 8, this.projectileSpeed, this.barrelTipX, this.barrelTipY, this.angle));
			this.shootTimeOut = 0;
		} else {
			this.shootTimeOut++;
		}
	}

	updateShots() {
		for (let i = allShots.length - 1; i > 0; i--) {
			allShots[i].update();
			if (allShots[i].positionX > width
				|| allShots[i].positionX < 0
				|| allShots[i].positionY > height
				|| allShots[i].positionY < 0) {
				allShots.splice(i, 1);
			}
		}
	}
}
