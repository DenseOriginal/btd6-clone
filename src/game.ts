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

export function shakeEarth() {
	const earth = select('#Earth');
	const pos = earth?.position();
	const posTemp = pos;
	earth?.position(pos?.x + random(-20, 20), pos?.y + random(-20, 20));
	setTimeout(() => {
		earth?.position(posTemp?.x, posTemp?.y);
	}, 20);
}

export function InitEarth() {
	const earth = select('#Earth');
	earth?.center('veritcal');
	earth?.center('horizontal');
	earth?.position(width - earth.width / 2, height / 2 - earth.height / 2);
}
