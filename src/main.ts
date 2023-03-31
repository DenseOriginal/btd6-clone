/// <reference path="../node_modules/@types/p5/global.d.ts"/>

import {
	getMarkers, isReady, setupDetector, setupVideoStream, syncMarkers,
} from './AR-helper';
import { calibrationBox, initAutoCalibrate } from './calibration';
import {
	drawCalibrationBox, drawDebugMarker, drawDebugText, drawVideoFeed,
} from './debug-draw';
import {
	bulletsCollide, drawEnemySpawn, initEnemySpawner, initQuadtree, quadtree, updateEnemies, validateAllEnemyPaths,
} from './enemyClass';
import { drawEmptyGrid } from './grid-builder';
import { initSettingsMenu, settings } from './settings';
import { drawWalls, syncWalls } from './walls';
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
			updateTurretObj();
			const hasPathfindingGridChanged = syncPathfinderWithWall();
			if (hasPathfindingGridChanged) validateAllEnemyPaths();
		});
	}

	// If debug, draw transparent video feed on top of canvas
	if (settings.debug) drawCalibrationBox();
	if (settings.showVideoFeed) drawVideoFeed(capture);
	drawWalls();
	drawDebugText();
	if (settings.debug) {
		// debugDrawFromStartToEnd();
		getMarkers().forEach((marker) => drawDebugMarker(marker));
	}
	if (settings.drawGridLines) drawEmptyGrid();
	if (settings.spawnEnemies) {
		drawEnemySpawn();
		updateEnemies();
	}
	updateAllShots();
	bulletsCollide();
	if (settings.debug) { quadtree.draw(); }
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
