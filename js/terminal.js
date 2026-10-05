(function () {
    'use strict';
    window.QWEROS_TERMINAL = function ({getState, content, t, localized, escapeHtml, resumeContent, appDefinitions, commit, openApp}) {
    function terminalHelpLines() {
        return [
            `${t('commandWhoami')}       whoami`,
            `${t('commandResume')}      resume`,
            `${t('commandExperience')}  experience`,
            `${t('commandSkills')}      skills`,
            `${t('commandProjects')}    projects`,
            `${t('commandHealthcare')}  healthcare`,
            `${t('commandAi')}          ai`,
            `${t('commandTravel')}      travel`,
            `${t('commandCoffee')}      coffee`,
            `${t('commandContact')}     contact`,
            `${t('commandClear')}       clear`,
            `${t('commandOpen')}        open <app>`
        ];
    }

    function executeTerminalCommand(rawCommand) {
        const state = getState();
        const raw = rawCommand.trim();
        if (!raw) return;
        const parts = raw.toLowerCase().split(/\s+/);
        const command = parts[0];
        const argument = parts.slice(1).join(' ');
        const appAliases = { about: 'about', resume: 'resume', experience: 'resume', projects: 'projects', healthcare: 'ai', ai: 'ai', travel: 'travel', photos: 'photos', coffee: 'coffee', contact: 'contact', terminal: 'terminal' };
        const baseLines = [...(state.terminalLines || []), { type: 'command', text: raw }];
        let output = [];
        let appToOpen = null;
        if (command === 'clear') {
            commit({ ...state, terminalLines: [] });
            return;
        }
        if (command === 'help') output = [{ type: 'output', text: `${t('terminalHelp')}\n${terminalHelpLines().join('\n')}` }];
        else if (command === 'whoami') output = [{ type: 'output', text: `${content.person.name}\n${content.person.headline}\n${localized(content.person.title)}` }];
        else if (command === 'resume' || command === 'experience') {
            output = [{ type: 'output', text: resumeContent().experience.map((item) => `${item.period} · ${item.role} · ${item.company}`).join('\n') }];
            appToOpen = command === 'resume' ? 'resume' : null;
        } else if (command === 'skills') output = [{ type: 'output', text: content.skills.map((skill) => `${skill.label}: ${skill.value}`).join('\n') }];
        else if (command === 'projects') output = [{ type: 'output', text: content.projects.map((project) => `${project.slug} — ${project.title}`).join('\n') }];
        else if (command === 'healthcare' || command === 'ai') {
            output = [{ type: 'output', text: `${content.projects.find(p => p.slug === 'healthcare-ai').title}\n${localized(content.projects.find(p => p.slug === 'healthcare-ai').overview)}\n${content.expertise.join(' · ')}` }];
            appToOpen = command === 'ai' ? 'ai' : null;
        } else if (command === 'travel') {
            output = [{ type: 'output', text: content.destinations.map((item) => `${item.name} — ${item.label}`).join('\n') }];
            appToOpen = 'travel';
        } else if (command === 'coffee') {
            output = [{ type: 'output', text: `${content.projects.find(p => p.slug === 'mikes-coffee').title}\n${localized(content.projects.find(p => p.slug === 'mikes-coffee').overview)}` }];
            appToOpen = 'coffee';
        } else if (command === 'contact') {
            output = [{ type: 'output', text: `${content.person.email}\n${content.person.facebook}\n${content.person.blog}` }];
            appToOpen = 'contact';
        } else if (command === 'open') {
            const target = appAliases[argument];
            if (target) {
                output = [{ type: 'output', text: `${state.locale === 'en' ? 'Opening' : '開啟'} ${appDefinitions[target].title}...` }];
                appToOpen = target;
            } else {
                output = [{ type: 'error', text: `${state.locale === 'en' ? 'Usage: open <about|resume|projects|ai|travel|photos|coffee|contact>' : '用法：open <about|resume|projects|ai|travel|photos|coffee|contact>'}` }];
            }
        } else {
            output = [{ type: 'error', text: `${t('commandNotFound')}: ${raw}\n${t('typeHelp')}` }];
        }
        commit({ ...state, terminalLines: [...baseLines, ...output] });
        if (appToOpen) window.setTimeout(() => openApp(appToOpen), 0);
    }

    function renderTerminal() {
        const state = getState();
        const lines = state.terminalLines === null ? [{ type: 'output', text: t('terminalWelcome') }] : state.terminalLines;
        return `<div class="window-content terminal-content"><p class="eyebrow">${t('terminalEyebrow')}</p><h2>${t('terminalTitle')}</h2><p class="window-lead">${t('terminalLead')}</p><div class="terminal-shell"><div class="terminal-output" aria-live="polite">${lines.map((line) => `<div class="terminal-line terminal-line--${escapeHtml(line.type)}"><span class="terminal-prompt" aria-hidden="true">${line.type === 'command' ? 'mike@qwerboy ~ %' : '>'}</span><span>${escapeHtml(line.text)}</span></div>`).join('')}</div><form class="terminal-form" data-terminal-form><label class="sr-only" for="terminal-input">${t('commandPlaceholder')}</label><span class="terminal-prompt" aria-hidden="true">mike@qwerboy ~ %</span><input id="terminal-input" name="command" type="text" autocomplete="off" spellcheck="false" placeholder="${escapeHtml(t('commandPlaceholder'))}"><button class="sr-only" type="submit">Run</button></form></div><p class="terminal-hint">${t('terminalHint')}</p></div>`;
    }

        return {renderTerminal, executeTerminalCommand};
    };
})();
