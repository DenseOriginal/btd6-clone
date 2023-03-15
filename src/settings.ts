const initialConfig: SettingsConfig = {
    debug: { defaultValue: false },
    targetFrameRate: { defaultValue: 10, onChange: (fps) => frameRate(fps) },
    cacheHitThreshold: { defaultValue: 3 }
}

const menuContainer = document.getElementById('menu')!;
const menuInner = document.getElementById('menuInner')!;
const closeButton = document.getElementById('closeButton')!;
const openConfigButton = document.getElementById('openConfigButton')!;
const overlay = document.getElementById('overlay')!;

export const settings: Settings = Object.entries(initialConfig)
    .reduce((acc, cur) => ({ ...acc, [cur[0]]: cur[1].defaultValue }), {} as Settings);

export function initSettingsMenu() {
    Object
        .entries(initialConfig)
        .forEach((entry) => {
            const key = entry[0] as keyof Settings;
            const config = entry[1];

            switch (typeof config.defaultValue) {
                case 'boolean': return createCheckbox(key, config);
                case 'string': return createInput(key, config, 'string');
                case 'number': return createInput(key, config, 'number');
            }
        });

    closeButton.addEventListener('click', closeMenu)
    openConfigButton.addEventListener('click', openMenu)
    overlay.addEventListener('click', closeMenu)
}

function createCheckbox(id: keyof Settings, config: Config<boolean>) {
    const template = `
    <div class="row">
        <label for="${id}">${id}</label>
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

function createInput(id: keyof Settings, config: Config<string | number>, type: 'string' | 'number') {
    const template = `
    <div class="row">
        <label for="${id}">${id}</label>
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