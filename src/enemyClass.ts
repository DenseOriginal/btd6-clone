//Nothing in here

class Enemy {
    pos: Point;
    path: Array<Point>;
    constructor(pos: Point, path: Array<Point>) {
        this.pos = { x: pos.x, y: pos.y };
        this.path = path;

    }
}