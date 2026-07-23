const CUES = Object.freeze({
    boot: [
        { frequency: 392, duration: 0.045, type: 'square' },
        { frequency: 523, duration: 0.065, type: 'square' },
        { frequency: 659, duration: 0.075, type: 'square' },
    ],
    close: [
        { frequency: 520, duration: 0.045, type: 'triangle' },
        { frequency: 330, duration: 0.07, type: 'triangle' },
    ],
    menu: [{ frequency: 310, duration: 0.045, type: 'square' }],
    minimize: [{ frequency: 370, duration: 0.055, type: 'triangle' }],
    open: [
        { frequency: 440, duration: 0.045, type: 'square' },
        { frequency: 660, duration: 0.065, type: 'square' },
    ],
    resize: [{ frequency: 560, duration: 0.055, type: 'square' }],
    theme: [
        { frequency: 480, duration: 0.04, type: 'triangle' },
        { frequency: 720, duration: 0.06, type: 'triangle' },
    ],
});

export class SoundEngine {
    constructor({ desktop, preferences }) {
        this.desktop = desktop;
        this.preferences = preferences;
        this.context = null;
        this.lastCue = null;
        this.renderedTones = 0;
        this.supported = Boolean(
            window.AudioContext || window.webkitAudioContext,
        );
    }

    start() {
        this.desktop.addEventListener('windowstatechange', (event) => {
            const cueByAction = {
                close: 'close',
                maximize: 'resize',
                minimize: 'minimize',
                open: 'open',
                restore: 'open',
                unmaximize: 'resize',
            };
            const cue = cueByAction[event.detail.action];
            if (cue) void this.play(cue);
        });

        document.addEventListener('preferenceschange', (event) => {
            if (event.detail.source === 'theme') void this.play('theme');
            if (
                event.detail.source === 'sound' &&
                event.detail.soundEnabled
            ) {
                void this.play('open');
            }
            if (event.detail.source === 'reset') void this.play('theme');
        });

        document
            .querySelector('#start-button')
            .addEventListener('click', () => void this.play('menu'));
        document
            .querySelector('#boot-screen')
            .addEventListener('pointerdown', () => void this.play('boot'));

        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.context?.state === 'running') {
                void this.context.suspend().catch(() => {});
            }
        });
    }

    async play(name) {
        if (
            !this.supported ||
            !this.preferences.isSoundEnabled() ||
            !CUES[name]
        ) {
            return false;
        }

        try {
            const AudioContextClass =
                window.AudioContext || window.webkitAudioContext;
            if (!this.context) this.context = new AudioContextClass();
            if (this.context.state === 'suspended') {
                await this.context.resume();
            }

            this.render(CUES[name]);
            this.lastCue = name;
            return true;
        } catch {
            return false;
        }
    }

    render(notes) {
        const baseTime = this.context.currentTime + 0.006;
        let offset = 0;

        notes.forEach((note) => {
            const oscillator = this.context.createOscillator();
            const gain = this.context.createGain();
            const start = baseTime + offset;
            const end = start + note.duration;

            oscillator.type = note.type;
            oscillator.frequency.setValueAtTime(note.frequency, start);
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.linearRampToValueAtTime(0.028, start + 0.006);
            gain.gain.exponentialRampToValueAtTime(0.0001, end);

            oscillator.connect(gain);
            gain.connect(this.context.destination);
            oscillator.start(start);
            oscillator.stop(end + 0.008);

            offset += note.duration + 0.012;
            this.renderedTones += 1;
        });
    }

    getState() {
        return {
            contextState: this.context?.state || 'not-created',
            lastCue: this.lastCue,
            renderedTones: this.renderedTones,
            supported: this.supported,
        };
    }
}
