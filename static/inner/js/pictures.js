/**
 * My Pictures — albums are experiences, not folders of files.
 *
 * TO ADD AN ALBUM: append to ALBUMS below.
 *   place / when / coords may be null — the UI renders "—" and the map
 *   simply skips anything without coords. Nothing breaks while it is empty.
 *
 * TO ADD PHOTOS: drop files in static/inner/pictures/<album id>/ and list the
 *   filenames in `shots`. Strip EXIF first (see README note in CURRENT_STATE).
 */
const ALBUMS = [
    {
        id: 'huashan',
        name: 'Huashan',
        place: 'Mount Hua, Shaanxi',
        coords: { lat: 34.48, lon: 110.09 },
        when: null,
        note: 'Went up. Came back down.',
        shots: [],
    },
    {
        id: 'sea-alone',
        name: 'The Sea, Alone',
        place: null,
        coords: null,
        when: null,
        note: 'Nobody to wait for.',
        shots: [],
    },
    {
        id: 'festival',
        name: 'Music Festival',
        place: null,
        coords: null,
        when: null,
        note: null,
        shots: [],
    },
    {
        id: 'train-at-12',
        name: 'The Train at 12',
        place: null,
        coords: null,
        when: 'age 12',
        note: 'Crossed the country alone to find my parents.',
        shots: [],
    },
    {
        id: 'foshan',
        name: 'Foshan, Everyday',
        place: 'Foshan, Guangdong',
        coords: { lat: 23.02, lon: 113.12 },
        when: null,
        note: 'Where the work happens.',
        shots: [],
    },
];

// Map viewport, in degrees. Wide enough that a new point rarely falls outside.
const MAP_BOUNDS = { lonMin: 95, lonMax: 127, latMin: 17, latMax: 46 };
const VIEWS = ['icons', 'details', 'map'];

export class PicturesApp {
    constructor(root) {
        this.root = root;
        this.view = 'icons';
        this.selectedId = null;
    }

    start() {
        if (!this.root) return;

        this.panes = {
            icons: this.root.querySelector('[data-pictures-pane="icons"]'),
            details: this.root.querySelector('[data-pictures-pane="details"]'),
            map: this.root.querySelector('[data-pictures-pane="map"]'),
        };
        this.statusLeft = this.root.querySelector('[data-pictures-status]');
        this.statusRight = this.root.querySelector('[data-pictures-hint]');
        this.capacityBar = this.root.querySelector('[data-pictures-capacity]');
        this.capacityText = this.root.querySelector('[data-pictures-capacity-text]');

        this.root.addEventListener('click', (event) => {
            const viewButton = event.target.closest('[data-pictures-view]');
            if (viewButton) {
                this.setView(viewButton.dataset.picturesView);
                return;
            }

            const album = event.target.closest('[data-album-id]');
            if (album) this.select(album.dataset.albumId);
        });

        this.renderIcons();
        this.renderDetails();
        this.renderMap();
        this.setView('icons');
        this.updateStatus();
    }

    setView(view) {
        if (!VIEWS.includes(view)) return;
        this.view = view;

        VIEWS.forEach((name) => {
            const pane = this.panes[name];
            if (pane) pane.hidden = name !== view;
        });

        this.root
            .querySelectorAll('[data-pictures-view]')
            .forEach((button) => {
                const active = button.dataset.picturesView === view;
                button.classList.toggle('is-active', active);
                button.setAttribute('aria-pressed', String(active));
            });

        this.updateStatus();
    }

    select(id) {
        this.selectedId = this.selectedId === id ? null : id;

        this.root.querySelectorAll('[data-album-id]').forEach((node) => {
            node.classList.toggle(
                'is-selected',
                node.dataset.albumId === this.selectedId,
            );
        });

        this.updateStatus();
    }

