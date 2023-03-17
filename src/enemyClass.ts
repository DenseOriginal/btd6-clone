//Nothing in here

import { Vector } from "p5";

export class Enemy {
    pos: Point;
    currentPath: number = 0;
    nextPath: Point = { x: 0, y: 0 };
    pathVector: Vector = createVector(0, 0);
    isAlive: boolean = true;

    constructor(
        public path: Point[],
        public health: number,
        public speed: number
    ) {
        this.pos = path[this.currentPath];
    }
    update() {
        push();
        rect(this.pos.x, this.pos.y, 3, 2);
        pop();

        if (this.currentPath + 1 < this.path.length) {
            this.nextPath = this.path[this.currentPath + 1];
            this.pathVector = createVector(this.nextPath.x - this.path[this.currentPath].x, this.nextPath.y - this.path[this.currentPath].y);
            this.pos.x += this.speed * this.pathVector.x / this.pathVector.mag() * deltaTime;

            if (dist(this.path[this.currentPath].x, this.path[this.currentPath].y, this.nextPath.x, this.nextPath.y) >= this.pathVector.mag()) {
                this.currentPath += 1;
                this.pos.x = this.nextPath.x;
                this.pos.y = this.nextPath.y;
            }
        } else {
            this.isAlive = false;
        }
    }

}
