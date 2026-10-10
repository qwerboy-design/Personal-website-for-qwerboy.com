(function () {
    'use strict';
    function parseRoute(path, slugs) {
        let clean = path.replace(/\/+$/, '') || '/';
        const locale = /^\/en(?:\/|$)/.test(clean) ? 'en' : 'zh-TW';
        clean = clean.replace(/^\/en(?=\/|$)/, '') || '/';
        clean = clean.replace(/^\/mike(?=\/|$)/, '') || '/'; // portfolio desktop lives at /mike
        const apps = ['about', 'resume', 'projects', 'ai', 'travel', 'photos', 'coffee', 'contact'];
        const match = clean.match(/^\/projects\/([^/]+)$/);
        let projectSlug = null;
        try { if (match && slugs.includes(decodeURIComponent(match[1]))) projectSlug = decodeURIComponent(match[1]); } catch (_) { /* malformed route stays unknown */ }
        const app = projectSlug ? 'projects' : apps.find(id => clean === `/${id}`) || null;
        return { path: clean, locale, app, projectSlug, known: clean === '/' || Boolean(app) };
    }
    function clampGeometry(item, viewport) {
        const finite = (value, fallback) => typeof value === 'number' && Number.isFinite(value) ? value : fallback;
        const maxWidth = Math.max(240, (viewport.stageWidth ?? viewport.width) - 24);
        const maxHeight = Math.max(240, (viewport.stageHeight ?? viewport.height - 316) - 24);
        const width = Math.min(maxWidth, Math.max(240, finite(viewport.minWidth, 240), finite(item.size?.width, 560)));
        const height = Math.min(maxHeight, Math.max(240, finite(item.size?.height, 420)));
        return {
            size: { width, height },
            position: {
                x: Math.min(Math.max(12, finite(item.position?.x, 36)), Math.max(12, (viewport.stageWidth ?? viewport.width) - width - 12)),
                y: Math.min(Math.max(12, finite(item.position?.y, 36)), Math.max(12, (viewport.stageHeight ?? viewport.height - 316) - 24 - height + 12))
            }
        };
    }
    function topVisible(windows) {
        return Object.values(windows).filter(item => item.isOpen && !item.isMinimized && item.id !== 'welcome').sort((a,b) => b.zIndex - a.zIndex)[0]?.id || null;
    }
    window.QWEROS_WINDOW_STATE = { parseRoute, clampGeometry, topVisible };
})();
