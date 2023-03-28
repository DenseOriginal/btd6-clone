export abstract class TurretParent {
  public shootTimeOut: number = 0;
  
  constructor(
    public size: number,
    public positionX: number,
    public positionY: number,
    public rateOfFire: number,
    public projectileSpeed: number,
    public sprayTime: number
  ) { }

  abstract update(directionDegree: number): void
  abstract shoot(): void
}