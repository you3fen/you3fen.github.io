const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const output = path.resolve(__dirname, '../public');
const pages = ['index.html', 'about/index.html', 'objects/running/index.html', 'objects/bench-scout/index.html', 'objects/unfinished/index.html', '404.html'];

test('every collection page is complete HTML with working local navigation and assets', () => {
    const titles = new Set();
    for (const page of pages) {
        const html = fs.readFileSync(path.join(output, page), 'utf8');
        assert.match(html, /<html lang="zh-CN"/);
        assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page}: one page heading`);
        assert.doesNotMatch(html, /\{\{\w+\}\}|<canvas|<video|webgl|href="\/inner\/|旧版桌面/);
        const title = html.match(/<title>(.*?)<\/title>/)[1];
        assert.ok(!titles.has(title), `${page}: unique title`);
        titles.add(title);
        assert.match(html, /<link rel="canonical" href="https:\/\/yousanfen\.com\//);
        assert.match(html, /<a class="skip-link" href="#main">/);
        for (const [, href] of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
            if (!href.startsWith('/')) continue;
            const urlPath = href.split('#')[0];
            const file = path.join(output, urlPath, urlPath.endsWith('/') ? 'index.html' : '');
            assert.ok(fs.existsSync(file), `${page}: missing ${href}`);
            if (href.includes('#')) assert.ok(fs.readFileSync(file, 'utf8').includes(`id="${href.split('#')[1]}"`), `${page}: missing anchor ${href}`);
        }
    }
    assert.match(fs.readFileSync(path.join(output, '404.html'), 'utf8'), /name="robots" content="noindex"/);
});

test('the collection ships only its current assets and small runtime', () => {
    const assets = fs.readdirSync(output);
    for (const legacy of ['inner', 'models', 'textures', 'audio', 'sounds', 'draco', 'images']) assert.ok(!assets.includes(legacy), `old ${legacy} should not be deployed`);
    const js = assets.filter(file => /^collection\..*\.js$/.test(file));
    const css = assets.filter(file => /^collection\..*\.css$/.test(file));
    assert.equal(js.length, 1);
    assert.equal(css.length, 1);
    assert.ok(fs.statSync(path.join(output, js[0])).size < 15000, 'runtime under 15 KB');
    assert.ok(fs.statSync(path.join(output, css[0])).size < 25000, 'styles under 25 KB');
    assert.ok(fs.statSync(path.join(output, 'collection/objects.jpg')).size < 300000, 'single shared image under 300 KB');
    assert.equal(fs.readFileSync(path.join(output, 'CNAME'), 'utf8').trim(), 'yousanfen.com');
    assert.match(fs.readFileSync(path.join(output, 'about/index.html'), 'utf8'), /AI 概念图/);
});

function articlePage(search, options = {}) {
    const elements = Object.fromEntries(['status', 'open-app', 'open-web'].map(id => [id, { hidden: true }]));
    const redirects = [];
    const location = { search, set href(value) {
        if (options.blockAutomatic) throw new Error('User gesture required');
        redirects.push(value);
    } };
    const context = {
        URLSearchParams,
        window: { location },
        navigator: { userAgent: options.desktop ? 'Macintosh' : 'iPhone', maxTouchPoints: options.desktop ? 0 : 5 },
        document: { getElementById: id => elements[id] },
    };
    vm.runInNewContext(fs.readFileSync(path.join(output, 'scys/open.js'), 'utf8'), context);
    return { elements, redirects };
}

test('article links preserve long IDs and offer the exact same post in app and web', () => {
    const html = fs.readFileSync(path.join(output, 'scys/index.html'), 'utf8');
    assert.match(html, /name="robots" content="noindex,nofollow"/);
    assert.match(html, /src="\.\/open\.js"/);
    for (const type of ['xq_topic', 'forum_topic']) {
        const { elements, redirects } = articlePage(`?type=${type}&id=22258244882548821`);
        const target = `scys.com/articleDetail/${type}/22258244882548821`;
        assert.deepEqual(redirects, [`scys-reader://${target}`]);
        assert.equal(elements['open-app'].href, redirects[0]);
        assert.equal(elements['open-web'].href, `https://${target}`);
        assert.equal(elements['open-app'].hidden, false);
    }
});

test('malformed article links never trigger navigation or expose an active action', () => {
    for (const search of ['', '?type=xq_topic', '?id=123', '?type=login&id=123',
        '?type=xq_topic&id=-1', '?type=xq_topic&id=１２３', '?type=xq_topic&id=1%2F2',
        '?type=xq_topic&id=1%0A', '?type=xq_topic&id=1&type=forum_topic',
        '?type=xq_topic&id=1&id=2', '?type=xq_topic&id=https://evil.example']) {
        const { elements, redirects } = articlePage(search);
        assert.deepEqual(redirects, [], search);
        assert.equal(elements['open-app'].hidden, true, search);
        assert.equal(elements['open-web'].hidden, true, search);
    }
});

test('blocked automatic launch retains a tappable link, and desktop does not auto-launch', () => {
    for (const options of [{ blockAutomatic: true }, { desktop: true }]) {
        const { elements, redirects } = articlePage('?type=xq_topic&id=123', options);
        assert.deepEqual(redirects, []);
        assert.equal(elements['open-app'].hidden, false);
        assert.equal(elements['open-app'].href, 'scys-reader://scys.com/articleDetail/xq_topic/123');
    }
});
