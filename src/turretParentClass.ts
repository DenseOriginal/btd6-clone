export abstract class TurretParent {
	public shootTimeOut: number = 0;
	public angle: number = 0;

	// eslint-disable-next-line no-useless-constructor
	constructor(
		public diameter: number,
		public positionX: number,
		public positionY: number,
		public rateOfFire: number,
		// eslint-disable-next-line no-empty-function
	) { }

	abstract update(): void;
	abstract draw(): void;
	abstract shoot(): void;

	updateFromPlacement(update: TurretPlacement) {
		this.diameter = update.diameter;
		this.angle = update.angle;
		this.positionX = update.center.x;
		this.positionY = update.center.y;
	}
}
