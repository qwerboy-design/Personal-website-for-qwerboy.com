const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ctx={window:{}};
for(const f of ['content','translations','presentation']) vm.runInNewContext(fs.readFileSync(`js/${f}.js`,'utf8'),ctx);
const content=ctx.window.QWEROS_CONTENT;
const github='https://github.com/qwerboy-design?tab=repositories';
test('LINE leave workflow is bilingual and accurately sourced to reviewed documents',()=>{
 const p=content.projects.find(p=>p.slug==='line-leave-automation');
 assert.ok(p);
 assert.equal(p.evidence.kind,'documentation-review');
 assert.equal(p.demoUrl,null);
 for(const locale of ['zh-TW','en']) {
   assert.ok(p.overview[locale] && p.architecture[locale]);
   assert.equal(p.features[locale].length,3);
   const prefix=locale==='en'?'en/':'';
   const html=fs.readFileSync(`.site-build/${prefix}projects/line-leave-automation/index.html`,'utf8');
   assert.ok(html.includes(p.displayTitle[locale]));
   assert.ok(html.includes(p.evidence.scope[locale]));
 }
});
test('GitHub link sits next to Contact Mike in identity and resume in both languages',()=>{
 assert.equal(content.person.github,github);
 for(const locale of ['zh-TW','en']) {
   const view=ctx.window.QWEROS_PRESENTATION({content,t:k=>content.translations[locale][k],localized:v=>v[locale],escapeHtml:v=>String(v),assetPath:v=>'/'+v,resumeContent:()=>ctx.window.QWEROS_RESUME_LOCALES[locale]});
   for(const html of [view.renderIdentity(),view.renderResume()]) {
     assert.match(html, /class="contact-actions"[\s\S]*?data-app-id="contact"[\s\S]*?<a class="secondary-button"/);
     assert.ok(html.includes(`href="${github}"`));
     assert.ok(html.includes('rel="noopener noreferrer"'));
   }
 }
});
