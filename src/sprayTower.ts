import { TurretParent } from "./turretParentClass";

export class SprayTower extends TurretParent {
  public shootTimeOut: number = 0;
  public sprayTimeOut: number = 0;

  update() {
    this.shoot();
    circle(this.positionX, this.positionY, this.size);
  }

  hitBoxHitCheck() {
    if (dist(this.positionX, this.positionY, mouseX, mouseY) <= this.size * 2.5 / 2) {
      print('hit');
      return true;
    } else {
      return false;
    }
  }

  shoot() {
    if (this.shootTimeOut === this.rateOfFire) {
      if (this.sprayTimeOut != this.sprayTime) {
        push();
        fill(0, 200, 0, 100);
        circle(this.positionX, this.positionY, this.size * 2);
        pop();
        this.hitBoxHitCheck();
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