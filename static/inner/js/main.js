import { installEventBridge } from './event-bridge.js';
import { WindowManager } from './window-manager.js';

installEventBridge();

const windows = new WindowManager({
    desktop: document.querySelector('#desktop'),
    taskList: document.querySelector('#task-list'),
});

windows.registerAll(document.querySelectorAll('[data-window]'));

window.innerOS = Object.freeze({ windows });
