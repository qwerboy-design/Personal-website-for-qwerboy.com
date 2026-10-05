#!/usr/bin/env node
// Generate crawler/no-JS content from the same content model used by qwerOS.
import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = path.join(root, '.site-build');
const context = { window: {} };
vm.runInNewContext(await readFile(path.join(root, 'js/content.js'), 'utf8'), context);
vm.runInNewContext(await readFile(path.join(root, 'js/translations.js'), 'utf8'), context);
const resumeLocales = context.window.QWEROS_RESUME_LOCALES;
const content = context.window.QWEROS_CONTENT;
if (!content?.person || !content?.projects?.length) throw new Error('Missing portfolio content');
for (const project of content.projects) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug || '')) throw new Error('Invalid project slug');
    if (typeof project.verified !== 'boolean') throw new Error(`Missing verification: ${project.slug}`);
    for (const locale of ['zh-TW', 'en']) {
        if (!Array.isArray(project.features?.[locale]) || !project.evidence?.scope?.[locale]) throw new Error(`Missing localized evidence or capabilities: ${project.slug}`);
    }
    for (const field of ['demoUrl', 'githubUrl']) {
        if (project[field] !== null && !/^https:\/\//.test(project[field])) throw new Error(`Invalid public link: ${project.slug}`);
    }
}
if (new Set(content.projects.map(project => project.slug)).size !== content.projects.length) throw new Error('Duplicate project slug');
if (content.person.resumePdf !== 'assets/downloads/Mike.pdf') throw new Error('Unexpected public resume destination');
const origin = 'https://qwerboy.com';
const locales = ['zh-TW', 'en'];
const routes = ['home', 'about', 'resume', 'projects', 'contact', 'ai', 'travel', 'photos', 'coffee'];
const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const local = (value, locale) => typeof value === 'object' && value !== null && !Array.isArray(value) ? value[locale] ?? value['zh-TW'] ?? value.en ?? '' : value ?? '';
const urlFor = (route, locale) => `${locale === 'en' ? '/en' : ''}${route === 'home' ? '/' : '/' + route}`;
const link = (url, label) => {
    if (!url || !/^(https?:\/\/|mailto:|\/)/.test(url)) return '';
    return `<a href="${escape(url)}">${escape(label)}</a>`;
};
const list = (items, locale) => `<ul>${items.map(item => `<li>${escape(local(item, locale))}</li>`).join('')}</ul>`;
const section = (heading, body) => `<section><h2>${escape(heading)}</h2>${body}</section>`;
function metricList(locale) {
    const en = locale === 'en';
    return `<dl>${content.person.stats.map(stat => `<div><dt>${escape(stat.value)} — ${escape(resumeLocales[locale].metricLabels[stat.label] || local(stat.label, locale))}</dt><dd>${en ? 'Source' : '來源'}: ${escape(resumeLocales[locale].metricSources[stat.source] || local(stat.source, locale))}</dd><dd>${en ? 'Scope' : '範圍'}: ${escape(local(stat.scope, locale))}</dd><dd>${en ? 'Verification' : '查證'}: ${stat.verified ? (en ? 'Verified' : '已查證') : (en ? 'Self-reported; not independently verified' : '自述數據；未經獨立查證')}</dd></div>`).join('')}</dl>`;
}
function projectDetails(project, locale) {
    const t = content.translations[locale];
    return `<article><h2>${escape(local(project.displayTitle || project.title, locale))}</h2><p>${escape(local(project.overview, locale))}</p><p>${t.status}: ${escape(project.status)} · ${project.verified ? (locale === 'en' ? 'Verified' : '已查證') : (locale === 'en' ? 'Not independently verified' : '未經獨立查證')}</p>${['overview', 'problem', 'solution', 'role', 'architecture'].map(key => section(t[key === 'role' ? 'myRole' : key], `<p>${escape(local(project[key], locale))}</p>`)).join('')}${section(t.capabilities, list(local(project.features, locale), locale))}${section(t.techStack, list(project.techStack, locale))}<p>${escape(project.evidence.kind === 'documentation-review' ? t.documentationReviewed : t.sourceReviewed)} · ${escape(project.evidence.checkedAt)} — ${escape(local(project.evidence.scope, locale))}</p><nav>${link(project.demoUrl, locale === 'en' ? 'Demo / service' : '展示／服務入口')}${link(project.githubUrl, 'GitHub')}${link(project.caseStudyUrl?.startsWith('/projects/') ? urlFor(project.caseStudyUrl.slice(1), locale) : project.caseStudyUrl, locale === 'en' ? 'Case study' : '案例研究')}</nav></article>`;
}
function renderContent(route, locale, project) {
    const t = content.translations[locale];
    const p = content.person;
    const resumeContent = resumeLocales[locale];
    const identity = `<p>${escape(local(p.title, locale))}</p><p>${escape(local(p.intro, locale))}</p>`;
    const resume = `${section(t.experience, resumeContent.experience.map(job => `<article><h3>${escape(local(job.role, locale))}</h3><p>${escape(local(job.company, locale))} · ${escape(job.period)}</p>${list(local(job.bullets, locale), locale)}</article>`).join(''))}${section(t.expertise, list(resumeContent.expertise, locale))}${section(t.skills, `<dl>${content.skills.map(skill => `<dt>${escape(resumeContent.skillLabels[skill.label] || local(skill.label, locale))}</dt><dd>${escape(local(skill.value, locale))}</dd>`).join('')}</dl>`)}${section(t.education, `<p>${escape(local(resumeContent.education, locale))}</p>`)}<p>${link('/' + p.resumePdf, t.downloadPdf)}</p>`;
    if (project) return `${projectDetails(project, locale)}<p>${link(urlFor('projects', locale), t.backToProjects)}</p>`;
    switch (route) {
        case 'home': return `${identity}${section(t.expertise, list(resumeContent.expertise, locale))}${section(locale === 'en' ? 'Experience and impact' : '經驗與成果範圍', metricList(locale))}<p>${link(urlFor('projects', locale), t.exploreProjects)} ${link(urlFor('resume', locale), t.viewResume)} ${link(urlFor('contact', locale), t.contactMike)} ${link(p.github, 'GitHub')}</p>`;
        case 'about': return `${identity}<p>${escape(t.aboutLead)}</p>${section(t.expertise, list(resumeContent.expertise, locale))}${section(locale === 'en' ? 'Experience and impact' : '經驗與成果範圍', metricList(locale))}`;
        case 'resume': return `${identity}<p>${escape(t.resumeIntro)}</p>${resume}`;
        case 'projects': return `<p>${escape(t.projectCalloutBody)}</p>${content.projects.map(item => `${projectDetails(item, locale)}<p>${link(urlFor('projects/' + item.slug, locale), t.openDetails)}</p>`).join('')}`;
        case 'contact': return `<p>${escape(t.contactLead)}</p><ul><li>${link('mailto:' + p.email, p.email)}</li><li>${link(p.facebook, 'Facebook')}</li><li>${link(p.blog, t.blog)}</li><li>${link(p.github, 'GitHub')}</li></ul>`;
        case 'ai': return `<p>${escape(t.aiLead)}</p>${section(t.capabilities, list(resumeContent.expertise, locale))}${link(content.projects.find(item => item.slug === 'healthcare-ai')?.demoUrl, t.openHealthcare)}`;
        case 'travel': return `<p>${escape(t.travelLead)}</p>${section(t.featuredTrips, `<ul>${content.destinations.map(place => `<li>${link(place.url, `${local(place.name, locale)} — ${local(place.label, locale)}`)}</li>`).join('')}</ul>`)}${link(p.blog, t.openBlog)}`;
        case 'photos': return `<p>${escape(t.photosLead)}</p>${content.photoAssets.map(photo => `<figure><img src="/${escape(photo.src)}" alt="${escape(local(photo.alt, locale))}" width="480" loading="lazy"><figcaption>${escape(local(photo.title, locale))} — ${escape(local(photo.detail, locale))}</figcaption></figure>`).join('')}`;
        case 'coffee': return `<p>${escape(t.coffeeLead)}</p>${projectDetails(content.projects.find(item => item.slug === 'mikes-coffee'), locale)}`;
        default: throw new Error(`Unsupported route: ${route}`);
    }
}
function renderPage(route, locale, project) {
    const t = content.translations[locale];
    const routeName = project ? `projects/${project.slug}` : route;
    const currentUrl = urlFor(routeName, locale);
    const title = local(project?.displayTitle || project?.title, locale) || (route === 'home' ? `Mike Liu — ${local(content.person.title, locale)}` : t[route]);
    const description = local(project?.overview || (route === 'home' || route === 'about' || route === 'resume' ? content.person.intro : t[route + 'Lead'] || t.projectCalloutBody), locale);
    const person = { '@type': 'Person', '@id': origin + '/#person', name: content.person.name, alternateName: content.person.nameZh, jobTitle: 'Senior Product Manager', url: origin + '/', sameAs: [content.person.facebook, content.person.blog, content.person.github] };
    const page = { '@type': route === 'about' || route === 'resume' ? 'ProfilePage' : route === 'contact' ? 'ContactPage' : route === 'projects' && !project ? 'CollectionPage' : 'WebPage', '@id': origin + currentUrl + '#page', url: origin + currentUrl, name: title, description, inLanguage: locale, about: { '@id': person['@id'] } };
    if (project) page.mainEntity = { '@type': 'CreativeWork', name: title, description: local(project.overview, locale), creator: { '@id': person['@id'] }, url: origin + currentUrl, keywords: project.techStack.join(', ') };
    const jsonld = JSON.stringify({ '@context': 'https://schema.org', '@graph': [person, page] }).replace(/</g, '\\u003c');
    const nav = routes.map(item => link(urlFor(item, locale), item === 'home' ? 'qwerOS' : t[item])).join('\n') + '\n' + link(content.person.github, 'GitHub');
    return `<!DOCTYPE html>
<html lang="${locale}" data-theme="ivory">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#182337">
<meta name="author" content="Mike Liu">
<meta name="robots" content="index, follow">
<title>${escape(title)} | qwerOS</title>
<meta name="description" content="${escape(description)}">
<link rel="canonical" href="${origin}${currentUrl}">
${locales.map(lang => `<link rel="alternate" hreflang="${lang}" href="${origin}${urlFor(routeName, lang)}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${origin}${urlFor(routeName, 'zh-TW')}">
<meta property="og:type" content="website">
<meta property="og:url" content="${origin}${currentUrl}">
<meta property="og:title" content="${escape(title)} | qwerOS">
<meta property="og:description" content="${escape(description)}">
<meta property="og:locale" content="${locale === 'en' ? 'en_US' : 'zh_TW'}">
<meta property="og:image" content="${origin}/assets/images/profile-professional.jpg">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${jsonld}</script>
<link rel="icon" type="image/png" href="/assets/favicon/favicon-32x32.png">
<link rel="apple-touch-icon" href="/assets/favicon/apple-touch-icon.png">
<script src="/js/themes.js"></script>
<link rel="stylesheet" href="/css/style.css?v=qweros-themes">
<link rel="stylesheet" href="/css/themes.css?v=qweros-themes">
</head>
<body data-route="${project ? 'projects' : route}" data-locale="${locale}" data-assets-base="/">
<div id="qweros-root">
<main class="seo-fallback" aria-labelledby="fallback-title">
<p class="eyebrow">qwerOS / ${escape(title)}</p>
<h1 id="fallback-title">${escape(title)}</h1>
<nav aria-label="${locale === 'en' ? 'Language' : '語言'}">${link(urlFor(routeName, 'en'), 'EN')}${link(urlFor(routeName, 'zh-TW'), 'TW')}</nav>
${renderContent(route, locale, project)}
<nav aria-label="${locale === 'en' ? 'Primary navigation' : '主要導覽'}">${nav}</nav>
</main>
</div>
<noscript><p class="noscript-note">${locale === 'en' ? 'All portfolio content is available above. Enable JavaScript to use the interactive qwerOS desktop.' : '以上作品集內容可直接閱讀。啟用 JavaScript 可使用互動 qwerOS 桌面。'}</p></noscript>
<script src="/js/content.js"></script>
<script src="/js/translations.js"></script>
<script src="/js/window-state.js"></script>
<script src="/js/terminal.js"></script>
<script src="/js/presentation.js"></script>
<script src="/js/projects.js"></script>
<script src="/js/script.js"></script>
</body>
</html>
`;
}

await rm(buildDir, { recursive: true, force: true });
await mkdir(buildDir, { recursive: true });
const allRoutes = routes.concat(content.projects.map(project => 'projects/' + project.slug));
for (const locale of locales) {
    for (const route of allRoutes) {
        const project = content.projects.find(item => 'projects/' + item.slug === route);
        const html = renderPage(project ? 'projects' : route, locale, project);
        const file = path.join(urlFor(route, locale).slice(1), 'index.html');
        for (const directory of [root, buildDir]) {
            const destination = path.join(directory, file);
            await mkdir(path.dirname(destination), { recursive: true });
            await writeFile(destination, html);
        }
    }
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${allRoutes.flatMap(route => locales.map(locale => `<url><loc>${origin}${urlFor(route, locale)}</loc>${locales.map(lang => `<xhtml:link rel="alternate" hreflang="${lang}" href="${origin}${urlFor(route, lang)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${origin}${urlFor(route, 'zh-TW')}"/></url>`)).join('\n')}\n</urlset>\n`;
const robots = `User-agent: *\nAllow: /\nDisallow: /docs/\nDisallow: /skills/\nSitemap: ${origin}/sitemap.xml\n`;
for (const directory of [root, buildDir]) {
    await writeFile(path.join(directory, 'sitemap.xml'), sitemap);
    await writeFile(path.join(directory, 'robots.txt'), robots);
}
await mkdir(path.join(root, 'assets/downloads'), { recursive: true });
// The reviewed public resume is the source; private job-application files are not build inputs.
const publicResume = await readFile(path.join(root, content.person.resumePdf));
if (!publicResume.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error('Invalid public resume PDF');
const loginTemplate = (await readFile(path.join(root, 'docs/design/macos-login-preview/index.html'), 'utf8'))
    .replaceAll("'./wallpaper.png'", "'/assets/images/wallpaper-login.png'")
    .replaceAll('../../../', '/');
for (const locale of locales) {
    const html = locale === 'en'
        ? loginTemplate.replace('<html lang="zh-TW">', '<html lang="en">')
            .replace('<title>Mike Liu · qwerOS 登入預覽</title>', '<title>Mike Liu · qwerOS Login Preview</title>')
            .replace('href="/resume/" id="login"', 'href="/en/resume/" id="login"')
            .replace('<span id="login-label">登入</span>', '<span id="login-label">Log in</span>')
            .replace('id="hint">點選登入，探索我的履歷', 'id="hint">Log in to explore my résumé')
            .replace('id="footer">歡迎來到 Mike 的個人工作空間', 'id="footer">Welcome to Mike’s personal workspace')
            .replace('alt="Mike Liu 的照片"', 'alt="Portrait of Mike Liu"')
            .replace('    updateClock();\n    setInterval', '    document.querySelector(\'[data-lang="en"]\').click();\n    updateClock();\n    setInterval')
        : loginTemplate;
    for (const directory of [root, buildDir]) {
        const destination = path.join(directory, locale === 'en' ? 'en/login/index.html' : 'login/index.html');
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, html);
    }
}
// Public deployment allowlist. Never upload the repository root or job application documents.
const publicAssets = [...new Set([content.person.resumePdf, 'assets/images/wallpaper-login.png', 'assets/images/profile-professional.jpg', 'assets/favicon/favicon-32x32.png', 'assets/favicon/apple-touch-icon.png', ...content.photoAssets.map(photo => photo.src), ...['ivory','midnight','jade'].map(theme => `assets/images/wallpaper-${theme}.png`)])];
for (const asset of publicAssets) {
    if (!/^assets\/(?:images|favicon|downloads)\/[a-zA-Z0-9_-]+\.(?:png|jpg|pdf)$/.test(asset)) throw new Error(`Unexpected public asset: ${asset}`);
    await mkdir(path.dirname(path.join(buildDir, asset)), {recursive: true});
    await cp(path.join(root, asset), path.join(buildDir, asset));
}
await cp(path.join(root, 'assets/icons'), path.join(buildDir, 'assets/icons'), {recursive: true, filter: source => !path.basename(source).startsWith('.')});
for (const directory of ['css', 'js']) await cp(path.join(root, directory), path.join(buildDir, directory), { recursive: true, filter: source => !path.basename(source).startsWith('.') });
await cp(path.join(root, 'CNAME'), path.join(buildDir, 'CNAME'));
await writeFile(path.join(buildDir, '.nojekyll'), '');
console.log(`Generated ${allRoutes.length * locales.length} localized pages and public deployment artifact: ${buildDir}`);
