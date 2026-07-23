const DEFAULT_Z_INDEX = 20;

export class WindowManager {
    constructor({ desktop, taskList }) {
        this.desktop = desktop;
        this.taskList = taskList;
        this.windows = new Map();
        this.activeId = null;
        this.zIndex = DEFAULT_Z_INDEX;

        this.desktop.addEventListener('click', (event) => {
            const opener = event.target.closest('[data-open-app]');
            if (opener) this.open(opener.dataset.openApp);
        });
    }

    registerAll(elements) {
        elements.forEach((element) => this.register(element));

        const firstOpenWindow = [...this.windows.values()].find(
            (state) => state.open,
        );

        if (firstOpenWindow) this.focus(firstOpenWindow.id);
    }

    register(element) {
        const id = element.dataset.appId;
        if (!id || this.windows.has(id)) return;

        const state = {
            id,
            element,
            open: element.dataset.open === 'true',
            minimized: false,
            maximized: false,
            taskButton: this.createTaskButton(element),
        };

        this.windows.set(id, state);
        this.bindWindow(state);
        this.sync(state);
    }

    createTaskButton(element) {
        const button = document.createElement('button');
        button.className = 'task-button';
        button.type = 'button';
        button.dataset.taskApp = element.dataset.appId;
        button.textContent =
            element.dataset.taskLabel || element.dataset.appId || '窗口';
        button.setAttribute('aria-pressed', 'false');

        button.addEventListener('click', () => {
            const state = this.windows.get(button.dataset.taskApp);
            if (!state) return;

            if (!state.open || state.minimized) {
                this.restore(state.id);
                return;
            }

            if (this.activeId === state.id) {
                this.minimize(state.id);
                return;
            }

            this.focus(state.id);
        });

        this.taskList.append(button);
        return button;
    }

    bindWindow(state) {
        const { element } = state;
        const dragHandle = element.querySelector('[data-drag-handle]');

        element.addEventListener('pointerdown', () => this.focus(state.id));

        element.addEventListener('click', (event) => {
            const control = event.target.closest('[data-window-action]');
            if (!control) return;

            const action = control.dataset.windowAction;
            if (action === 'close') this.close(state.id);
            if (action === 'minimize') this.minimize(state.id);
            if (action === 'maximize') this.toggleMaximize(state.id);
        });

        if (dragHandle) {
            dragHandle.addEventListener('dblclick', (event) => {
                if (!event.target.closest('[data-window-action]')) {
                    this.toggleMaximize(state.id);
                }
            });

            dragHandle.addEventListener('pointerdown', (event) => {
                this.beginDrag(event, state, dragHandle);
            });
        }
    }

    beginDrag(event, state, handle) {
        if (
            event.button !== 0 ||
            state.maximized ||
            this.isCompactLayout() ||
            event.target.closest('[data-window-action]')
        ) {
            return;
        }

        const windowRect = state.element.getBoundingClientRect();
        const desktopRect = this.desktop.getBoundingClientRect();
        const startX = event.clientX;
        const startY = event.clientY;
        const initialLeft = windowRect.left - desktopRect.left;
        const initialTop = windowRect.top - desktopRect.top;

        state.element.classList.add('is-dragging');
        this.focus(state.id);

        const move = (moveEvent) => {
            const maxLeft = Math.max(
                0,
                desktopRect.width - state.element.offsetWidth,
            );
            const maxTop = Math.max(
                0,
                desktopRect.height - handle.offsetHeight,
            );
            const nextLeft = Math.min(
                maxLeft,
                Math.max(0, initialLeft + moveEvent.clientX - startX),
            );
            const nextTop = Math.min(
                maxTop,
                Math.max(0, initialTop + moveEvent.clientY - startY),
            );

            state.element.style.left = `${Math.round(nextLeft)}px`;
            state.element.style.top = `${Math.round(nextTop)}px`;
        };

        const finish = () => {
            state.element.classList.remove('is-dragging');
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', finish);
            window.removeEventListener('pointercancel', finish);
        };

        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', finish);
        window.addEventListener('pointercancel', finish);
    }

    open(id) {
        const state = this.windows.get(id);
        if (!state) return;

        state.open = true;
        state.minimized = false;
        this.sync(state);
        this.focus(id);
        this.emitStateChange(state, 'open');
    }

    close(id) {
        const state = this.windows.get(id);
        if (!state) return;

        state.open = false;
        state.minimized = false;
        this.sync(state);
        this.focusTopWindow(id);
        this.emitStateChange(state, 'close');
    }

    minimize(id) {
        const state = this.windows.get(id);
        if (!state || !state.open) return;

        state.minimized = true;
        this.sync(state);
        this.focusTopWindow(id);
        this.emitStateChange(state, 'minimize');
    }

    restore(id) {
        const state = this.windows.get(id);
        if (!state) return;

        state.open = true;
        state.minimized = false;
        this.sync(state);
        this.focus(id);
        this.emitStateChange(state, 'restore');
    }

    toggleMaximize(id) {
        const state = this.windows.get(id);
        if (!state) return;

        state.maximized = !state.maximized;
        state.open = true;
        state.minimized = false;
        state.element.classList.toggle('is-maximized', state.maximized);
        this.sync(state);
        this.focus(id);
        this.emitStateChange(
            state,
            state.maximized ? 'maximize' : 'unmaximize',
        );
    }

    focus(id) {
        const state = this.windows.get(id);
        if (!state || !state.open || state.minimized) return;

        this.activeId = id;
        state.element.style.zIndex = String(++this.zIndex);

        for (const current of this.windows.values()) {
            const isActive = current.id === id;
            current.element.classList.toggle('is-active', isActive);
            current.taskButton.classList.toggle('is-active', isActive);
            current.taskButton.setAttribute(
                'aria-pressed',
                isActive ? 'true' : 'false',
            );
        }

        state.element.focus({ preventScroll: true });

        if (this.isCompactLayout()) {
            state.taskButton.scrollIntoView({
                block: 'nearest',
                inline: 'nearest',
            });
        }

        this.emitStateChange(state, 'focus');
    }

    focusTopWindow(excludedId) {
        const candidates = [...this.windows.values()]
            .filter(
                (state) =>
                    state.id !== excludedId && state.open && !state.minimized,
            )
            .sort(
                (a, b) =>
                    Number(b.element.style.zIndex || 0) -
                    Number(a.element.style.zIndex || 0),
            );

        if (candidates[0]) {
            this.focus(candidates[0].id);
            return;
        }

        this.activeId = null;
        for (const current of this.windows.values()) {
            current.element.classList.remove('is-active');
            current.taskButton.classList.remove('is-active');
            current.taskButton.setAttribute('aria-pressed', 'false');
        }
    }

    sync(state) {
        const isHidden = !state.open || state.minimized;
        state.element.hidden = isHidden;
        state.element.setAttribute('aria-hidden', isHidden ? 'true' : 'false');
        state.taskButton.hidden = !state.open;
        state.taskButton.classList.toggle(
            'is-active',
            this.activeId === state.id && !isHidden,
        );
    }

    emitStateChange(state, action) {
        this.desktop.dispatchEvent(
            new CustomEvent('windowstatechange', {
                detail: {
                    action,
                    id: state.id,
                    open: state.open,
                    minimized: state.minimized,
                    maximized: state.maximized,
                },
            }),
        );
    }

    isCompactLayout() {
        return window.matchMedia('(max-width: 600px)').matches;
    }
}
