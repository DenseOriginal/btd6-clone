export class GatlingProjectile {
	public beenHit: number = 0;
	public directionDegreeScaled: number;
	public directionX: number;
	public directionY: number;

	constructor(
		public size: number,
		public speed: number,
		public positionX: number,
		public positionY: number,
		public directionDegree: number,
	) {
		this.directionDegreeScaled = directionDegree * 1000;
		this.directionDegree = round(randomGaussian(this.directionDegreeScaled, 180)) / 1000;
		this.directionX = cos(this.directionDegree);
		this.directionY = sin(this.directionDegree);
	}

	update() {
		this.hitBoxHitCheck()
		if (this.beenHit < 1) {
			this.positionX += this.directionX * this.speed;
			this.positionY += this.directionY * this.speed;
			circle(this.positionX, this.positionY, this.size);
		}
	}

	hitBoxHitCheck() {
		if (
			//sæt en anden criteria plz
			dist(this.positionX, this.positionY, mouseX, mouseY) < this.size / 2
		) {
			this.beenHit++;
			return true;
		} else {
			return false;
		}
	}
}