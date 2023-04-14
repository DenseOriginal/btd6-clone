importScripts('./js-aruco/svd.js');
importScripts('./js-aruco/posit1.js');
importScripts('./js-aruco/cv.js');
importScripts('./js-aruco/aruco.js');

onmessage = (event) => {
	// Load the actual detecotr from the js-aruco library
	// The library doesn't have any types
	// And typescript doesn't know it exists, so just throw all typesafety out the window
	// Using the any type
	detector = new AR.Detector({
		dictionaryName: 'ARUCO_4X4_1000',
		maxHammingDistance: 2,
	});

	const imageData = event.data;

	// Step 21: Sprinkle in some magic from js-aruco library and boom
	// Code detection
	const result = detector.detect(imageData);
	postMessage(result);
};
