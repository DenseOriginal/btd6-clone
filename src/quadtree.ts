import { Enemy } from "./enemyClass";
import { GatlingProjectile } from "./gatlingProjectile";

export function collideRectCircle(rx: number, ry: number, rw: number, rh: number, cx: number, cy: number, diameter: number) {
    //2d
    // temporary variables to set edges for testing
    var testX = cx;
    var testY = cy;

    // which edge is closest?
    if (cx < rx) {
        testX = rx       // left edge
    } else if (cx > rx + rw) { testX = rx + rw }   // right edge

    if (cy < ry) {
        testY = ry       // top edge
    } else if (cy > ry + rh) { testY = ry + rh }   // bottom edge

    // // get distance from closest edges
    var distance = dist(cx, cy, testX, testY)

    // if the distance is less than the radius, collision!
    if (distance <= diameter / 2) {
        return true;
    }
    return false;
};

export class Quadtree {
    public objects: Enemy[] = [];
    public nodes: Quadtree[] | null[] = [];
    constructor(public x: number, public y: number, public width: number, public height: number, public maxObjects: number, public maxLevels: number, public level: number) {
        this.level = level || 0;
    }

    clear() {
        this.objects = [];
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i]) {
                this.nodes[i].clear();
                this.nodes[i] = null;
            }
        }
        this.nodes = [];
    }

    split1() {
        let subWidth = this.width / 2;
        let subHeight = this.height / 2;
        let x = this.x;
        let y = this.y;

        this.nodes[0] = new Quadtree(
            x + subWidth,
            y,
            subWidth,
            subHeight,
            this.maxObjects,
            this.maxLevels,
            this.level + 1
        );
        this.nodes[1] = new Quadtree(
            x,
            y,
            subWidth,
            subHeight,
            this.maxObjects,
            this.maxLevels,
            this.level + 1
        );
        this.nodes[2] = new Quadtree(
            x,
            y + subHeight,
            subWidth,
            subHeight,
            this.maxObjects,
            this.maxLevels,
            this.level + 1
        );
        this.nodes[3] = new Quadtree(
            x + subWidth,
            y + subHeight,
            subWidth,
            subHeight,
            this.maxObjects,
            this.maxLevels,
            this.level + 1
        );
    }

    getIndex(object: Enemy | GatlingProjectile) {
        if (object != undefined) {
            let index = -1;
            let verticalMidpoint = this.x + this.width / 2;
            let horizontalMidpoint = this.y + this.height / 2;

            let topQuadrant = object.position.y < horizontalMidpoint && object.position.y + object.height < horizontalMidpoint;
            let bottomQuadrant = object.position.y > horizontalMidpoint;

            if (
                object.position.x < verticalMidpoint &&
                object.position.x + object.width < verticalMidpoint
            ) {
                if (topQuadrant) {
                    index = 1;
                } else if (bottomQuadrant) {
                    index = 2;
                }
            } else if (object.position.x > verticalMidpoint) {
                if (topQuadrant) {
                    index = 0;
                } else if (bottomQuadrant) {
                    index = 3;
                }
            }

            return index;
        }
    }

    insert(object: Enemy) {
        if (this.nodes.length > 0) {
            let index = this.getIndex(object);
            if (index !== -1) {
                this.nodes[index].insert(object);
                return;
            }
        }

        this.objects.push(object);

        if (this.objects.length > this.maxObjects && this.nodes.length === 0) {
            this.split1();
            let i = 0;
            while (i < this.objects.length) {
                let index = this.getIndex(this.objects[i]);
                if (index !== -1) {
                    this.nodes[index].insert(this.objects.splice(i, 1)[0]);
                } else {
                    i++;
                }
            }
        }
    }
    retrieve(object: GatlingProjectile) {
        if (object != undefined) {
            let index = this.getIndex(object);
            let returnObjects = this.objects;
            if (this.nodes.length > 0) {
                if (index !== -1) {
                    returnObjects = returnObjects.concat(
                        this.nodes[index].retrieve(object)
                    );
                } else {
                    for (let i = 0; i < this.nodes.length; i++) {
                        returnObjects = returnObjects.concat(this.nodes[i].retrieve(object));
                    }
                }
            }
            return returnObjects;

        }
    }

    draw() {
        push();
        noFill();
        stroke(120);
        rect(this.x, this.y, this.width, this.height);
        pop();
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].draw();
        }
    }
    remove(object: Enemy) {
        let index = this.getIndex(object);
        if (index !== -1 && this.nodes.length > 0) {
            this.nodes[index].remove(object);
            return;
        }
        let i = this.objects.indexOf(object);
        if (i !== -1) {
            this.objects.splice(i, 1);
        }
    }
}
