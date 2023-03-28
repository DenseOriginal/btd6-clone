export class SprayTower {
  public shootTimeOut: number = 0;
  public sprayTimeOut: number = 0;
  angle: number = 0; // Unused but fixes type errors

  constructor(
    public size: number,
    public positionX: number,
    public positionY: number,
    public rateOfFire: number,
    public sprayTime: number
  ) { }

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