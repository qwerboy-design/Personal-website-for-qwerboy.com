(function () {
    'use strict';

    const content = window.QWEROS_CONTENT;
    const root = document.getElementById('qweros-root');

    if (!content || !root) return;

    const appDefinitions = {
        about: { title: 'About Mike', label: 'About', glyph: 'M', route: '/about', windowClass: 'window--about' },
        resume: { title: 'Resume', label: 'Resume', glyph: 'CV', route: '/resume', windowClass: 'window--resume' },
        projects: { title: 'Projects', label: 'Finder', glyph: '⌘', route: '/projects', windowClass: 'window--projects' },
        ai: { title: 'AI Lab', label: 'AI Lab', glyph: 'AI', route: '/ai', windowClass: 'window--compact' },
        terminal: { title: 'Terminal', label: 'Terminal', glyph: '>_', route: null, windowClass: 'window--compact' },
        travel: { title: 'Travel', label: 'Blog', glyph: '◒', route: '/travel', windowClass: 'window--compact' },
        photos: { title: 'Photos', label: 'Photos', glyph: '◎', route: '/photos', windowClass: 'window--compact' },
        coffee: { title: "Mike's Coffee", label: 'Coffee', glyph: '☕', route: '/coffee', windowClass: 'window--compact' },
        contact: { title: 'Contact Mike', label: 'Mail', glyph: '@', route: '/contact', windowClass: 'window--compact' }
    };

    const desktopIconDefinitions = [
        { id: 'resume', label: 'Resume', glyph: 'CV' },
        { id: 'projects', label: 'Projects', glyph: '⌘' },
        { id: 'ai', label: 'Healthcare AI', glyph: 'AI' },
        { id: 'travel', label: 'Travel', glyph: '◒' }
    ];

    const spotlightItems = [
        { id: 'about', title: 'About Mike', detail: 'Senior Product Manager · Healthcare IT', keywords: 'about mike healthcare product system analyst' },
        { id: 'resume', title: 'Resume', detail: 'Experience · Expertise · Skills · Education', keywords: 'resume experience skills education cv' },
        { id: 'projects', title: 'Projects', detail: 'AI · Healthcare · Full Stack', keywords: 'projects portfolio finder ai healthcare full stack' },
        { id: 'ai', title: 'Healthcare AI', detail: 'Clinical workflows · Medical AI · API integration', keywords: 'ai healthcare medical clinical fhir hl7' },
        { id: 'travel', title: 'Travel', detail: "Mike's travel stories and destinations", keywords: 'travel blog japan new york switzerland' },
        { id: 'coffee', title: "Mike's Coffee", detail: 'Full-stack coffee ordering platform', keywords: 'coffee shop ordering full stack' },
        { id: 'terminal', title: 'Terminal', detail: 'Allowlisted portfolio commands', keywords: 'terminal command line shell help' }
    ];

    const pathToApp = {
        '/about': 'about',
        '/resume': 'resume',
        '/projects': 'projects',
        '/ai': 'ai',
        '/travel': 'travel',
        '/photos': 'photos',
        '/coffee': 'coffee',
        '/contact': 'contact'
    };

    const windowSizes = {
        welcome: { width: 520, height: 380 },
        about: { width: 560, height: 480 },
        resume: { width: 820, height: 600 },
        projects: { width: 880, height: 620 },
        ai: { width: 640, height: 420 },
        terminal: { width: 640, height: 420 },
        travel: { width: 640, height: 420 },
        photos: { width: 640, height: 420 },
        coffee: { width: 640, height: 420 },
        contact: { width: 640, height: 420 },
    };

    const windowState = window.QWEROS_WINDOW_STATE;
    const routePath = windowState.parseRoute(window.location.pathname, content.projects.map(p => p.slug)).path;
    const initialProjectSlug = getProjectSlug(routePath);
    const initialRouteApp = initialProjectSlug ? 'projects' : pathToApp[routePath] || null;
    const initialLocale = getStoredLocale();
    let zCounter = 40;
    let state = {
        activeApp: initialRouteApp,
        mobileApp: isMobileViewport() ? (initialRouteApp || (!hasSeenWelcome() ? 'welcome' : null)) : null,
        locale: initialLocale,
        projectSlug: initialProjectSlug,
        openMenu: null,
        spotlightOpen: false,
        spotlightQuery: '',
        selectedIcon: null,
        projectFilter: 'all',
        terminalLines: null,
        windows: createWindows(initialRouteApp)
    };

    const presentation = window.QWEROS_PRESENTATION({content, t, localized, escapeHtml, assetPath, resumeContent});
    const icon = presentation.icon;
    const projectPresentation = window.QWEROS_PROJECTS({content, getState: () => state, t, localized, escapeHtml, icon});
    const terminal = window.QWEROS_TERMINAL({getState: () => state, content, t, localized, escapeHtml, resumeContent, appDefinitions, commit, openApp});

    function isMobileViewport() {
        return window.matchMedia ? window.matchMedia('(max-width: 767px)').matches : window.innerWidth <= 767;
    }

    function getStoredLocale() {
        return windowState.parseRoute(window.location.pathname, content.projects.map(p => p.slug)).locale;
    }

    function getProjectSlug(path) {
        return windowState.parseRoute(path, content.projects.map(p => p.slug)).projectSlug;
    }

    function routeUrl(path, locale = state.locale) {
        const clean = windowState.parseRoute(path, content.projects.map(p => p.slug)).path;
        const target = clean === '/' ? '/mike' : clean;
        return locale === 'en' ? `/en${target}` : target;
    }

    function resumeContent() {
        return window.QWEROS_RESUME_LOCALES?.[state.locale] || content;
    }

    function t(key) {
        const dictionary = content.translations && content.translations[state.locale];
        return (dictionary && dictionary[key]) || (content.translations && content.translations['zh-TW'] && content.translations['zh-TW'][key]) || key;
    }

    function localized(value) {
        if (!value || typeof value !== 'object') return value || '';
        return value[state.locale] || value['zh-TW'] || value.en || '';
    }

    function projectBySlug(slug) {
        return content.projects.find((project) => project.slug === slug) || null;
    }

    function getInitialSize(id) {
        const source = windowSizes[id] || windowSizes.about;
        const maxWidth = Math.max(360, window.innerWidth - 48);
        const maxHeight = Math.max(260, window.innerHeight - 44 - 32);
        return { width: Math.min(source.width, maxWidth), height: Math.min(source.height, maxHeight) };
    }

    function createPosition(id, index) {
        const viewportWidth = Math.max(window.innerWidth, 720);
        const viewportHeight = Math.max(window.innerHeight - 44, 500);
        const size = getInitialSize(id);
        const suggestedX = id === 'welcome' ? viewportWidth * 0.32 : 80 + (index % 3) * 44;
        const suggestedY = id === 'welcome' ? 90 : 78 + (index % 3) * 34;
        return {
            x: Math.max(16, Math.min(Math.round(suggestedX), viewportWidth - size.width - 18)),
            y: Math.max(16, Math.min(Math.round(suggestedY), viewportHeight - size.height - 16))
        };
    }

    function createWindows(routeApp) {
        const ids = ['welcome', ...Object.keys(appDefinitions)];
        const windows = {};
        ids.forEach((id, index) => {
            const isWelcome = id === 'welcome';
            windows[id] = {
                id,
                title: isWelcome ? 'Welcome to qwerOS' : appDefinitions[id].title,
                isOpen: id === routeApp || (isWelcome && !routeApp && !hasSeenWelcome()),
                isMinimized: false,
                isMaximized: false,
                zIndex: id === routeApp ? 40 : isWelcome ? 30 : 10,
                ...loadGeometry(id, index)
            };
        });
        return windows;
    }

    function geometryViewport() {
        const width = isMobileViewport() ? 1440 : innerWidth;
        const height = isMobileViewport() ? 1024 : innerHeight;
        return {width, height, ...window.QWEROS_THEMES.stageDimensions(width, height)};
    }

    function clampWindow(item, id) { return windowState.clampGeometry(item, {...geometryViewport(), minWidth: ['projects','resume'].includes(id) ? 680 : 240}); }

    function loadGeometry(id, index) {
        const viewport = geometryViewport();
        const large = ['resume', 'projects'].includes(id);
        let geometry = {position: {x: 12 + (large ? 0 : index % 3 * 18), y: 12 + (large ? 0 : index % 3 * 18)}, size: large ? {width: viewport.stageWidth - 24, height: viewport.stageHeight - 24} : getInitialSize(id)};
        try {
            const saved = JSON.parse(localStorage.getItem(`qweros-geometry-v2-${document.documentElement.dataset.theme}`) || '{}');
            if (saved[id]?.position && saved[id]?.size) geometry = saved[id];
        } catch (_) { /* Storage is optional. */ }
        return clampWindow(geometry, id);
    }

    function saveGeometry(theme = document.documentElement.dataset.theme) {
        if (isMobileViewport()) return;
        try {
            localStorage.setItem(`qweros-geometry-v2-${theme}`, JSON.stringify(Object.fromEntries(Object.entries(state.windows).map(([id, item]) => [id, {position: item.position, size: item.size}]))));
        } catch (_) { /* Storage is optional. */ }
    }

    function hasSeenWelcome() {
        try {
            return window.sessionStorage.getItem('qweros-welcome-seen') === '1';
        } catch (error) {
            return false;
        }
    }

    function markWelcomeSeen() {
        try {
            window.sessionStorage.setItem('qweros-welcome-seen', '1');
        } catch (error) {
            // Private browsing can block sessionStorage; the UI still works.
        }
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function assetPath(path) {
        const base = document.body.dataset.assetsBase || '';
        return base ? `${base.replace(/\/+$/, '')}/${path}` : path;
    }

    function updateMetadata(appId) {
        const definition = appId && appDefinitions[appId];
        const project = appId === 'projects' && state.projectSlug ? projectBySlug(state.projectSlug) : null;
        const title = project
            ? `${localized(project.displayTitle || project.title)} | Mike Liu — qwerOS`
            : definition
                ? `${definition.title} | Mike Liu — qwerOS`
                : state.locale === 'en' ? "Mike Liu | qwerOS — Senior Product Manager" : 'Mike Liu | qwerOS — Senior Product Manager';
        const description = project
            ? localized(project.overview)
            : definition && appId === 'projects'
                ? state.locale === 'en' ? "Explore Mike Liu's healthcare AI, full-stack, and product experiments." : '探索 Mike Liu 的 Healthcare AI、全端產品與實作實驗。'
                : definition && appId === 'resume'
                    ? state.locale === 'en' ? "Mike Liu's healthcare IT experience, product leadership, system analysis, and technical skills." : 'Mike Liu 的醫療 IT 經驗、產品領導、系統分析與技術技能。'
                    : state.locale === 'en' ? "Mike Liu's digital workspace for Healthcare AI, product delivery, and systems analysis." : 'Mike Liu 的 qwerOS 個人數位工作空間：Senior Product Manager、Senior System Analyst、產品與系統開發者。';
        document.title = title;
        const descriptionMeta = document.querySelector('meta[name="description"]');
        if (descriptionMeta) descriptionMeta.setAttribute('content', description);
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.setAttribute('href', `https://qwerboy.com${routeUrl(project && appId === 'projects' ? `/projects/${project.slug}` : definition && definition.route ? definition.route : '/')}`);
        document.documentElement.lang = state.locale === 'en' ? 'en' : 'zh-Hant';
        const route = project ? `/projects/${project.slug}` : definition?.route || '/';
        document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => {
            link.href = `https://qwerboy.com${routeUrl(route, link.hreflang === 'en' ? 'en' : 'zh-TW')}`;
        });
        ['og:title', 'og:description', 'og:url'].forEach((key, i) => {
            document.querySelector(`meta[property="${key}"]`)?.setAttribute('content', [title, description, canonical?.href][i]);
        });
        const ld = document.querySelector('script[type="application/ld+json"]');
        if (ld) ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': ['about', 'resume'].includes(appId) ? 'ProfilePage' : appId === 'contact' ? 'ContactPage' : appId === 'projects' && !project ? 'CollectionPage' : 'WebPage', name: title, description, url: canonical?.href, inLanguage: state.locale, ...(project ? {mainEntity: {'@type': 'CreativeWork', name: localized(project.displayTitle || project.title), description, url: canonical?.href}} : {}), about: {'@type': 'Person', name: content.person.name, jobTitle: 'Senior Product Manager', url: 'https://qwerboy.com/'} });
    }

    function commit(nextState, shouldRender = true) {
        state = nextState;
        if (shouldRender) render();
    }

    function currentPath() {
        if (state.activeApp === 'projects' && state.projectSlug) return `/projects/${state.projectSlug}`;
        return appDefinitions[state.activeApp]?.route || '/';
    }

    function syncUrl(replace = false) {
        const url = routeUrl(currentPath()) + (state.activeApp === 'terminal' ? '?app=terminal' : '');
        const targetUrl = new URL(url, location.origin);
        const same = location.pathname.replace(/\/+$/, '') === targetUrl.pathname.replace(/\/+$/, '') && location.search === targetUrl.search;
        history[replace || same ? 'replaceState' : 'pushState']({qweros: {windows: state.windows, activeApp: state.activeApp, projectSlug: state.projectSlug, theme: document.documentElement.dataset.theme}}, '', url);
        updateMetadata(state.activeApp);
    }

    function focusWindow(id) {
        const selector = isMobileViewport() ? '.mobile-app-screen' : `.window[data-window-id="${id}"]`;
        window.requestAnimationFrame(() => root.querySelector(selector)?.focus({preventScroll: true}));
    }

    function returnFocus(id) {
        window.requestAnimationFrame(() => {
            const target = state.activeApp ? root.querySelector(isMobileViewport() ? '.mobile-app-screen' : `.window[data-window-id="${state.activeApp}"]`) : (!isMobileViewport() && root.querySelector(`.dock-item[data-app-id="${id}"]`)) || root.querySelector('.menu-bar-brand');
            target?.focus({preventScroll: true});
        });
    }

    function focusApp(id, shouldRender = true) {
        if (!state.windows[id]) return;
        zCounter += 1;
        const windows = { ...state.windows, [id]: { ...state.windows[id], zIndex: zCounter, isMinimized: false, isOpen: true } };
        commit({ ...state, activeApp: id, windows }, shouldRender);
        syncUrl();
    }

    function openApp(id) {
        if (!appDefinitions[id]) return;
        commit({...state, projectSlug: id === 'projects' ? null : state.projectSlug, mobileApp: isMobileViewport() ? id : null, openMenu: null, spotlightOpen: false}, false);
        focusApp(id);
        focusWindow(id);
    }

    function openProjectDetail(slug) {
        if (!projectBySlug(slug)) return;
        commit({...state, projectSlug: slug, mobileApp: isMobileViewport() ? 'projects' : null, openMenu: null, spotlightOpen: false}, false);
        focusApp('projects');
        focusWindow('projects');
    }

    function toggleLocale() {
        // Navigate to the static counterpart so metadata and no-JS content agree.
        location.assign(routeUrl(currentPath(), state.locale === 'en' ? 'zh-TW' : 'en') + (state.activeApp === 'terminal' ? '?app=terminal' : ''));
    }

    function closeWindow(id) {
        if (!state.windows[id]) return;
        if (id === 'welcome') markWelcomeSeen();
        const windows = { ...state.windows, [id]: { ...state.windows[id], isOpen: false, isMinimized: false } };
        const activeApp = windowState.topVisible(windows);
        commit({ ...state, windows, activeApp, mobileApp: isMobileViewport() ? activeApp : null, projectSlug: id === 'projects' ? null : state.projectSlug });
        syncUrl();
        returnFocus(id);
    }

    function minimizeWindow(id) {
        if (!state.windows[id]) return;
        const windows = {...state.windows, [id]: {...state.windows[id], isMinimized: true}};
        const activeApp = windowState.topVisible(windows);
        commit({...state, windows, activeApp, mobileApp: isMobileViewport() ? activeApp : null});
        syncUrl();
        returnFocus(id);
    }

    function toggleMaximize(id) {
        const current = state.windows[id];
        if (!current) return;
        commit({...state, windows: {...state.windows, [id]: {...current, isMaximized: !current.isMaximized}}, activeApp: id});
        syncUrl(true);
        focusWindow(id);
    }

    function navigateTo(path, replace, snapshot) {
        const route = windowState.parseRoute(path, content.projects.map(p => p.slug));
        const appId = route.app || (location.search === '?app=terminal' ? 'terminal' : null);
        const validSnapshot = snapshot && snapshot.activeApp === appId && snapshot.projectSlug === route.projectSlug && snapshot.windows && Object.keys(state.windows).every(id => snapshot.windows[id]?.id === id);
        const windows = validSnapshot ? Object.fromEntries(Object.entries(snapshot.windows).map(([id,item], index) => [id, {...item, ...(snapshot.theme === document.documentElement.dataset.theme ? clampWindow(item, id) : loadGeometry(id, index))}])) : Object.fromEntries(Object.entries(state.windows).map(([id, item]) => [id, {...item, isOpen: id === appId || (id === 'welcome' && !appId && !hasSeenWelcome()), isMinimized: false}]));
        zCounter = Math.max(zCounter, ...Object.values(windows).map(w => w.zIndex));
        commit({...state, windows, locale: route.locale, activeApp: appId, projectSlug: route.projectSlug, mobileApp: isMobileViewport() ? appId || (!hasSeenWelcome() ? 'welcome' : null) : null, openMenu: null, spotlightOpen: false});
        syncUrl(replace);
        if (appId) focusWindow(appId);
    }

    function toggleMenu(menu) {
        commit({ ...state, openMenu: state.openMenu === menu ? null : menu, spotlightOpen: false });
    }

    function renderMenuPopover() {
        if (!state.openMenu) return '';
        const menu = state.openMenu;
        const menus = {
            mike: `<button data-action="open-app" data-app-id="about">${t('about')}</button><button data-action="open-app" data-app-id="resume">${t('resume')}</button><button data-action="open-app" data-app-id="contact">${t('contact')}</button><div class="menu-separator"></div><button data-action="close-menu">${state.locale === 'en' ? 'Close Menu' : '關閉選單'}</button>`,
            file: `<button data-action="open-app" data-app-id="projects">${state.locale === 'en' ? 'New Project View' : '新增專案檢視'}</button><button data-action="open-app" data-app-id="resume">${state.locale === 'en' ? 'Open Resume' : '開啟履歷'}</button>`,
            view: `<button data-action="open-route" data-route="/">${state.locale === 'en' ? 'Show Desktop' : '顯示桌面'}</button><button data-action="open-app" data-app-id="projects">${state.locale === 'en' ? 'Open Projects' : '開啟專案'}</button><button data-action="open-app" data-app-id="resume">${state.locale === 'en' ? 'Open Resume' : '開啟履歷'}</button>`,
            projects: `<button data-action="open-app" data-app-id="projects">${state.locale === 'en' ? 'Featured Projects' : '精選專案'}</button><button data-action="open-app" data-app-id="ai">Healthcare AI</button>`,
            window: `<button data-action="minimize-active">${state.locale === 'en' ? 'Minimize Active Window' : '縮小作用中視窗'}</button><button data-action="maximize-active">${state.locale === 'en' ? 'Maximize / Restore' : '最大化／還原'}</button><button data-action="close-active">${state.locale === 'en' ? 'Close Active Window' : '關閉作用中視窗'}</button>`,
            help: `<button data-action="open-app" data-app-id="terminal">${state.locale === 'en' ? 'qwerOS Help' : 'qwerOS 說明'}</button><a href="https://blog.qwerboy.com" target="_blank" rel="noopener noreferrer">${state.locale === 'en' ? "Mike's Blog" : 'Mike 的 Blog'}</a>`
        };
        return `<div class="menu-popover menu-popover--${menu}" role="group">${menus[menu] || ''}</div>`;
    }

    function renderMenuBar() {
        const labels = [t('menuMike'), t('menuFile'), t('menuView'), t('menuProjects'), t('menuWindow'), t('menuHelp')];
        const menuIds = ['mike', 'file', 'view', 'projects', 'window', 'help'];
        return `<header class="menu-bar" aria-label="qwerOS menu bar">
            <button class="menu-bar-brand" data-action="open-route" data-route="/" aria-label="Go to qwerOS desktop"><img class="brand-mark" src="/assets/favicon/favicon-32x32.png" alt=""><span>qwerOS</span></button>
            <nav class="menu-bar-nav" aria-label="Application menus">
                ${labels.map((label, index) => `<button class="menu-item" data-action="toggle-menu" data-menu="${menuIds[index]}" aria-expanded="${state.openMenu === menuIds[index]}">${escapeHtml(label)}</button>`).join('')}
            </nav>
            <div class="menu-bar-spacer"></div>
            <span class="menu-identity">Mike Liu · ${escapeHtml(localized(content.person.title))}</span>
            <div class="menu-status">${window.QWEROS_THEMES.renderSelect(state.locale)}
                <button class="menu-shortcut" data-action="toggle-spotlight" aria-label="Search qwerOS, Command K">${icon('search')}<span>${t('search')}</span><span class="shortcut-key">⌘K</span></button>
                <button class="locale-toggle" data-action="toggle-locale" aria-label="${state.locale === 'en' ? '切換成繁體中文' : 'Switch to English'}"><span ${state.locale === 'en' ? 'aria-current="true"' : ''}>EN</span> / <span ${state.locale !== 'en' ? 'aria-current="true"' : ''}>TW</span></button>
                <time class="menu-clock" id="menu-clock" aria-label="Current time"></time>
                <button class="menu-status-button" data-action="toggle-menu" data-menu="help" aria-label="Open qwerOS help menu">${icon('more')}</button>
            </div>
            ${renderMenuPopover()}
        </header>`;
    }

    function renderDesktopIcons() {
        return `<div class="desktop-icons" aria-label="Desktop apps">
            ${desktopIconDefinitions.map((item) => `<button class="desktop-icon ${state.selectedIcon === item.id ? 'is-selected' : ''}" data-icon-id="${item.id}" aria-label="Open ${escapeHtml(item.label)}. Double click to launch.">
                <span class="desktop-icon-glyph" aria-hidden="true">${icon(item.id)}</span>
                <span class="desktop-icon-label">${escapeHtml(item.label)}</span>
            </button>`).join('')}
        </div>`;
    }

    function renderDock() {
        const items = ['projects', 'about', 'resume', 'ai', 'terminal', 'travel', 'photos', 'coffee', 'contact'];
        return `<nav class="dock" aria-label="qwerOS Dock">
            ${items.map((id) => {
                const definition = appDefinitions[id];
                const active = state.windows[id] && state.windows[id].isOpen;
                return `<button class="dock-item ${active ? 'is-active' : ''}" data-action="open-app" data-app-id="${id}" aria-label="Open ${escapeHtml(definition.label)}">
                    <span class="dock-glyph" aria-hidden="true">${icon(id)}</span>
                    <span class="dock-label">${escapeHtml(definition.label)}</span>
                </button>`;
            }).join('')}
        </nav>`;
    }

    function renderWindowFrame(id, title, contentHtml, extraClass) {
        const item = state.windows[id];
        if (!item || !item.isOpen) return '';
        const definition = appDefinitions[id];
        const route = id === 'projects' && state.projectSlug ? `/projects/${state.projectSlug}` : definition && definition.route ? definition.route : '';
        const className = `window ${definition ? definition.windowClass : 'window--welcome'} ${extraClass || ''} ${item.isMaximized ? 'is-maximized' : ''} ${item.isMinimized ? 'is-minimized' : ''} ${state.activeApp === id ? 'is-active' : ''}`;
        const style = item.isMaximized ? `z-index:${item.zIndex};` : `left:${item.position.x}px;top:${item.position.y}px;width:${item.size.width}px;height:${item.size.height}px;z-index:${item.zIndex};`;
        return `<section class="${className}" data-window-id="${id}" style="${style}" role="dialog" aria-modal="false" aria-labelledby="window-title-${id}" tabindex="-1">
            <header class="window-titlebar" data-drag-handle="true" data-window-id="${id}">
                <div class="window-controls" aria-label="Window controls">
                    <button class="window-control window-control--close" data-action="close-window" data-window-id="${id}" aria-label="Close ${escapeHtml(title)}"></button>
                    <button class="window-control window-control--minimize" data-action="minimize-window" data-window-id="${id}" aria-label="Minimize ${escapeHtml(title)}"></button>
                    <button class="window-control window-control--maximize" data-action="maximize-window" data-window-id="${id}" aria-label="Maximize or restore ${escapeHtml(title)}"></button>
                </div>
                <h2 class="window-title" id="window-title-${id}">${escapeHtml(title)}</h2>
                <span class="window-route">${escapeHtml(route)}</span>
            </header>
            <div class="window-body">${contentHtml}</div>
            ${id !== 'welcome' ? `<button type="button" class="window-resize-handle" data-resize-handle="true" data-window-id="${id}" aria-label="${state.locale === 'en' ? 'Resize window' : '調整視窗大小'}">${icon('resize')}</button>` : ''}
        </section>`;
    }

    function renderMetrics() {
        return content.person.stats.map(stat => `<div class="stat-card"><strong>${escapeHtml(stat.value)}</strong><span>${escapeHtml(resumeContent().metricLabels?.[stat.label] || stat.label)}</span><details><summary>${stat.verified ? (state.locale === 'en' ? 'Verified' : '已驗證') : (state.locale === 'en' ? 'Self-reported · unverified' : '自述・未驗證')}</summary><p>${escapeHtml(localized(stat.scope))}</p><p>${state.locale === 'en' ? 'Source' : '來源'}: ${escapeHtml(resumeContent().metricSources?.[stat.source] || stat.source)}</p></details></div>`).join('');
    }

    function renderWelcome() {
        return `<div class="window-content welcome-content">
            <p class="eyebrow">${t('welcomeEyebrow')}</p>
            <h2>${t('welcomeTitle')}</h2>
            <p class="window-lead">${t('welcomeLead')}</p>
            <div class="stat-grid">${renderMetrics()}</div>
            <p><strong>${escapeHtml(content.person.name)}</strong><br>${escapeHtml(content.person.headline)}<br>${escapeHtml(localized(content.person.title))}</p>
            <div class="window-actions">
                <button class="primary-button" data-action="open-app" data-app-id="projects">${t('exploreProjects')}</button>
                <button class="secondary-button" data-action="open-app" data-app-id="resume">${t('viewResume')}</button>
            </div>
        </div>`;
    }

    function renderAbout() {
        return `<div class="window-content">
            <div class="about-profile">
                <img src="${assetPath('assets/images/profile-professional.jpg')}" alt="Mike Liu professional portrait">
                <div><p class="eyebrow">${t('aboutEyebrow')}</p><h2>Mike Liu</h2><p>${escapeHtml(content.person.headline)}<br>${escapeHtml(localized(content.person.title))}</p></div>
            </div>
            <p class="window-lead">${escapeHtml(localized(content.person.intro))} ${t('aboutLead')}</p>
            <div class="stat-grid">${renderMetrics()}</div>
            <div class="window-actions">
                <button class="primary-button" data-action="open-app" data-app-id="resume">${t('viewResume')}</button>
                <button class="secondary-button" data-action="open-app" data-app-id="projects">${t('viewProjects')}</button>
                ${presentation.renderContactActions()}
            </div>
        </div>`;
    }

    function renderProjects() { return projectPresentation.renderProjects(); }

    function renderAi() {
        const capabilityItems = content.expertise.filter((item) => /Healthcare|HIS|FHIR|Clinical|Medical|AI/i.test(item));
        return `<div class="window-content"><p class="eyebrow">${t('aiEyebrow')}</p><h2>${t('aiTitle')}</h2><p class="window-lead">${t('aiLead')}</p><div class="ai-lab-grid"><article class="feature-callout"><h3>${t('aiAssistant')}</h3><p>${t('aiAssistantBody')}</p><a class="light-link" href="${escapeHtml(projectBySlug('healthcare-ai').demoUrl)}" target="_blank" rel="noopener noreferrer">${t('openHealthcare')} ↗</a></article><section class="ai-capabilities"><h3>${t('capabilities')}</h3><ul class="chip-list">${capabilityItems.map((item) => `<li class="chip">${escapeHtml(item)}</li>`).join('')}</ul></section></div><ul class="link-list"><li><a href="${escapeHtml(projectBySlug('healthcare-ai').demoUrl)}" target="_blank" rel="noopener noreferrer"><span><strong>${t('openHealthcare')}</strong><small>${t('existingService')}</small></span><span aria-hidden="true">↗</span></a></li></ul></div>`;
    }

    function renderTravel() {
        return `<div class="window-content"><p class="eyebrow">${t('travelEyebrow')}</p><h2>${t('travelTitle')}</h2><p class="window-lead">${t('travelLead')}</p><h3>${t('featuredTrips')}</h3><ul class="link-list">${content.destinations.map((item) => `<li><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer"><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.label)}</small></span><span aria-hidden="true">↗</span></a></li>`).join('')}</ul><div class="window-actions"><a class="primary-button" href="${escapeHtml(content.person.blog)}" target="_blank" rel="noopener noreferrer">${t('openBlog')}</a></div></div>`;
    }

    function renderContact() {
        return `<div class="window-content"><p class="eyebrow">${t('contactEyebrow')}</p><h2>${t('contactTitle')}</h2><p class="window-lead">${t('contactLead')}</p><ul class="link-list"><li><a href="mailto:${escapeHtml(content.person.email)}"><span><strong>Email</strong><small>${escapeHtml(content.person.email)}</small></span><span aria-hidden="true">↗</span></a></li><li><a href="${escapeHtml(content.person.facebook)}" target="_blank" rel="noopener noreferrer"><span><strong>Facebook</strong><small>Mike0725</small></span><span aria-hidden="true">↗</span></a></li><li><a href="${escapeHtml(content.person.blog)}" target="_blank" rel="noopener noreferrer"><span><strong>${t('blog')}</strong><small>${t('travelStories')}</small></span><span aria-hidden="true">↗</span></a></li><li><a href="${escapeHtml(content.person.github)}" target="_blank" rel="noopener noreferrer"><span><strong>GitHub</strong><small>${state.locale === 'en' ? 'Projects and repositories' : '專案與程式碼'}</small></span><span aria-hidden="true">↗</span></a></li></ul></div>`;
    }

    function renderPhotos() {
        return `<div class="window-content"><p class="eyebrow">${t('photosEyebrow')}</p><h2>${t('photosTitle')}</h2><p class="window-lead">${t('photosLead')}</p><div class="photo-grid">${content.photoAssets.map((photo) => `<figure class="photo-card"><img src="${assetPath(photo.src)}" alt="${escapeHtml(photo.alt)}" loading="lazy"><figcaption><strong>${escapeHtml(photo.title)}</strong><small>${escapeHtml(photo.detail)}</small></figcaption></figure>`).join('')}</div><div class="photo-album-links">${content.destinations.map((item) => `<a class="text-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.name)} · ${t('openAlbum')} ↗</a>`).join('')}</div></div>`;
    }

    function renderCoffee() {
        return `<div class="window-content"><p class="eyebrow">${t('coffeeEyebrow')}</p><h2>${t('coffeeTitle')}</h2><p class="window-lead">${t('coffeeLead')}</p><div class="coffee-feature-grid"><div class="coffee-feature"><strong>Products</strong><span>${state.locale === 'en' ? 'Catalog and discovery' : '商品與瀏覽'}</span></div><div class="coffee-feature"><strong>Cart / Auth</strong><span>${state.locale === 'en' ? 'Customer flow' : '顧客流程'}</span></div><div class="coffee-feature"><strong>Orders</strong><span>${state.locale === 'en' ? 'Order lifecycle' : '訂單生命週期'}</span></div><div class="coffee-feature"><strong>Inventory / Admin</strong><span>${state.locale === 'en' ? 'Operations' : '營運管理'}</span></div></div><div class="window-actions"><a class="primary-button" href="${escapeHtml(projectBySlug('mikes-coffee').demoUrl)}" target="_blank" rel="noopener noreferrer">${t('launchApp')}</a><button class="secondary-button" data-action="open-project-detail" data-project-slug="mikes-coffee">${t('openDetails')}</button></div></div>`;
    }

    function renderProjectDetail() { return projectPresentation.renderProjectDetail(); }

    function renderAppContent(id) {
        if (id === 'welcome') return renderWelcome();
        if (id === 'about') return renderAbout();
        if (id === 'resume') return presentation.renderResume();
        if (id === 'projects') return renderProjects();
        if (id === 'ai') return renderAi();
        if (id === 'travel') return renderTravel();
        if (id === 'contact') return renderContact();
        if (id === 'photos') return renderPhotos();
        if (id === 'coffee') return renderCoffee();
        return terminal.renderTerminal();
    }

    function windowTitle(id) {
        if (id === 'welcome') return t('welcomeTitle');
        if (id === 'projects' && state.projectSlug) {
            const project = projectBySlug(state.projectSlug);
            return project ? localized(project.displayTitle || project.title) : t('projectDetail');
        }
        const titleKeys = { about: 'about', resume: 'resume', projects: 'projects', ai: 'ai', terminal: 'terminal', travel: 'travel', photos: 'photos', coffee: 'coffee', contact: 'contact' };
        return titleKeys[id] ? t(titleKeys[id]) : appDefinitions[id].title;
    }

    function renderWindows() {
        const ids = ['welcome', ...Object.keys(appDefinitions)];
        return ids.map((id) => {
            const title = windowTitle(id);
            return renderWindowFrame(id, title, renderAppContent(id));
        }).join('');
    }

    function renderMobileApp() {
        if (!state.mobileApp) return '';
        const id = state.mobileApp;
        const title = windowTitle(id);
        return `<section class="mobile-app-screen" role="region" tabindex="-1" aria-labelledby="mobile-app-title"><div class="mobile-app-header"><button class="mobile-back" data-action="mobile-back">← qwerOS</button><h2 id="mobile-app-title">${escapeHtml(title)}</h2><span aria-hidden="true">${icon(id)}</span></div>${renderAppContent(id)}</section>`;
    }

    function renderMobilePortfolio() {
        const cards = [
            ['about', t('about'), state.locale === 'en' ? 'Who I am' : '關於我', 'M'],
            ['resume', t('resume'), state.locale === 'en' ? 'Experience & skills' : '經歷與技能', 'CV'],
            ['projects', t('projects'), state.locale === 'en' ? 'Work & experiments' : '作品與實驗', '⌘'],
            ['ai', 'Healthcare AI', state.locale === 'en' ? 'Clinical technology' : '臨床科技', 'AI'],
            ['travel', t('travel'), state.locale === 'en' ? 'Stories & places' : '故事與地點', '◒'],
            ['photos', t('photos'), state.locale === 'en' ? 'Photography archive' : '攝影紀錄', '◎'],
            ['coffee', t('coffee'), state.locale === 'en' ? 'Coffee platform' : '咖啡平台', '☕'],
            ['contact', t('contact'), state.locale === 'en' ? 'Get in touch' : '聯絡方式', '@']
        ];
        return `<div class="mobile-portfolio"><div class="mobile-card-grid" ${state.mobileApp ? 'hidden' : ''}>${cards.map(([id, label, detail, glyph]) => `<button class="mobile-card" data-action="open-app" data-app-id="${id}"><span class="mobile-card-icon" aria-hidden="true">${icon(id)}</span><span><strong>${label}</strong><small>${detail}</small></span></button>`).join('')}</div>${renderMobileApp()}</div>`;
    }

    function renderSpotlight() {
        if (!state.spotlightOpen) return '';
        const query = state.spotlightQuery.trim().toLowerCase();
        const results = spotlightItems.filter((item) => !query || `${item.title} ${item.detail} ${item.keywords}`.toLowerCase().includes(query));
        return `<div class="spotlight-backdrop" data-action="close-spotlight"><div class="spotlight-panel" role="dialog" aria-modal="true" aria-labelledby="spotlight-title" data-spotlight-panel><h2 class="sr-only" id="spotlight-title">Search qwerOS</h2><div class="spotlight-search">${icon('search')}<label class="sr-only" for="spotlight-input">Search qwerOS</label><input id="spotlight-input" type="search" autocomplete="off" placeholder="Search qwerOS" value="${escapeHtml(state.spotlightQuery)}"></div><div class="spotlight-results">${results.length ? results.map((item) => `<button class="spotlight-result" data-action="spotlight-result" data-app-id="${item.id}"><span class="spotlight-result-glyph" aria-hidden="true">${icon(item.id)}</span><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)}</small></span></button>`).join('') : '<div class="empty-state">No matching qwerOS content.</div>'}</div></div></div>`;
    }

    function render() {
        const focused = document.activeElement;
        const focusId = focused?.id;
        const focusAction = focused?.dataset?.action;
        const focusAppId = focused?.dataset?.appId;
        const focusWindowId = focused?.dataset?.windowId;
        document.body.dataset.activeApp = state.activeApp || 'home';
        updateMetadata(state.activeApp);
        root.innerHTML = `<div class="qweros-shell"><div class="wallpaper" aria-hidden="true"></div>${renderMenuBar()}<main class="desktop-stage" aria-label="qwerOS desktop"><div class="desktop-hint"><strong>Mike Liu’s Digital Workspace</strong><span>Double-click an icon or use the Dock to explore.</span></div>${presentation.renderIdentity()}${renderDesktopIcons()}<div class="desktop-windows">${renderWindows()}</div>${renderMobilePortfolio()}</main>${renderDock()}</div>${renderSpotlight()}`;
        updateClock();
        root.querySelector('.qweros-shell').inert = state.spotlightOpen;
        if (!state.spotlightOpen) {
            const selector = focusId ? `#${CSS.escape(focusId)}` : focusAction ? `[data-action="${focusAction}"]${focusAppId ? `[data-app-id="${focusAppId}"]` : ''}${focusWindowId ? `[data-window-id="${focusWindowId}"]` : ''}` : null;
            if (selector) root.querySelector(selector)?.focus({preventScroll: true});
        }
        if (state.spotlightOpen) {
            window.requestAnimationFrame(() => {
                const input = document.getElementById('spotlight-input');
                if (input) {
                    input.focus();
                    input.setSelectionRange(input.value.length, input.value.length);
                }
            });
        }
    }

    function updateClock() {
        const clock = document.getElementById('menu-clock');
        if (!clock) return;
        const now = new Date();
        clock.textContent = new Intl.DateTimeFormat('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
    }

    function handleClick(event) {
        const target = event.target;
        if (target.closest('a[data-action]')) event.preventDefault();
        const actionElement = target.closest('[data-action]');
        const iconElement = target.closest('[data-icon-id]');
        if (iconElement && !actionElement) {
            state = { ...state, selectedIcon: iconElement.dataset.iconId };
            if (event.detail >= 2) openApp(iconElement.dataset.iconId);
            else render();
            return;
        }
        if (!actionElement) {
            if (state.openMenu) commit({ ...state, openMenu: null });
            return;
        }
        const action = actionElement.dataset.action;
        if (action === 'toggle-menu') toggleMenu(actionElement.dataset.menu);
        else if (action === 'close-menu') commit({ ...state, openMenu: null });
        else if (action === 'toggle-locale') toggleLocale();
        else if (action === 'toggle-spotlight') commit({ ...state, spotlightOpen: !state.spotlightOpen, openMenu: null });
        else if (action === 'close-spotlight' && target === actionElement) commit({ ...state, spotlightOpen: false });
        else if (action === 'spotlight-result') openApp(actionElement.dataset.appId);
        else if (action === 'open-app') openApp(actionElement.dataset.appId);
        else if (action === 'open-route') navigateTo(actionElement.dataset.route, false);
        else if (action === 'close-window') closeWindow(actionElement.dataset.windowId);
        else if (action === 'minimize-window') minimizeWindow(actionElement.dataset.windowId);
        else if (action === 'maximize-window') toggleMaximize(actionElement.dataset.windowId);
        else if (action === 'minimize-active' && state.activeApp) minimizeWindow(state.activeApp);
        else if (action === 'maximize-active' && state.activeApp) toggleMaximize(state.activeApp);
        else if (action === 'close-active' && state.activeApp) closeWindow(state.activeApp);
        else if (action === 'open-project-detail') openProjectDetail(actionElement.dataset.projectSlug);
        else if (action === 'mobile-back') {
            if (state.mobileApp === 'welcome') markWelcomeSeen();
            if (state.mobileApp === 'projects' && state.projectSlug) openApp('projects');
            else navigateTo('/', false);
        }
        else if (action === 'project-filter') commit({ ...state, projectFilter: actionElement.dataset.filter });
        else if (action === 'resume-section') {
            const container = actionElement.closest('.resume-layout');
            const section = container?.querySelector(`#${actionElement.dataset.sectionId}`);
            container?.querySelectorAll('[data-action="resume-section"]').forEach(button => button.classList.toggle('is-active', button === actionElement));
            if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function handleKeydown(event) {
        const handle = event.target.closest('[data-resize-handle]');
        if (handle && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' '].includes(event.key)) {
            event.preventDefault();
            const id = handle.dataset.windowId, item = state.windows[id], step = event.shiftKey ? 40 : 10;
            if (event.key === 'Enter' || event.key === ' ') toggleMaximize(id);
            else if (!item.isMaximized) {
                const size = {width: item.size.width + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0), height: item.size.height + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0)};
                commit({...state, windows: {...state.windows, [id]: {...item, ...clampWindow({...item, size}, id)}}});
                saveGeometry(); syncUrl(true);
            }
            root.querySelector(`[data-resize-handle][data-window-id="${id}"]`)?.focus();
            return;
        }
        if (state.spotlightOpen && event.key === 'Tab') {
            const focusable = [...root.querySelectorAll('.spotlight-panel input, .spotlight-panel button')];
            const index = focusable.indexOf(document.activeElement);
            event.preventDefault();
            focusable[(index + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length]?.focus();
            return;
        }
        const icon = event.target.closest('[data-icon-id]');
        if (icon && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            openApp(icon.dataset.iconId);
            return;
        }
        if (event.key === 'Escape') {
            if (state.spotlightOpen) { commit({ ...state, spotlightOpen: false }); root.querySelector('[data-action="toggle-spotlight"]')?.focus(); }
            else if (state.openMenu) commit({ ...state, openMenu: null });
            else if (state.activeApp && state.windows[state.activeApp] && state.windows[state.activeApp].isOpen) closeWindow(state.activeApp);
        }
    }

    function handleGlobalKeydown(event) {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            commit({ ...state, spotlightOpen: true, openMenu: null });
        }
    }

    let dragSession = null;
    let resizeSession = null;

    function handlePointerdown(event) {
        const resizeHandle = event.target.closest('[data-resize-handle]');
        if (resizeHandle && event.button === 0 && !isMobileViewport()) {
            const id = resizeHandle.dataset.windowId;
            const item = state.windows[id];
            const windowElement = resizeHandle.closest('.window');
            if (!item || !windowElement || item.isMaximized) return;
            focusApp(id, false);
            windowElement.style.zIndex = String(state.windows[id].zIndex);
            const minimum = { width: 240, height: 240 };
            resizeSession = { id, element: windowElement, startX: event.clientX, startY: event.clientY, originWidth: item.size.width, originHeight: item.size.height, width: item.size.width, height: item.size.height, minimum };
            if (resizeHandle.setPointerCapture) resizeHandle.setPointerCapture(event.pointerId);
            event.preventDefault();
            return;
        }
        const titlebar = event.target.closest('[data-drag-handle]');
        const windowElement = event.target.closest('[data-window-id]');
        if (windowElement && !event.target.closest('button')) {
            focusApp(windowElement.dataset.windowId, false);
            windowElement.style.zIndex = String(state.windows[windowElement.dataset.windowId].zIndex);
            windowElement.classList.add('is-active');
        }
        if (event.target.closest('button, a, input')) return;
        if (!titlebar || event.button !== 0 || isMobileViewport()) return;
        const id = titlebar.dataset.windowId;
        const item = state.windows[id];
        if (!item || item.isMaximized) return;
        const windowElementForDrag = titlebar.closest('.window');
        dragSession = { id, element: windowElementForDrag, startX: event.clientX, startY: event.clientY, originX: item.position.x, originY: item.position.y, x: item.position.x, y: item.position.y };
        if (titlebar.setPointerCapture) titlebar.setPointerCapture(event.pointerId);
    }

    function handlePointermove(event) {
        if (resizeSession) {
            const stage = document.querySelector('.desktop-windows');
            if (!stage) return;
            const item = state.windows[resizeSession.id];
            const maxWidth = Math.max(resizeSession.minimum.width, stage.clientWidth - item.position.x - 12);
            const maxHeight = Math.max(resizeSession.minimum.height, stage.clientHeight - item.position.y - 12);
            resizeSession.width = Math.max(resizeSession.minimum.width, Math.min(maxWidth, resizeSession.originWidth + event.clientX - resizeSession.startX));
            resizeSession.height = Math.max(resizeSession.minimum.height, Math.min(maxHeight, resizeSession.originHeight + event.clientY - resizeSession.startY));
            resizeSession.element.style.width = `${resizeSession.width}px`;
            resizeSession.element.style.height = `${resizeSession.height}px`;
            return;
        }
        if (!dragSession) return;
        const stage = document.querySelector('.desktop-windows');
        if (!stage) return;
        const maxX = Math.max(12, stage.clientWidth - dragSession.element.offsetWidth - 12);
        const maxY = Math.max(12, stage.clientHeight - dragSession.element.offsetHeight - 12);
        dragSession.x = Math.max(12, Math.min(maxX, dragSession.originX + event.clientX - dragSession.startX));
        dragSession.y = Math.max(12, Math.min(maxY, dragSession.originY + event.clientY - dragSession.startY));
        dragSession.element.style.left = `${dragSession.x}px`;
        dragSession.element.style.top = `${dragSession.y}px`;
    }

    function handlePointerup() {
        if (resizeSession) {
            const { id, width, height } = resizeSession;
            const windows = { ...state.windows, [id]: { ...state.windows[id], size: { width, height } } };
            resizeSession = null;
            commit({ ...state, windows });
            saveGeometry();
            syncUrl(true);
            return;
        }
        if (!dragSession) return;
        const { id, x, y } = dragSession;
        const windows = { ...state.windows, [id]: { ...state.windows[id], position: { x, y } } };
        dragSession = null;
        commit({ ...state, windows });
        saveGeometry();
        syncUrl(true);
    }

    root.addEventListener('click', handleClick);
    root.addEventListener('keydown', handleKeydown);
    root.addEventListener('input', (event) => {
        if (event.target.id === 'spotlight-input') {
            state = { ...state, spotlightQuery: event.target.value };
            render();
        }
    });
    root.addEventListener('submit', (event) => {
        const form = event.target.closest('[data-terminal-form]');
        if (!form) return;
        event.preventDefault();
        const input = form.querySelector('input[name="command"]');
        if (!input) return;
        terminal.executeTerminalCommand(input.value);
        window.requestAnimationFrame(() => {
            const nextInput = document.getElementById('terminal-input');
            if (nextInput) nextInput.focus();
        });
    });
    root.addEventListener('pointerdown', handlePointerdown);
    root.addEventListener('pointerup', (event) => {
        const icon = event.target.closest('[data-icon-id]');
        if (icon && event.pointerType === 'touch') openApp(icon.dataset.iconId);
    });
    document.addEventListener('pointermove', handlePointermove);
    document.addEventListener('pointerup', handlePointerup);
    document.addEventListener('keydown', handleGlobalKeydown);
    window.addEventListener('popstate', event => navigateTo(location.pathname, true, event.state?.qweros));
    let lastMobile = isMobileViewport();
    window.addEventListener('resize', () => {
        const nextMobile = isMobileViewport();
        const windows = nextMobile ? state.windows : Object.fromEntries(Object.entries(state.windows).map(([id,item], index) => [id, {...item, ...(lastMobile ? loadGeometry(id, index) : clampWindow(item, id))}]));
        commit({...state, windows});
        if (nextMobile !== lastMobile) {
            lastMobile = nextMobile;
            commit({ ...state, mobileApp: nextMobile ? state.activeApp : null });
        }
    });
    window.addEventListener('qweros-theme-change', event => {
        saveGeometry(event.detail.previous);
        const windows = Object.fromEntries(Object.entries(state.windows).map(([id,item], index) => [id, {...item, ...loadGeometry(id, index)}]));
        commit({...state, windows});
        syncUrl(true);
    });
    window.setInterval(updateClock, 30_000);

    navigateTo(location.pathname, true, history.state?.qweros);
})();
