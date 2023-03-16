import { calibrationBox } from "./calibration";
import { settings } from "./settings";

export function drawDebugMarker(mark: Marker) {
	strokeWeight(2);
	stroke(255, 0, 0);

	const { x, y } = mark.center
	circle(x, y, 4);

	const angle = mark.angle;
	const rotX = cos(angle) * 20;
	const rotY = sin(angle) * 20;

	line(
		x,
		y,
		x + rotX,
		y + rotY
	);

	noStroke();
	fill(0, 255, 0)
	text(mark.id, x, y);
}

export function drawDebugText() {
	const messages = [
		`Frame rate: ${frameRate().toFixed(2)}`,
		`Target frame rate: ${settings.targetFrameRate}`,
		`Calibration box angle: ${calibrationBox.angle.toFixed(4)}`,
	];

	fill(0);
	messages.forEach((message, idx) => {
		text(message, 10, 20 + idx * 10);
	})
}

export function drawVideoFeed(capture: ReturnType<typeof createCapture>) {
    push();
    tint(255, 255 / 3);
    image(capture, 0, 0, width, height)
    pop();
}

export function drawCalibrationBox() {
    push();

    noFill();
    strokeWeight(1);
    stroke(0, 0, 255);

    // Draw rect showing the calibratyion box on the source image
    beginShape();
    calibrationBox.corners.forEach((point) => vertex(point.x, point.y))
    endShape('close');

    const angle = calibrationBox.angle;
    const rotX = cos(angle) * 30;
    const rotY = sin(angle) * 30;

    line(
        calibrationBox.center.x,
        calibrationBox.center.y,
        calibrationBox.center.x + rotX,
        calibrationBox.center.y + rotY
    );

    pop();
}