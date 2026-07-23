const FORWARDED_EVENTS = [
    'mousemove',
    'mousedown',
    'mouseup',
    'keydown',
    'keyup',
];

let installed = false;

export function installEventBridge() {
    if (installed) return;
    installed = true;

    for (const type of FORWARDED_EVENTS) {
        window.addEventListener(type, (event) => {
            const message = { type };

            if (type === 'mousemove') {
                message.clientX = event.clientX;
                message.clientY = event.clientY;
            }

            if (type === 'keydown' || type === 'keyup') {
                message.key = event.key;
            }

            window.parent.postMessage(message, window.location.origin);
        });
    }
}

export { FORWARDED_EVENTS };
