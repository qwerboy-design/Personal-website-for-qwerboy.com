const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ctx={window:{}};
for (const file of ['content','projects']) vm.runInNewContext(fs.readFileSync(`js/${file}.js`,'utf8'),ctx);
const content=ctx.window.QWEROS_CONTENT;
function renderer(locale,state) {
  return ctx.window.QWEROS_PROJECTS({content,getState:()=>state,t:key=>content.translations[locale][key]||key,localized:v=>typeof v==='object' ? v[locale] : v,escapeHtml:v=>String(v??'').replace(/[<>&"]/g,'_'),icon:()=>'<img alt="">'});
}
test('catalog renders every scanned product and filters categories',()=>{
  for(const locale of ['zh-TW','en']) {
    const state={projectFilter:'all',projectSlug:null};
    const view=renderer(locale,state);
    const html=view.renderProjects();
    assert.equal((html.match(/class="project-card"/g)||[]).length,content.projects.length);
    for(const p of content.projects) assert.ok(html.includes(p.displayTitle?.[locale] || p.title));
    assert.ok(!html.includes('href="null"'));
    assert.ok(!html.includes('undefined'));
    state.projectFilter='Creative Tools';
    assert.equal((view.renderProjects().match(/class="project-card"/g)||[]).length,2);
  }
});
test('local-only detail has capabilities and evidence, with no invented demo',()=>{
  for(const locale of ['zh-TW','en']) for(const p of content.projects) {
    const html=renderer(locale,{projectSlug:p.slug}).renderProjectDetail();
    assert.ok(html.includes(p.overview[locale]));
    for(const feature of p.features[locale]) assert.ok(html.includes(feature));
    assert.ok(html.includes(p.evidence.scope[locale]));
    assert.ok(!html.includes('href="null"')&&!html.includes('undefined'));
    if(!p.demoUrl) assert.ok(!html.includes('class="primary-button"'));
  }
});
