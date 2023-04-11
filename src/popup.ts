import { Color } from "p5";

export let popups: Popup[] = [];

export class Popup {
	isDisplaying: boolean = true;
	time: number = 0;
	constructor(public message: string, public pos: Point, public color: Color) { }

	update() {
		this.displayTime();
		this.draw();
	}

	draw() {
		push();
		const alpha = 150 + 6 * (1 - (this.time / 1000)) * 255;
		this.color.setAlpha(alpha);
		fill(this.color);
		textSize(25);
		textAlign(CENTER);
		translate(this.pos.x, this.pos.y);
		this.pos.y = this.pos.y - 1;
		text(this.message, 0, 0);
		pop();
	}

	displayTime() {
		this.time += deltaTime;
		if (this.time > 1000) {
			this.isDisplaying = false;
		}
	}
}
export function updateAllPopups() {
	popups.forEach((popup: Popup) => {
		popup.update();
	});
	for (let i = popups.length - 1; i >= 0; i--) {
		if (popups[i].isDisplaying == false) {
			popups.splice(i, 1);
		}
	}
}
