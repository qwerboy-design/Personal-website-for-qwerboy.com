(function () {
    'use strict';
    const themes = ['ivory', 'midnight', 'jade'];
    const normalize = value => themes.includes(value) ? value : 'ivory';
    function read() {
        try { return normalize(window.localStorage.getItem('qweros-theme')); }
        catch (_) { return 'ivory'; }
    }
    function apply(value, notify = true) {
        if (!themes.includes(value)) return false;
        const previous = document.documentElement.dataset.theme;
        document.documentElement.dataset.theme = value;
        document.documentElement.style.colorScheme = value === 'midnight' ? 'dark' : 'light';
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', {ivory: '#c8dff2', midnight: '#141b31', jade: '#c4dfd4'}[value]);
        try { window.localStorage.setItem('qweros-theme', value); } catch (_) { /* Optional storage. */ }
        if (notify && previous !== value) window.dispatchEvent(new CustomEvent('qweros-theme-change', {detail: {previous, theme: value}}));
        return true;
    }
    function stageDimensions(width, height) {
        const theme = document.documentElement.dataset.theme;
        const compact = width < 1200;
        const left = theme === 'midnight' ? (compact ? 24 : 80) : theme === 'jade' ? (compact ? 294 : 400) : (compact ? 274 : 324);
        return {stageWidth: Math.max(240, width - left - (theme === 'midnight' && !compact ? 80 : 24)), stageHeight: Math.max(240, height - 164)};
    }
    function renderSelect(locale) {
        const current = document.documentElement.dataset.theme;
        return `<label class="theme-switcher"><img src="/assets/icons/palette.svg" alt="" aria-hidden="true"><span class="sr-only">${locale === 'en' ? 'Appearance' : '外觀風格'}</span><select id="theme-select" data-theme-select aria-label="${locale === 'en' ? 'Appearance' : '外觀風格'}">${themes.map((theme, i) => `<option value="${theme}" ${current === theme ? 'selected' : ''}>${['Ivory', 'Midnight', 'Jade'][i]}</option>`).join('')}</select></label>`;
    }
    window.QWEROS_THEMES = {themes, normalize, read, apply, stageDimensions, renderSelect};
    apply(read(), false);
    document.addEventListener('change', event => {
        if (event.target.matches?.('[data-theme-select]')) apply(event.target.value);
    });
})();
