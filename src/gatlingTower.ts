import { GatlingProjectile } from "./gatlingProjectile";
import { TurretParent } from "./turretParentClass";

export class GatlingTower extends TurretParent {
  public barrelTipX: number = 0;
  public barrelTipY: number = 0;
  public shots: GatlingProjectile[] = [];
  public shootTimeOut: number = 0;

  update() {
    const directionX = cos(this.angle);
    const directionY = sin(this.angle);
    this.barrelTipX = this.size * 1.5 * directionX + this.positionX;
    this.barrelTipY = this.size * 1.5 * directionY + this.positionY;
    line(this.positionX, this.positionY, this.barrelTipX, this.barrelTipY);
    circle(this.positionX, this.positionY, this.size);
    this.shoot();
  }

  shoot() {
    if (this.shootTimeOut === this.rateOfFire) {
      this.shots.push(new GatlingProjectile(this.size * 0.5, this.projectileSpeed, this.barrelTipX, this.barrelTipY, this.angle));
      this.shootTimeOut = 0;
    } else {
      this.shootTimeOut++;
    }
  }

  updateShots() {
    for (let i = this.shots.length - 1; i > 0; i--) {
      this.shots[i].update();
      if (this.shots[i].positionX > width
        || this.shots[i].positionX < 0
        || this.shots[i].positionY > height
        || this.shots[i].positionY < 0) {
        this.shots.splice(i, 1);
      }
    }
  }
}