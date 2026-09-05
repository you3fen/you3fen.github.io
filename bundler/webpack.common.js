const fs = require('node:fs');
const path = require('node:path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

const pages = [
    ['home', 'index.html', '三分 · 私人陈列', '做过的工具，跑过的路，以及那些没有完成的念头。'],
    ['running', 'objects/running/index.html', '跑过的路 · 三分', '两场半程马拉松，个人最好成绩 1:48:37。'],
    ['bench-scout', 'objects/bench-scout/index.html', '做出来的东西 · 三分', 'bench-scout：把参考内容整理进可检索、可筛选的飞书表格。'],
    ['unfinished', 'objects/unfinished/index.html', '暂时放下的念头 · 三分', 'TextLens，一次没有继续做下去的 Mac 截图翻译工具尝试。'],
    ['about', 'about/index.html', '关于三分 · 私人陈列', '跑步，也用 AI 把想法做成工具。这里收着三分做过的一些事。'],
    ['404', '404.html', '这里暂时没有陈列 · 三分', '这件收藏暂时不在这里，回到三分的私人陈列看看。'],
];

module.exports = {
    entry: path.resolve(__dirname, '../src/collection.js'),
    output: {
        hashFunction: 'xxhash64',
        filename: 'collection.[contenthash].js',
        path: path.resolve(__dirname, '../public'),
        publicPath: '/',
    },
    devtool: false,
    plugins: [
        {
            apply(compiler) {
                compiler.hooks.thisCompilation.tap('CollectionPages', compilation => {
                    compilation.fileDependencies.add(path.resolve(__dirname, '../src/index.html'));
                    for (const [page] of pages) compilation.fileDependencies.add(path.resolve(__dirname, `../src/collection/${page}.html`));
                });
            },
        },
        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, '../static/collection'), to: 'collection' },
                { from: path.resolve(__dirname, '../static/CNAME'), to: 'CNAME', toType: 'file' },
                { from: path.resolve(__dirname, '../static/inner'), to: 'inner' },
                { from: path.resolve(__dirname, '../LICENSE.md'), to: 'LICENSE.txt' },
                { from: path.resolve(__dirname, '../static/robots.txt'), to: 'robots.txt' },
                { from: path.resolve(__dirname, '../static/sitemap.xml'), to: 'sitemap.xml' },
            ],
        }),
        ...pages.map(([page, filename, title, description]) => new HtmlWebpackPlugin({
            filename,
            scriptLoading: 'defer',
            minify: { collapseWhitespace: true, removeComments: true, removeAttributeQuotes: false },
            templateContent: () => {
                const values = {
                    title, description, page,
                    canonical: `https://yousanfen.com/${filename.replace(/index\.html$/, '')}`,
                    robots: page === '404' ? 'noindex' : 'index,follow',
                    homeCurrent: page === 'home' ? 'aria-current="page"' : page !== 'about' && page !== '404' ? 'aria-current="location"' : '',
                    aboutCurrent: page === 'about' ? 'aria-current="page"' : '',
                    content: fs.readFileSync(path.resolve(__dirname, `../src/collection/${page}.html`), 'utf8'),
                };
                return fs.readFileSync(path.resolve(__dirname, '../src/index.html'), 'utf8')
                    .replace(/\{\{(\w+)\}\}/g, (_, key) => values[key]);
            },
        })),
        new MiniCSSExtractPlugin({ filename: 'collection.[contenthash].css' }),
    ],
    module: {
        rules: [{ test: /\.css$/, use: [MiniCSSExtractPlugin.loader, 'css-loader'] }],
    },
};
