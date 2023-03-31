export class GatlingProjectile {
	public beenHit: number = 0;
	public directionDegreeScaled: number;
	public directionX: number;
	public directionY: number;
	public position: Point = { x: 0, y: 0 };
	public width: number = 0;
	public height: number = 0;

	constructor(
		public diameter: number,
		public speed: number,
		public positionX: number,
		public positionY: number,
		public directionDegree: number,
	) {
		this.directionDegreeScaled = directionDegree * 1000;
		this.directionDegree = round(randomGaussian(this.directionDegreeScaled, 180)) / 1000;
		this.directionX = cos(this.directionDegree);
		this.directionY = sin(this.directionDegree);
		this.width = diameter;
		this.height = diameter;
	}

	update() {
		if (this.beenHit < 1) {
			this.positionX += this.directionX * this.speed / 100 * deltaTime;
			this.positionY += this.directionY * this.speed / 100 * deltaTime;
			push();
			fill(255);
			noStroke();
			circle(this.positionX, this.positionY, this.diameter);
			pop();
			this.position = { x: this.positionX, y: this.positionY };
		}
	}

	hitBoxHitCheck() {
		if (
			// sæt en anden criteria plz
			dist(this.positionX, this.positionY, mouseX, mouseY) < this.diameter / 2
		) {
			this.beenHit++;
			return true;
		}
		return false;
	}
}
