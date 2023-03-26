import { updateAutoCalibrateInterval } from "./calibration";
import { updateEnemySpawnInterval } from "./enemyClass";

const initialConfig: SettingsConfig = {
	// General settings
    debug: { defaultValue: true, header: 'General' },
	drawGridLines: { defaultValue: false, label: 'drawGridLines (Slow!)' },
    targetFrameRate: { defaultValue: 30, onChange: (fps) => frameRate(fps) },
    cacheHitThreshold: { defaultValue: 3 },
    showVirtualMarkers: { defaultValue: true, onChange: (show) => toggleVirtualMarkers(show) },
    showVideoFeed: { defaultValue: false },
    preserveWallsFrames: { defaultValue: 20 },
    sampleMarkersDelay: { defaultValue: 3 },
	
	// Calibrations settings
    skewThreshold: { defaultValue: 10, header: 'Calibrations' },
	autoCalibrateInterval: { defaultValue: 2000, onChange: (interval) => updateAutoCalibrateInterval(interval) },

    // Pathfinding settings
	gridSize: { defaultValue: 20, header: 'Pathfinding' },

	// Enemias settings
	spawnEnemies: { defaultValue: false, header: 'Enemies' },
	enemySpawnRate: { defaultValue: 2500, onChange: (spawnRate) => updateEnemySpawnInterval(spawnRate) },
	enemyBaseSpeed: { defaultValue: 0.3 },
};

const menuContainer = document.getElementById('menu')!;
const menuInner = document.getElementById('menuInner')!;
const closeButton = document.getElementById('closeButton')!;
const openConfigButton = document.getElementById('openConfigButton')!;
const overlay = document.getElementById('overlay')!;
const virtualMarkers = document.getElementById('virtual-markers')!;

export const settings: Settings = Object.entries(initialConfig)
    .reduce((acc, cur) => ({ ...acc, [cur[0]]: cur[1].defaultValue }), {} as Settings);

export function initSettingsMenu() {
    Object
        .entries(initialConfig)
		.reverse()
        .forEach((entry) => {
            const key = entry[0] as keyof Settings;
            const config = entry[1];

			// uhhhhhh ignore this, dont use never as a type, and ignore me doing it :cheeky:
            (window as any)[`set_${key}`] = (val: never) => {
                (settings as any)[key] = val;
                config.onChange?.(val);
            };

            switch (typeof config.defaultValue) {
                case 'boolean': createCheckbox(key, config as Config<boolean>); break;
                case 'string': createInput(key, config as Config<string | number>, 'string'); break;
                case 'number': createInput(key, config as Config<string | number>, 'number'); break;
            }

			if (config.header) {
				createHeader(config.header)
			}
		});

    closeButton.addEventListener('click', closeMenu);
    openConfigButton.addEventListener('click', openMenu);
    overlay.addEventListener('click', closeMenu);
}

function createCheckbox(id: keyof Settings, config: Config<boolean>) {
    const template = `
    <div class="row">
        <label for="${id}">${config.label || id}</label>
        <input type="checkbox" id="${id}">
    </div>
    `;

    menuInner.insertAdjacentHTML('afterbegin', template);
    const checkboxElement = document.getElementById(id)! as HTMLInputElement;
    checkboxElement.checked = config.defaultValue;
    checkboxElement.addEventListener('click', (e) => {
        const target = e.target as HTMLInputElement;
        checkboxElement.checked = target.checked;
        (settings as any)[id] = target.checked;
        config.onChange?.(target.checked);
    });
}

function createHeader(header: string) {
    const template = `
    <h3>${header}</h3>
    `;
    menuInner.insertAdjacentHTML('afterbegin', template);
}

function createInput(id: keyof Settings, config: Config<string | number>, type: 'string' | 'number') {
    const template = `
    <div class="row">
        <label for="${id}">${config.label || id}</label>
        <input type="${type}" id="${id}">
    </div>
    `;

    menuInner.insertAdjacentHTML('afterbegin', template);
    const inputElement = document.getElementById(id)! as HTMLInputElement;
    inputElement.value = config.defaultValue.toString();
    inputElement.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        inputElement.value = target.value;
        const newVal = type == 'string' ?
            target.value :
            Number(target.value);

        (settings as any)[id] = newVal;
        config.onChange?.(newVal);
    });
}

function openMenu() {
    menuContainer.classList.remove('closed');
}

function closeMenu() {
    menuContainer.classList.add('closed');
}

function toggleVirtualMarkers(toggle: boolean) {
    if (!toggle) {
        virtualMarkers.classList.add('closed');
    } else {
        virtualMarkers.classList.remove('closed');
    }
}

// Register settings for the console
(window as any).settings = settings;
(window as any).setSetting = <K extends keyof Settings>(key: K, value: never) => {
    const config = initialConfig[key];
    settings[key] = value;
    config.onChange?.(value);
};
