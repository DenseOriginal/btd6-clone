import { sprayAOE } from './enemyClass';
import { TurretParent } from './turretParentClass';

export class SprayTower extends TurretParent {
	public shootTimeOut: number = 0;
	public sprayTimeOut: number = 0;
	public rangeMod: number = 2.2;

	constructor(
		public diameter: number,
		public positionX: number,
		public positionY: number,
		public rateOfFire: number,
		public sprayTime: number,
	) {
		super(diameter, positionX, positionY, rateOfFire);
	}

	update() {
		this.draw();
		this.shoot();
	}

	draw() {
		push();
		noStroke();
		fill(255, 100, 100);

		circle(this.positionX, this.positionY, this.diameter);

		strokeWeight(10);
		stroke(255, 50, 50);

		for (let i = 0; i < 8; i++) {
			const rotX = cos(this.angle + (i * QUARTER_PI)) * this.diameter * 0.75;
			const rotY = sin(this.angle + (i * QUARTER_PI)) * this.diameter * 0.75;

			line(
				this.positionX,
				this.positionY,
				this.positionX + rotX,
				this.positionY + rotY,
			);
		}

		pop();
	}

	shoot() {
		if (this.shootTimeOut === this.rateOfFire) {
			if (this.sprayTimeOut != this.sprayTime) {
				push();
				fill(0, 200, 0, 100);
				circle(this.positionX, this.positionY, this.diameter * this.rangeMod);
				pop();
				sprayAOE(this);
				this.sprayTimeOut++;
			} else {
				this.sprayTimeOut = 0;
				this.shootTimeOut = 0;
			}
		} else {
			this.shootTimeOut++;
		}
	}
}
