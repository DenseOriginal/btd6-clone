import { Image } from 'p5';
import { settings } from './settings';
import { getMarkers } from './AR-helper';
import { activeTurrets } from './turrets';
import { getWalls } from './walls';

let score: number = 0;

export function getScore(): number {
	return score;
}

export function setScore(x: number): void {
	score = x;
}

export function incrementScore(): number {
	const incremention = 100 / ((activeTurrets.size + getWalls().length) ? (activeTurrets.size + getWalls().length) : 1);
	score = getScore() + incremention;
	return incremention;
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
	text('Score: '.concat(getScore().toFixed(0).toString()), width - settings.gridSize * 2, height / 2 + textSize() / 2);
	pop();
}

let shakeTheEarth: boolean;

export function shakeEarth() {
	shakeTheEarth = true;
}

export function showEarth(earth: Image) {
	push();
	translate(width + (shakeTheEarth ? random(-earth.width / 10, earth.width / 10) : 0), height / 2 + (shakeTheEarth ? random(-earth.width / 10, earth.width / 10) : 0));
	rotate(frameCount / 100);
	image(earth, -earth.width / 2, -earth.width / 2);
	pop();
	shakeTheEarth = false;
}
