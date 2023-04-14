import { getRawMarkers } from './AR-helper';
import { calibrate } from './calibration';
import { setSetting, settings } from './settings';

const settingMarkers = new Map<number, SettingsMarkerConfig<unknown>>();

// Helper function for adding configs, this is only for typesafety, otherwise the types don't work :shrug:
const markerBuilder = <K extends keyof Settings>(config: SettingsMarkerConfig<K>) => settingMarkers.set(config.id, config as SettingsMarkerConfig<unknown>);

markerBuilder({ id: 100, key: 'spawnEnemies', value: (cur) => !cur, timeout: 1000 });
markerBuilder({
	id: 101,
	key: 'showVirtualMarkers',
	value: (cur) => !cur,
	timeout: 1000,
	onDetect: (_, newVal) => {
		setSetting('showVirtualMarkers', newVal);
		setSetting('autoCalibrateInterval', newVal ? 2000 : 100000000000);
		return false;
	},
});
markerBuilder({
	id: 102,
	key: 'showVirtualMarkers',
	value: (cur) => cur,
	timeout: 1000,
	onDetect: (curVal) => {
		setSetting('showVirtualMarkers', true);
		calibrate();
		setTimeout(() => setSetting('showVirtualMarkers', curVal), 1000);
		return false;
	},
});
markerBuilder({ id: 103, key: 'debug', value: (cur) => !cur, timeout: 1000 });

// Map to store last seen timestamp for each marker
const lastSeen = new Map<number, number>();

export function checkSettingMarkers(): void {
	const markers = getRawMarkers();

	for (const marker of markers) {
		const config = settingMarkers.get(marker.id);
		const now = Date.now();

		if (config) {
			const lastSeenTime = lastSeen.get(marker.id) || 0;
			if (now - lastSeenTime > config.timeout) {
				const currentValue = settings[config.key as keyof Settings];
				const newValue = typeof config.value === 'function' ? config.value(currentValue) : config.value;
				const shouldUpdate = config.onDetect ? config.onDetect(currentValue, newValue) : true;

				if (shouldUpdate) {
					console.log(`Settings marker detected: ${config.key} = ${newValue}`);
					setSetting(config.key as keyof Settings, newValue);
				} else {
					console.log(`Settings marker detected: ID ${config.id}`);
				}
			}
		}

		// Update the last seen timestamp for the marker
		lastSeen.set(marker.id, now);
	}
}
