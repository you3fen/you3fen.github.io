const STORAGE_KEY = 'sanfen-inner-preferences-v1';

const THEMES = Object.freeze({
    ocean: { desktop: '#087f78' },
    plum: { desktop: '#76526f' },
    slate: { desktop: '#4f6d78' },
});

const DEFAULTS = Object.freeze({
    theme: 'ocean',
    customColor: THEMES.ocean.desktop,
    fontSize: 14,
    soundEnabled: true,
});

function isHexColor(value) {
    return /^#[0-9a-f]{6}$/i.test(value);
}

function shiftHex(color, amount) {
    const numeric = Number.parseInt(color.slice(1), 16);
    const channels = [
        (numeric >> 16) & 255,
        (numeric >> 8) & 255,
        numeric & 255,
    ];
    const shifted = channels
        .map((channel) => Math.max(0, Math.min(255, channel + amount)))
        .map((channel) => channel.toString(16).padStart(2, '0'))
        .join('');

    return `#${shifted}`;
}

export class PreferencesManager {
    constructor(root) {
        this.root = root;
        this.themeButtons = document.querySelectorAll('[data-theme-choice]');
        this.colorInput = document.querySelector('#desktop-color');
        this.fontInput = document.querySelector('#font-size');
        this.fontOutput = document.querySelector('#font-size-output');
        this.soundInput = document.querySelector('#sound-enabled');
        this.soundButtons = document.querySelectorAll('[data-sound-toggle]');
        this.resetButton = document.querySelector('[data-preferences-reset]');
        this.preferences = { ...DEFAULTS };
    }

    start() {
        this.preferences = this.load();
        this.bind();
        this.apply('load');
    }

    bind() {
        this.themeButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const theme = button.dataset.themeChoice;
                if (!THEMES[theme]) return;

                this.preferences.theme = theme;
                this.preferences.customColor = THEMES[theme].desktop;
                this.apply('theme');
                this.save();
            });
        });

        this.colorInput.addEventListener('input', () => {
            if (!isHexColor(this.colorInput.value)) return;

            this.preferences.theme = 'custom';
            this.preferences.customColor = this.colorInput.value;
            this.apply('theme');
            this.save();
        });

        this.fontInput.addEventListener('input', () => {
            this.preferences.fontSize = this.validateFontSize(
                this.fontInput.value,
            );
            this.apply('font');
            this.save();
        });

        this.soundInput.addEventListener('change', () => {
            this.setSoundEnabled(this.soundInput.checked);
        });

        this.soundButtons.forEach((button) => {
            button.addEventListener('click', () => {
                this.setSoundEnabled(!this.preferences.soundEnabled);
            });
        });

        this.resetButton.addEventListener('click', () => this.reset());
    }

    apply(source = 'update') {
        const { theme, customColor, fontSize, soundEnabled } =
            this.preferences;
        const isPreset = Boolean(THEMES[theme]);
        const activeColor = isPreset ? THEMES[theme].desktop : customColor;

        this.root.dataset.theme = isPreset ? theme : 'custom';
        this.root.style.setProperty('--font-size', `${fontSize}px`);

        if (isPreset) {
            this.root.style.removeProperty('--desktop');
            this.root.style.removeProperty('--title-active');
            this.root.style.removeProperty('--title-active-end');
        } else {
            this.root.style.setProperty('--desktop', activeColor);
            this.root.style.setProperty(
                '--title-active',
                shiftHex(activeColor, -54),
            );
            this.root.style.setProperty(
                '--title-active-end',
                shiftHex(activeColor, 28),
            );
        }

        this.themeButtons.forEach((button) => {
            button.setAttribute(
                'aria-pressed',
                button.dataset.themeChoice === theme ? 'true' : 'false',
            );
        });

        this.colorInput.value = activeColor;
        this.fontInput.value = String(fontSize);
        this.fontOutput.value = `${fontSize} px`;
        this.soundInput.checked = soundEnabled;
        this.soundButtons.forEach((button) => {
            button.setAttribute(
                'aria-pressed',
                soundEnabled ? 'true' : 'false',
            );
            button.setAttribute(
                'aria-label',
                soundEnabled ? 'Mute system sounds' : 'Unmute system sounds',
            );
        });

        const themeMeta = document.querySelector('meta[name="theme-color"]');
        if (themeMeta) themeMeta.content = activeColor;

        document.dispatchEvent(
            new CustomEvent('preferenceschange', {
                detail: {
                    source,
                    soundEnabled,
                    theme,
                    fontSize,
                },
            }),
        );
    }

    load() {
        try {
            const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
            const theme =
                stored?.theme === 'custom' || THEMES[stored?.theme]
                    ? stored.theme
                    : DEFAULTS.theme;
            const customColor = isHexColor(stored?.customColor)
                ? stored.customColor
                : DEFAULTS.customColor;

            return {
                theme,
                customColor,
                fontSize: this.validateFontSize(stored?.fontSize),
                soundEnabled:
                    typeof stored?.soundEnabled === 'boolean'
                        ? stored.soundEnabled
                        : DEFAULTS.soundEnabled,
            };
        } catch {
            return { ...DEFAULTS };
        }
    }

    save() {
        try {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(this.preferences),
            );
        } catch {
            // The interface still works when storage is unavailable.
        }
    }

    reset() {
        this.preferences = { ...DEFAULTS };
        this.apply('reset');

        try {
            window.localStorage.removeItem(STORAGE_KEY);
        } catch {
            // Nothing else is required when storage is unavailable.
        }
    }

    validateFontSize(value) {
        const parsed = Number.parseInt(value, 10);
        if (!Number.isFinite(parsed)) return DEFAULTS.fontSize;
        return Math.max(12, Math.min(18, parsed));
    }

    setSoundEnabled(enabled) {
        this.preferences.soundEnabled = Boolean(enabled);
        this.apply('sound');
        this.save();
    }

    isSoundEnabled() {
        return this.preferences.soundEnabled;
    }
}

export { DEFAULTS as DEFAULT_PREFERENCES, STORAGE_KEY as PREFERENCES_KEY };
