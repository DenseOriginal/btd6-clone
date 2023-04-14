import { Image } from 'p5';
import { settings } from './settings';

let score: number = 0;

export function getScore(): number {
	return score;
}

export function setScore(x: number): void {
	score = x;
}

export function incrementScore(): void {
	score = getScore() + 1;
}
export function decrementScore(): void {
	score = getScore() - 10;
}

export function showScore(): void {
	push();
	textAlign(RIGHT);
	textSize(30);
	stroke(0);
	strokeWeight(5);
	text('Score: '.concat(getScore().toString()), width - settings.gridSize * 2, height / 2 + textSize() / 2);
	pop();
}

let shakeTheEarth: boolean;

export function shakeEarth() {
	shakeTheEarth = true;
}

export function showEarth(earth: Image) {
	if (shakeTheEarth) {
		push();
		image(earth, width - 150 + random(-20, 20), height / 2 - 150 + random(-20, 20), 300, 300);
		pop();
		shakeTheEarth = false;
	} else {
		push();
		image(earth, width - 150, height / 2 - 150, 300, 300);
		pop();
	}
}
