import { settings } from './settings';

let score: number = 0;
let earthCounter: number = 0;
let isShakeEarth: boolean = false;

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
	earthCounter += deltaTime / 1000;
	push();
	if (isShakeEarth) {
		translate(width - settings.gridSize + random(-10, 10), height / 2 + random(-10, 10));
		isShakeEarth = false;
	} else {
		translate(width - settings.gridSize, height / 2);
	}
	rotate(earthCounter);
	textSize(settings.gridSize ** 2);
	textAlign(CENTER, CENTER);
	text('🌍', 0, 0 + textSize() / 12);
	pop();
	push();
	textAlign(RIGHT);
	textSize(30);
	stroke(0);
	strokeWeight(5);
	text('Score: '.concat(getScore().toString()), width - settings.gridSize * 2, height / 2 + textSize() / 2);
	pop();
}

export function shakeEarth() {
	isShakeEarth = true;
}
