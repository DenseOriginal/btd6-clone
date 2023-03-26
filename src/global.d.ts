type Point = { x: number; y: number; };

interface RawMarker {
	id: number;
	hammindDistance: number;
	corners: Point[];
}

interface Marker extends RawMarker {
	center: Point;
	angle: number;
}

interface Wall extends Marker {
	type: 'wall';
	timestamp: number; // Timestamp as the current frame
}

interface TurretPlacement extends Marker {
	type: 'turret';
	diameter: number;
	timestamp: number; // Timestamp as the current frame
}

type CollisionObject = Wall | TurretPlacement;

interface CalibrationBox {
	x: number;
	y: number;
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
	center: Point;
	angle: number;
	corners: Point[];
}

interface Settings {
	debug: boolean;
	drawGridLines: boolean;
	targetFrameRate: number;
	cacheHitThreshold: number;
	skewThreshold: number;
	showVirtualMarkers: boolean;
	showVideoFeed: boolean;
	preserveWallsFrames: number; // How many frames a wall can be missing but the still be there
	sampleMarkersDelay: number;
	gridSize: number;
	autoCalibrateInterval: number; // Time in miliseconds
	spawnEnemies: boolean;
	enemySpawnRate: number;
	enemyBaseSpeed: number;
}

type Config<T = unknown> = {
	defaultValue: T;
	onChange?: (value: T) => void;
	header?: string;
	label?: string;
};

type SettingsConfig = {
	[K in keyof Settings]: Config<Settings[K]>;
};

interface WallRatioConfig {
	id: number;
	codeWidth: number;
	width: number;
	height: number;
	rotated: boolean; // Redundancy if we fuck up and print/lasercut a rotated code lol
}

interface TurretRatioConfig {
	id: number;
	codeWidth: number;
	diameter: number;
	rotationOffset: number;
}
