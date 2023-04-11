class Popup {
	constructor(public message: string, public pos: Point) {}

	update() {
		this.draw();
	}

	draw() {
		push();
		noStroke();
		fill(255);
		textSize(20);
		text(this.message, this.pos.x, this.pos.y);
		pop();
	}
}
