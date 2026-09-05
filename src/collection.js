import './collection.css';

const root = document.documentElement;
const button = document.getElementById('museum-light');
const label = document.getElementById('museum-light-label');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

function updateThemeControl() {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : systemTheme.matches;
    button.setAttribute('aria-pressed', String(dark));
    label.textContent = dark ? '开灯' : '关灯';
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
        meta.content = dark ? '#222321' : '#f7f6f2';
    });
}

button.hidden = false;
updateThemeControl();
button.addEventListener('click', () => {
    const theme = button.getAttribute('aria-pressed') === 'true' ? 'light' : 'dark';
    root.dataset.theme = theme;
    try { localStorage.setItem('sanfen-collection-theme', theme); } catch {}
    updateThemeControl();
});
systemTheme.addEventListener('change', updateThemeControl);
window.addEventListener('pageshow', () => {
    // A back/forward cache restore must also pick up a theme changed on another page.
    try {
        const theme = localStorage.getItem('sanfen-collection-theme');
        if (theme === 'light' || theme === 'dark') root.dataset.theme = theme;
        else delete root.dataset.theme;
    } catch {}
    updateThemeControl();
});
