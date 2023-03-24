import { Color } from "p5";


class Square {
    color: Color = color(200, 200, 200);
    isActive: boolean = false;
    constructor(
        public x: number,
        public y: number,
        public size: number
    ) { }

    display() {
        push();
        fill(this.color);
        rect(this.x, this.y, this.size, this.size);
        pop();
    }
    active() {
        this.color = color(255, 0, 0);
        this.isActive = true;
    }
    deactive() {
        this.color = color(200, 200, 200);
        this.isActive = false;
    }
}

class PathFinder {
    debug: boolean;
    solution: unknown;
    squares: Square[][];
    cols: number;
    rows: number;
    grid: Mure[][];
    openSet: Mure[];
    closedSet: Mure[];
    path: Mure[];
    w: number;
    h: number;
    wallsArr: Wall[];
    start: Mure;
    slut: Mure;

    constructor(cols: number, debug: boolean) {
        this.debug = debug || false;
        this.solution = undefined;
        this.squares = []; // array to hold Square objects
        // Hvor mange kolonner og rækker?
        this.cols = cols;
        this.rows = int((height * this.cols) / width);

        // Dette vil være 2D-arrayet
        this.grid = new Array(this.cols);
        this.squares = new Array(this.cols);

        // Open og closed sæt
        this.openSet = [];
        this.closedSet = [];

        print(this.rows);
        // Vejen taget
        this.path = [];

        // Gittercellestørrelse
        this.w = width / this.cols;
        this.h = height / this.rows;

        this.wallsArr = []; //Array of the walls called rect :shrug: rename later

        for (let i = 0; i < this.cols; i++) {
            this.squares[i] = new Array(this.rows);
        }

        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                this.squares[i][j] = new Square(
                    i * this.w,
                    j * this.h,
                    this.w * this.h
                );
            }
        }

        // laver et 2D-array
        for (let i = 0; i < this.cols; i++) {
            this.grid[i] = new Array(this.rows);
        }

        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                this.grid[i][j] = new Mure(i, j, this.w, this.h, this.cols, this.rows);
            }
        }

        // Alle naboerne
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                this.grid[i][j].addnaboer(this.grid);
            }
        }

        // Start og Slut
        this.start = this.grid[0][0];
        this.slut = this.grid[this.cols - 1][this.rows - 1];
        this.start.mur = false;
        this.slut.mur = false;
        // openSet starter kun med begyndelsen
        this.openSet.push(this.start);
    }
    reset() {
        this.solution = undefined;

        this.openSet = [];
        this.closedSet = [];

        // Vejen taget
        this.path = [];
        // laver et 2D-array
        for (let i = 0; i < this.cols; i++) {
            this.grid[i] = new Array(this.rows);
        }

        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                this.grid[i][j] = new Mure(i, j, this.w, this.h, this.cols, this.rows);
            }
        }

        // Alle naboerne
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                this.grid[i][j].addnaboer(this.grid);
            }
        }

        // Start og Slut
        this.start = this.grid[0][0];
        this.slut = this.grid[this.cols - 1][this.rows - 1];
        this.start.mur = false;
        this.slut.mur = false;
        // openSet starter kun med begyndelsen
        this.openSet.push(this.start);
    }
    setWalls(...walls: Wall[]) {

        this.wallsArr = walls;

    }
    removeFromArray(arr: Mure[], elt: Mure) {
        for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i] == elt) {
                arr.splice(i, 1);
            }
        }
    }
    heuristic(a: Mure, b: Mure) {
        let d = dist(a.i, a.j, b.i, b.j);
        return d;
    }
    pathFind(drawB: boolean) {
        let nuværende = undefined;
        let midG = undefined;
        // Søger jeg stadig?
        if (this.openSet.length > 0) {
            // næste bedste mulighed
            let IndexVærdie = 0;
            for (let i = 0; i < this.openSet.length; i++) {
                if (this.openSet[i].f < this.openSet[IndexVærdie].f) {
                    IndexVærdie = i;
                }
            }
            nuværende = this.openSet[IndexVærdie];

            // Blev jeg færdig?
            if (nuværende === this.slut) {
                this.solution = true;
                return this.path;
            }


            // Bedste mulighed flyttes fra openSet til closedSet
            this.removeFromArray(this.openSet, nuværende);
            this.closedSet.push(nuværende);

            // Tjek alle naboerne
            const naboer = nuværende.naboer;
            for (let i = 0; i < naboer.length; i++) {
                const nabo = naboer[i];

                // Gyldig næste plads?
                if (!this.closedSet.includes(nabo) && !nabo.mur) {
                    midG =
                        nuværende.g + this.heuristic(nabo, nuværende);

                    // Er dette en bedre vej i sammenligning til den tidliger ?
                    let newPath = false;
                    if (this.openSet.includes(nabo)) {
                        if (midG < nabo.g) {
                            nabo.g = midG;
                            newPath = true;
                        }
                    } else {
                        nabo.g = midG;
                        newPath = true;
                        this.openSet.push(nabo);
                    }

                    // Ja, det er en bedre vej
                    if (newPath) {
                        nabo.h = this.heuristic(nabo, this.slut);
                        nabo.f = nabo.g + nabo.h;
                        nabo.previous = nuværende;
                    }
                }
            }
            // Åh, ingen løsning
        } else if (nuværende != this.slut) {
            this.solution = false;
            return false;
        }

        // Find stien ved at arbejde baglæns
        this.path = [];
        midG = nuværende;
        this.path.push(midG);
        while (midG.previous) {
            this.path.push(midG.previous);
            midG = midG.previous;
        }
        if (drawB) {
            push();
            // Tegn nuværende tilstand af alt

            for (let i = 0; i < this.cols; i++) {
                for (let j = 0; j < this.rows; j++) {
                    this.grid[i][j].show(color(0));
                }
            }

            for (let i = 0; i < this.closedSet.length; i++) {
                this.closedSet[i].show(color(255, 0, 0, 50));
            }

            for (let i = 0; i < this.openSet.length; i++) {
                this.openSet[i].show(color(0, 255, 0, 50));
            }

            for (let i = 0; i < this.path.length; i++) {
                this.path[i].show(color(255, 255, 255));
            }

            fill(0, 255, 0);
            rect(0, 0, 20, 20);

            fill(255, 0, 0);
            rect(785, 785, 15, 15);

            // Tegning af sti som er kontinuerlig linje
            noFill();
            stroke(0, 0, 155);
            strokeWeight(this.w / 3);
            beginShape();
            for (let i = 0; i < this.path.length; i++) {
                vertex(
                    this.path[i].i * this.w + this.w / 2,
                    this.path[i].j * this.h + this.h / 2
                );
            }
            endShape();
            pop();
        }
    }
    collision(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): Point | false {
        // calculate the distance to intersection point
        let uA =
            ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
            ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
        let uB =
            ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
            ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

        // if uA and uB are between 0-1, lines are colliding
        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            // optionally, draw a circle where the lines meet
            let intersectionX = x1 + uA * (x2 - x1);
            let intersectionY = y1 + uA * (y2 - y1);
            if (this.debug) {
                push();
                fill(255, 255, 0);
                noStroke();
                ellipse(intersectionX, intersectionY, 20, 20); //draw circle on intersection for debugging
                pop();
            }
            return { x: intersectionX, y: intersectionY };
        }
        return false;
    }

    update() {
        for (let x = 0; x < this.squares.length; x++) {
            for (let y = 0; y < this.squares[x].length; y++) {
                if (this.debug) {
                    this.squares[x][y].display();
                }
                for (let rectangl of this.wallsArr) {
                    let collisionX = undefined;
                    let collisionY = undefined;
                    for (let j = 0; j < 4; j++) {
                        collisionX = this.collision(
                            this.squares[x][y].x,
                            0,
                            this.squares[x][y].x,
                            height,
                            rectangl.corners[j].x,
                            rectangl.corners[j].y,
                            rectangl.corners[(j + 1) % 4].x,
                            rectangl.corners[(j + 1) % 4].y
                        );
                        collisionY = this.collision(
                            0,
                            this.squares[x][y].y,
                            width,
                            this.squares[x][y].y,
                            rectangl.corners[j].x,
                            rectangl.corners[j].y,
                            rectangl.corners[(j + 1) % 4].x,
                            rectangl.corners[(j + 1) % 4].y
                        );
                        if (collisionX) {
                            try {
                                this.squares[floor(collisionX.x / this.w) - 1][
                                    floor(collisionX.y / this.h)
                                ].active();
                                this.squares[floor(collisionX.x / this.w)][
                                    floor(collisionX.y / this.h)
                                ].active();
                            } catch (e) { }
                        }
                        if (collisionY) {
                            try {
                                this.squares[floor(collisionY.x / this.w)][
                                    floor(collisionY.y / this.h)
                                ].active();
                                this.squares[floor(collisionY.x / this.w)][
                                    floor(collisionY.y / this.h) - 1
                                ].active();
                            } catch (e) { }
                        } else {
                            this.squares[x][y].deactive();
                        }
                    }
                }
            }
        }

        for (let x = 0; x < this.squares.length; x++) {
            for (let y = 0; y < this.squares[x].length; y++) {
                this.grid[x][y].mur = this.squares[x][y].isActive;
            }
        }
        this.pathFind(false);

        if (this.debug) {
            this.drawLines();
        }
    }
    drawLines() {
        push();
        noFill();
        stroke(0, 0, 155);
        strokeWeight(this.w / 3);
        beginShape();
        for (let i = 0; i < this.path.length; i++) {
            vertex(
                this.path[i].i * this.w + this.w / 2,
                this.path[i].j * this.h + this.h / 2
            );
        }
        endShape();
        pop();
    }
}

