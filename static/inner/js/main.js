import { installEventBridge } from './event-bridge.js';
import { PreferencesManager } from './preferences.js';
import { BootSequence, DesktopShell } from './system-shell.js';
import { WindowManager } from './window-manager.js';

installEventBridge();

const windows = new WindowManager({
    desktop: document.querySelector('#desktop'),
    taskList: document.querySelector('#task-list'),
});

windows.registerAll(document.querySelectorAll('[data-window]'));

const preferences = new PreferencesManager(document.documentElement);
preferences.start();

const boot = new BootSequence(document.querySelector('#boot-screen'));
const shell = new DesktopShell({
    root: document.querySelector('#os-shell'),
    windows,
    boot,
});

shell.start();

window.innerOS = Object.freeze({ boot, preferences, shell, windows });
