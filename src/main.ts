/// <reference path="../node_modules/@types/p5/global.d.ts"/>

import {
	getMarkers, isReady, setupDetector, setupVideoStream, syncMarkers,
} from './AR-helper';
import { calibrationBox, initAutoCalibrate, isCalibrationMarker } from './calibration';
import {
	drawCalibrationBox, drawDebugMarker, drawDebugText, drawVideoFeed,
} from './debug-draw';
import {
	bulletsCollide, initEnemySpawner, initQuadtree, quadtree, updateEnemies, validateAllEnemyPaths,
} from './enemyClass';
import { drawEmptyGrid } from './grid-builder';
import { initSettingsMenu, settings } from './settings';
import { getWalls, syncWalls } from './walls';
import { syncPathfinderWithWall } from './pathfindering';
import { syncTurretObj, syncTurrets, updateTurretObj } from './turrets';
import { updateAllShots } from './gatlingTower';

let capture: ReturnType<typeof createCapture>;

export const canvasWidth = window.innerWidth;
export const canvasHeight = window.innerHeight;

(window as any).setup = () => {
	initSettingsMenu();
	createCanvas(canvasWidth, canvasHeight);
	capture = createCapture(VIDEO);
	capture.hide();

	setupVideoStream();
	setupDetector();
	frameRate(settings.targetFrameRate);
	initAutoCalibrate();
	initEnemySpawner();
	initQuadtree();
};

(window as any).draw = () => {
	background(255);
	if (!isReady()) return;

	drawPlayarea();
	if (frameCount % settings.sampleMarkersDelay == 0) {
		new Promise(() => {
			syncMarkers();
			syncWalls();
			syncTurrets();
			syncTurretObj();
			const hasPathfindingGridChanged = syncPathfinderWithWall();
			if (hasPathfindingGridChanged) validateAllEnemyPaths();
		});
	}

	// If debug, draw transparent video feed on top of canvas
	if (settings.debug) drawCalibrationBox();
	if (settings.showVideoFeed) drawVideoFeed(capture);

	const walls = getWalls();

	for (const mark of walls) {
		// If this is a calibration id, drawing it
		if (isCalibrationMarker(mark.id)) {
			if (settings.debug) drawDebugMarker(mark);
			continue;
		}

		const [p1, p2, p3, p4] = mark.corners;
		push();
		noStroke();
		fill(255, 100, 100);

		beginShape();
		vertex(p1.x, p1.y);
		vertex(p2.x, p2.y);
		vertex(p3.x, p3.y);
		vertex(p4.x, p4.y);
		endShape();
		pop();
	}

	drawDebugText();
	if (settings.debug) {
		// debugDrawFromStartToEnd();
		getMarkers().forEach((marker) => drawDebugMarker(marker));
	}
	if (settings.drawGridLines) drawEmptyGrid();
	if (settings.spawnEnemies) {
		push();
		fill(color(255, 0, 0, 200));
		noStroke();

		const yOffset = (height - (height * settings.spawnBoxSize)) / 2;

		rect(
			0,
			yOffset,
			settings.gridSize * 3,
			height * settings.spawnBoxSize,
		);
		pop();
	}
	updateEnemies();
	updateTurretObj();
	updateAllShots();
	if (settings.spawnEnemies) {	bulletsCollide(); }

	quadtree.draw();
	quadtree.clear();
};

function drawPlayarea() {
	push();

	noStroke();
	fill(0);

	rect(
		0,
		0,
		calibrationBox.width * calibrationBox.scaleX,
		calibrationBox.height * calibrationBox.scaleY,
	);

	pop();
}
