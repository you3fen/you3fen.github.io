const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const output = path.resolve(__dirname, '../public');
const pages = ['index.html', 'about/index.html', 'objects/running/index.html', 'objects/bench-scout/index.html', 'objects/unfinished/index.html', '404.html'];

test('every collection page is complete HTML with working local navigation and assets', () => {
    const titles = new Set();
    for (const page of pages) {
        const html = fs.readFileSync(path.join(output, page), 'utf8');
        assert.match(html, /<html lang="zh-CN"/);
        assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page}: one page heading`);
        assert.doesNotMatch(html, /\{\{\w+\}\}|<canvas|<video|webgl|3D 场景外壳/);
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

test('the new site ships only its small runtime and preserves the old inner desktop', () => {
    const assets = fs.readdirSync(output);
    for (const legacy of ['models', 'textures', 'sounds', 'draco']) assert.ok(!assets.includes(legacy), `old ${legacy} should not be deployed`);
    const js = assets.filter(file => /^collection\..*\.js$/.test(file));
    const css = assets.filter(file => /^collection\..*\.css$/.test(file));
    assert.equal(js.length, 1);
    assert.equal(css.length, 1);
    assert.ok(fs.statSync(path.join(output, js[0])).size < 15000, 'runtime under 15 KB');
    assert.ok(fs.statSync(path.join(output, css[0])).size < 25000, 'styles under 25 KB');
    assert.ok(fs.statSync(path.join(output, 'collection/objects.jpg')).size < 300000, 'single shared image under 300 KB');
    assert.equal(fs.readFileSync(path.join(output, 'CNAME'), 'utf8').trim(), 'yousanfen.com');
    assert.equal(fs.readFileSync(path.join(output, 'inner/index.html'), 'utf8'), fs.readFileSync(path.resolve(__dirname, '../static/inner/index.html'), 'utf8'));
    assert.match(fs.readFileSync(path.join(output, 'about/index.html'), 'utf8'), /AI 概念图/);
});
