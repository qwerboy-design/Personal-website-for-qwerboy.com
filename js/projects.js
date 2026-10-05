(function () {
    'use strict';
    window.QWEROS_PROJECTS = function ({content, getState, t, localized, escapeHtml, icon}) {
        const filterLabel = filter => t({all: 'allProjects', Featured: 'featured', 'AI Projects': 'aiProjects', Healthcare: 'healthcare', 'Full Stack': 'fullStack', 'Content Platforms': 'contentPlatforms', 'Creative Tools': 'creativeTools', Travel: 'travel'}[filter] || filter);
        const statusLabel = project => t({active: 'statusActive', development: 'statusDevelopment', prototype: 'statusPrototype', completed: 'statusCompleted'}[project.status] || 'statusPrototype');
        const projectIcon = project => icon(project.slug === 'healthcare-ai' ? 'ai' : project.slug === 'mikes-coffee' ? 'coffee' : project.category.includes('Travel') ? 'travel' : project.category.includes('Creative Tools') ? 'photos' : 'projects');
        const features = project => `<ul class="project-features">${localized(project.features).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
        function links(project, primary = false) {
            const cls = primary ? 'primary-button' : 'text-link';
            return `${project.demoUrl ? `<a class="${cls}" href="${escapeHtml(project.demoUrl)}" target="_blank" rel="noopener noreferrer">${t('openExternal')} ↗</a>` : ''}${project.githubUrl ? `<a class="text-link" href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>` : ''}`;
        }
        function renderProjects() {
            const state = getState();
            if (state.projectSlug) return renderProjectDetail();
            const filter = state.projectFilter;
            const projects = content.projects.filter(project => filter === 'all' || project.category.includes(filter));
            const filters = ['all', 'Featured', 'AI Projects', 'Healthcare', 'Full Stack', 'Content Platforms', 'Creative Tools', 'Travel'];
            return `<div class="projects-layout"><aside class="projects-sidebar" aria-label="Project categories"><h2>${t('finder')}</h2>${filters.map(item => `<button class="project-filter ${filter === item ? 'is-active' : ''}" data-action="project-filter" data-filter="${escapeHtml(item)}">${escapeHtml(filterLabel(item))}</button>`).join('')}</aside>
                <section class="projects-main"><div class="projects-toolbar"><div><p class="eyebrow">${t('portfolioProjects')}</p><h2>${escapeHtml(filterLabel(filter))}</h2></div><span>${projects.length} ${projects.length === 1 ? t('item') : t('items')}</span></div>
                ${projects.length ? `<div class="project-grid">${projects.map(project => `<article class="project-card"><div class="project-card-header"><span class="project-icon" aria-hidden="true">${projectIcon(project)}</span><span class="project-status">${statusLabel(project)}</span></div><h3>${escapeHtml(localized(project.displayTitle || project.title))}</h3><p>${escapeHtml(localized(project.overview))}</p>${features(project)}<ul class="project-tags">${project.techStack.map(tag => `<li class="project-tag">${escapeHtml(tag)}</li>`).join('')}</ul><div class="project-card-actions"><button class="text-link" data-action="open-project-detail" data-project-slug="${escapeHtml(project.slug)}">${t('openDetails')} →</button>${links(project)}</div></article>`).join('')}</div>` : `<div class="empty-state">${t('noProjects')}</div>`}
                <div class="feature-callout"><h3>${t('projectCalloutTitle')}</h3><p>${t('projectCalloutBody')}</p></div></section></div>`;
        }
        function renderProjectDetail() {
            const project = content.projects.find(item => item.slug === getState().projectSlug);
            if (!project) return `<div class="window-content"><div class="empty-state">${t('noProjects')}</div></div>`;
            const sections = [['problem','problem'], ['solution','solution'], ['role','myRole'], ['architecture','architecture']];
            return `<div class="window-content project-detail-content"><div class="project-detail-hero"><div><p class="eyebrow">${escapeHtml(project.category.map(filterLabel).join(' / '))}</p><h2>${escapeHtml(localized(project.displayTitle || project.title))}</h2><p class="window-lead">${escapeHtml(localized(project.overview))}</p></div><span class="project-detail-icon" aria-hidden="true">${projectIcon(project)}</span></div>
                <div class="project-detail-meta"><span>${t('status')}: ${statusLabel(project)}</span><span>${t(project.evidence.kind === 'documentation-review' ? 'documentationReviewed' : 'sourceReviewed')} · ${escapeHtml(project.evidence.checkedAt)}</span><span>${t('techStack')}: ${escapeHtml(project.techStack.join(' · '))}</span></div>
                <section><h3>${t('capabilities')}</h3>${features(project)}</section><div class="project-detail-sections">${sections.map(([field,label]) => `<section><h3>${t(label)}</h3><p>${escapeHtml(localized(project[field]))}</p></section>`).join('')}</div>
                <p class="project-evidence">${escapeHtml(localized(project.evidence.scope))}</p><div class="window-actions">${links(project,true)}<button class="secondary-button" data-action="open-app" data-app-id="projects">${t('backToProjects')}</button></div></div>`;
        }
        return {renderProjects, renderProjectDetail};
    };
})();
