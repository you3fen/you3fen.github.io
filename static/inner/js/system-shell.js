const BOOT_DURATION = 1550;

export class BootSequence {
    constructor(screen) {
        this.screen = screen;
        this.timer = null;
        this.hideTimer = null;
        this.onSkip = () => this.complete();
    }

    start() {
        if (!this.screen) return;

        window.clearTimeout(this.timer);
        window.clearTimeout(this.hideTimer);
        this.screen.hidden = false;
        this.screen.classList.remove('is-leaving');
        this.screen.setAttribute('aria-hidden', 'false');

        window.addEventListener('keydown', this.onSkip, { once: true });
        this.screen.addEventListener('pointerdown', this.onSkip, { once: true });

        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        this.timer = window.setTimeout(
            () => this.complete(),
            prefersReducedMotion ? 80 : BOOT_DURATION,
        );
    }

    complete() {
        if (!this.screen || this.screen.hidden) return;

        window.clearTimeout(this.timer);
        window.removeEventListener('keydown', this.onSkip);
        this.screen.removeEventListener('pointerdown', this.onSkip);
        this.screen.classList.add('is-leaving');
        this.screen.setAttribute('aria-hidden', 'true');

        this.hideTimer = window.setTimeout(() => {
            this.screen.hidden = true;
            this.screen.dispatchEvent(new CustomEvent('bootcomplete'));
        }, 190);
    }
}

export class DesktopShell {
    constructor({ root, windows, boot }) {
        this.root = root;
        this.windows = windows;
        this.boot = boot;
        this.startButton = root.querySelector('#start-button');
        this.startMenu = root.querySelector('#start-menu');
        this.clock = root.querySelector('#taskbar-clock');
        this.clockTimer = null;
    }

    start() {
        this.bindDesktopIcons();
        this.bindStartMenu();
        this.updateClock();
        this.scheduleClock();
        document.addEventListener('visibilitychange', () => {
            window.clearTimeout(this.clockTimer);
            if (!document.hidden) {
                this.updateClock();
                this.scheduleClock();
            }
        });
        this.boot.start();
    }

    bindDesktopIcons() {
        const icons = this.root.querySelectorAll('[data-desktop-app]');

        icons.forEach((icon) => {
            icon.addEventListener('click', (event) => {
                icons.forEach((item) =>
                    item.classList.toggle('is-selected', item === icon),
                );

                if (event.detail === 0) {
                    this.windows.open(icon.dataset.desktopApp);
                }
            });

            icon.addEventListener('dblclick', () => {
                this.windows.open(icon.dataset.desktopApp);
            });

            icon.addEventListener('pointerup', (event) => {
                if (event.pointerType !== 'mouse') {
                    this.windows.open(icon.dataset.desktopApp);
                }
            });
        });

        this.root.querySelector('#desktop').addEventListener('pointerdown', (event) => {
            if (event.target.closest('[data-desktop-app]')) return;
            icons.forEach((icon) => icon.classList.remove('is-selected'));
        });
    }

    bindStartMenu() {
        this.startButton.addEventListener('click', (event) => {
            event.stopPropagation();
            this.setStartMenu(this.startMenu.hidden);
        });

        this.startMenu.addEventListener('click', (event) => {
            const item = event.target.closest('button');
            if (!item) return;

            if (item.dataset.openApp) {
                this.windows.open(item.dataset.openApp);
            }

            if (item.dataset.systemAction === 'restart') {
                this.boot.start();
            }

            this.setStartMenu(false);
        });

        this.root.addEventListener('click', (event) => {
            if (
                !this.startMenu.hidden &&
                !event.target.closest('#start-menu') &&
                !event.target.closest('#start-button')
            ) {
                this.setStartMenu(false);
            }
        });

        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !this.startMenu.hidden) {
                this.setStartMenu(false);
                this.startButton.focus();
            }
        });
    }

    setStartMenu(open) {
        this.startMenu.hidden = !open;
        this.startButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        this.clock.textContent = `${hours}:${minutes}`;
        this.clock.dateTime = now.toISOString();
        this.clock.title = new Intl.DateTimeFormat('zh-CN', {
            dateStyle: 'full',
            timeStyle: 'short',
        }).format(now);
    }

    scheduleClock() {
        const delayUntilNextMinute =
            60000 - (Date.now() % 60000) + 40;
        this.clockTimer = window.setTimeout(() => {
            this.updateClock();
            this.scheduleClock();
        }, delayUntilNextMinute);
    }
}
