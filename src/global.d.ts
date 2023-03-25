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
	timestamp: number; // Timestamp as the current frame
}

interface TurretPlacement extends Marker {
	diameter: number;
	timestamp: number; // Timestamp as the current frame
}

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
	targetFrameRate: number;
	cacheHitThreshold: number;
	skewThreshold: number;
	showVirtualMarkers: boolean;
	showVideoFeed: boolean;
	preserveWallsFrames: number; // How many frames a wall can be missing but the still be there
	sampleMarkersDelay: number;
	doPathFind: boolean;
	gridSize: number;
	autoCalibrateInterval: number; // Time in miliseconds
	spawnEnemies: boolean;
}

type Config<T = unknown> = {
	defaultValue: Settings[K];
	onChange?: (value: Settings[K]) => void;
	header?: string;
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
