import { settings } from './settings';

let score: number = 0;

export function getScore(): number {
	return score;
}

export function setScore(x: number): void {
	score = x;
}

export function killScore(): void {
	score = getScore() + 1;
}

export function showScore(): void {
	push();
	textAlign(RIGHT);
	text('Score: '.concat(getScore().toString()), width - settings.gridSize * 3, height / 2);
	pop();
}