class Mure {
    // Location
    x: number;
    y: number;
    f: number;
    g: number;
    h: number;
    naboer: Mure[];
    previous: Mure | undefined;
    mur: boolean;
    constructor(
        public i: number,
        public j: number,
        public w: number,
        public he: number,
        public cols: number,
        public rows: number
    ) {
        this.x = this.i * w + w / 2;
        this.y = this.j * he + he / 2;
        // f-, g- og h-værdier for A*
        this.f = 0;
        this.g = 0;
        this.h = 0;

        // Naboer
        this.naboer = [];

        // Hvor kom jeg fra?
        this.previous = undefined;

        // Er jeg en mur?
        this.mur = false;
        if (false) {
            this.mur = true;
        }

        // Vis mig

        // Find ud af, hvem mine naboer er
    }

    addnaboer(grid: Mure[][]) {
        let i = this.i;
        let j = this.j;
        if (i < this.cols - 1) {
            this.naboer.push(grid[i + 1][j]);
        }
        if (i > 0) {
            this.naboer.push(grid[i - 1][j]);
        }
        if (j < this.rows - 1) {
            this.naboer.push(grid[i][j + 1]);
        }
        if (j > 0) {
            this.naboer.push(grid[i][j - 1]);
        }
        if (i > 0 && j > 0) {
            this.naboer.push(grid[i - 1][j - 1]);
        }
        if (i < this.cols - 1 && j > 0) {
            this.naboer.push(grid[i + 1][j - 1]);
        }
        if (i > 0 && j < this.rows - 1) {
            this.naboer.push(grid[i - 1][j + 1]);
        }
        if (i < this.cols - 1 && j < this.rows - 1) {
            this.naboer.push(grid[i + 1][j + 1]);
        }
    }
    show(col: Color) {
        if (this.mur) {
            push();
            fill(0);
            noStroke();
            rect(this.i * this.w + this.w / 2, this.j * this.h + this.h / 2, this.w / 2, this.h / 2);
            pop();
        } else if (col) {
            push();
            fill(col);
            rect(this.i * this.w, this.j * this.h, this.w, this.h);
            pop();
        }
    }
}

// Et kvalificeret gæt på, hvor langt der er mellem to punkter