    renderIcons() {
        const pane = this.panes.icons;
        if (!pane) return;

        pane.innerHTML = '';

        ALBUMS.forEach((album) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'album-icon';
            button.dataset.albumId = album.id;
            button.innerHTML = `
                <span class="album-art${album.shots.length ? '' : ' is-empty'}" aria-hidden="true"></span>
                <span class="album-name">${album.name}</span>
                <span class="album-count">${
                    album.shots.length
                        ? `${album.shots.length} items`
                        : 'empty'
                }</span>
            `;
            button.setAttribute(
                'aria-label',
                `${album.name}, ${album.shots.length} items`,
            );
            pane.append(button);
        });
    }

    renderDetails() {
        const body = this.panes.details?.querySelector('tbody');
        if (!body) return;

        body.innerHTML = '';

        ALBUMS.forEach((album) => {
            const row = document.createElement('tr');
            row.dataset.albumId = album.id;
            row.innerHTML = `
                <th scope="row"><span class="row-art" aria-hidden="true"></span>${album.name}</th>
                <td>${album.place || '—'}</td>
                <td>${album.when || '—'}</td>
                <td class="is-numeric">${album.shots.length}</td>
                <td class="is-note">${album.note || '—'}</td>
            `;
            body.append(row);
        });
    }

    renderMap() {
        const pane = this.panes.map;
        if (!pane) return;

        const plot = pane.querySelector('[data-map-plot]');
        const legend = pane.querySelector('[data-map-legend]');
        if (!plot || !legend) return;

        const located = ALBUMS.filter((album) => album.coords);

        plot.innerHTML = '';
        legend.innerHTML = '';

        located.forEach((album) => {
            const { lat, lon } = album.coords;
            const x =
                ((lon - MAP_BOUNDS.lonMin) /
                    (MAP_BOUNDS.lonMax - MAP_BOUNDS.lonMin)) *
                100;
            const y =
                ((MAP_BOUNDS.latMax - lat) /
                    (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin)) *
                100;

            const pin = document.createElement('button');
            pin.type = 'button';
            pin.className = 'map-pin';
            pin.dataset.albumId = album.id;
            pin.style.left = `${x}%`;
            pin.style.top = `${y}%`;
            pin.innerHTML = `
                <span class="map-pin-dot" aria-hidden="true"></span>
                <span class="map-pin-label">${album.name}</span>
            `;
            pin.setAttribute(
                'aria-label',
                `${album.name} at ${lat}°N ${lon}°E`,
            );
            plot.append(pin);

            const entry = document.createElement('li');
            entry.textContent = `${album.name} — ${lat.toFixed(2)}°N ${lon.toFixed(2)}°E`;
            legend.append(entry);
        });

        const unlocated = ALBUMS.length - located.length;
        if (unlocated > 0) {
            const entry = document.createElement('li');
            entry.className = 'is-muted';
            entry.textContent = `${unlocated} album${unlocated > 1 ? 's' : ''} with no coordinates on file`;
            legend.append(entry);
        }
    }

    updateStatus() {
        const total = ALBUMS.reduce((sum, a) => sum + a.shots.length, 0);
        const selected = ALBUMS.find((a) => a.id === this.selectedId);

        if (this.statusLeft) {
            this.statusLeft.textContent = selected
                ? `${selected.name} — ${selected.shots.length} items`
                : `${ALBUMS.length} albums, ${total} items`;
        }

        if (this.statusRight) {
            this.statusRight.textContent = selected
                ? selected.note || selected.place || 'no notes yet'
                : total === 0
                  ? 'disk empty — nothing uploaded yet'
                  : 'double-click an album to open';
        }

        // "Disk usage" doubles as a thickness meter: a life, in items.
        const target = 500;
        const percent = Math.min(100, (total / target) * 100);

        if (this.capacityBar) {
            this.capacityBar.style.setProperty('--fill', `${percent}%`);
            this.capacityBar.setAttribute('aria-valuenow', String(total));
        }

        if (this.capacityText) {
            this.capacityText.textContent = `${total} of ${target} used`;
        }
    }
}
