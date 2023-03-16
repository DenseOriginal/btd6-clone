type Point = { x: number; y: number }

interface RawMarker {
	id: number;
	hammindDistance: number;
	corners: Point[];
}

interface Marker extends RawMarker {
	center: Point;
	angle: number;
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
}

type Config<T = unknown> = {
	defaultValue: Settings[K];
	onChange?: (value: Settings[K]) => void
}

type SettingsConfig = {
	[K in keyof Settings]: Config<Settings[K]>;
}
