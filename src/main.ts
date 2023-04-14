/// <reference path="../node_modules/@types/p5/global.d.ts"/>

import { Image } from 'p5';
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
import { showEarth, showScore } from './game';
import { updateAllPopups } from './popup';

let capture: ReturnType<typeof createCapture>;
export let earth: Image;

export const canvasWidth = window.innerWidth;
export const canvasHeight = window.innerHeight;
(window as any).preload = () => {
	earth = loadImage('../public/images/earth.png');
};
(window as any).setup = () => {
	initSettingsMenu();
	createCanvas(canvasWidth, canvasHeight);
	earth.resize(height / 2, height / 2);
	capture = createCapture(VIDEO);
	capture.hide();

	setupVideoStream();
	setupDetector();
	frameRate(settings.targetFrameRate);
	initAutoCalibrate();
	initEnemySpawner();
	initQuadtree();
	initSyncAll();
};

(window as any).draw = () => {
	background(255);
	if (!isReady()) return;

	drawPlayarea();

	// If debug, draw transparent video feed on top of canvas
	if (settings.debug) drawCalibrationBox();
	if (settings.showVideoFeed) drawVideoFeed(capture);
	drawWalls();
	drawDebugText();
	if (settings.debug) {
		// debugDrawFromStartToEnd();
		getMarkers().forEach((marker) => drawDebugMarker(marker));
	}
	showEarth(earth);
	if (settings.drawGridLines) drawEmptyGrid();
	if (settings.spawnEnemies) {
		drawEnemySpawn();
		updateEnemies();
	}
	updateTurretObj();
	updateAllShots();
	bulletsCollide();
	if (settings.debug) { quadtree.draw(); }
	showScore();
	updateAllPopups();
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

let autoSyncAllIntervalHook: ReturnType<typeof setInterval>;
function initSyncAll() {
	try {
		autoSyncAllIntervalHook = setInterval(syncAll, settings.sampleMarkersDelay);
	} catch (error) {
		console.log(error);
	}
}
export function updateSyncAllInterval(interval: number) {
	try {
		clearInterval(autoSyncAllIntervalHook);
		autoSyncAllIntervalHook = setInterval(syncAll, interval);
		syncAll();
	} catch (error) {
		console.log(error);
	}
}
function syncAll() {
	syncMarkers();
	syncWalls();
	syncTurrets();
	syncTurretObj();
	const hasPathfindingGridChanged = syncPathfinderWithWall();
	if (hasPathfindingGridChanged) validateAllEnemyPaths();
}
