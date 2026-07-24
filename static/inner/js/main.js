import { installEventBridge } from './event-bridge.js';
import { PicturesApp } from './pictures.js';
import { PreferencesManager } from './preferences.js';
import { SoundEngine } from './sound-engine.js';
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
const sound = new SoundEngine({
    desktop: document.querySelector('#desktop'),
    preferences,
});

const pictures = new PicturesApp(document.querySelector('#window-pictures'));

sound.start();
shell.start();
pictures.start();

window.innerOS = Object.freeze({
    boot,
    pictures,
    preferences,
    shell,
    sound,
    windows,
});
