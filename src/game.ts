import { Image } from 'p5';
import { settings } from './settings';
import { activeTurrets } from './turrets';
import { getWalls } from './walls';
import { resetEnemies, updateEnemySpawnInterval } from './enemyClass';

let score: number = 0;
// eslint-disable-next-line no-return-assign
(window as any).setScore = (x: number) => score = x;

export function getScore(): number {
	return score;
}

export function setScore(x: number): void {
	score = x;
}

export function incrementScore(): number {
	const incremention = settings.scoreIncrementWeight / ((activeTurrets.size + getWalls().length) ? (activeTurrets.size + getWalls().length) : 1);
	score = getScore() + incremention;
	return incremention;
}
export function decrementScore(): number {
	const decremention = settings.scoreDecrementWeight * ((activeTurrets.size + getWalls().length) ? (activeTurrets.size + getWalls().length) : 1);
	score = getScore() - decremention;
	return decremention;
}

export function showScore(): void {
	push();
	textAlign(CENTER, CENTER);
	textSize(30);
	stroke(0);
	strokeWeight(5);
	text('Score: '.concat(getScore().toFixed(0).toString()), width / 2, textSize() / 2 + settings.gridSize * 3);
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

let transparentGameOver: number = 0;
let highScore: number = 0;
let lost: boolean = false;
export function GameOvering() {
	const scoreRN = getScore();

	if (settings.invinsible) {
		score = Math.max(scoreRN, 0);
		noStroke();
		fill(255, 0, 0);
		circle(width - 20, 20, 10);
		return;
	}

	if (scoreRN > highScore && !lost) { highScore = scoreRN; }
	if (scoreRN < 0 || lost) {
		lost = true;
		transparentGameOver += 2;
		push();
		fill(255, 0, 0, transparentGameOver);
		rect(0, 0, width, height);
		pop();
		push();
		textAlign(CENTER, CENTER);
		textSize(100);
		text('GAME OVER', width / 2, height / 2);
		textSize(50);
		text('High score: '.concat(highScore.toFixed(0).toString()), width / 2, height * 2 / 3);
		pop();
		setTimeout(() => {
			settings.spawnEnemies = false;
			settings.enemyBaseSpeed = 0.3;
			updateEnemySpawnInterval(1000);
			setScore(0);
			resetEnemies();
			highScore = 0;
			lost = false;
			transparentGameOver = 0;
		}, 6500);
	}
}
