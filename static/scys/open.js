(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const id = params.get('id');
    const status = document.getElementById('status');
    // Keep long post IDs as strings, and never redirect to a caller-supplied host.
    if (params.getAll('type').length !== 1 || params.getAll('id').length !== 1 ||
        !['xq_topic', 'forum_topic'].includes(type) || !id || /[^0-9]/.test(id)) {
        status.textContent = '文章链接不完整，请让 AI 重新发送这篇帖子的链接。';
        return;
    }

    const path = `scys.com/articleDetail/${type}/${id}`;
    const appLink = document.getElementById('open-app');
    const webLink = document.getElementById('open-web');
    appLink.href = `scys-reader://${path}`;
    webLink.href = `https://${path}`;
    appLink.hidden = false;
    webLink.hidden = false;
    status.textContent = '若未自动打开，请点下方按钮。如有提示，请允许打开生财有术。';

    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
        (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
    if (isIOS) {
        // Attempt once. Returning from the app must not trigger another redirect.
        try { window.location.href = appLink.href; } catch (_) { /* The link remains available for a user tap. */ }
    } else {
        status.textContent = '请在装有生财有术 App 的 iPhone 上打开此链接。';
    }
})();
