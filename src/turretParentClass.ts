export abstract class TurretParent {
	public shootTimeOut: number = 0;
	public angle: number = 0;

	constructor(
		public diameter: number,
		public positionX: number,
		public positionY: number,
		public rateOfFire: number,
		public projectileSpeed: number,
		public sprayTime: number
	) { }

	abstract update(directionDegree: number): void
	abstract draw(): void
	abstract shoot(): void
}