const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync('js/content.js','utf8'),context);
const projects = context.window.QWEROS_CONTENT.projects;
test('priority projects appear first in Mike-requested order',()=>{
  assert.deepEqual(Array.from(projects.slice(0,4), p=>p.slug), ['line-leave-automation','likegrok','flightbot','healthcare-ai']);
});
test('portfolio represents scanned products with bilingual capabilities and source review scope',()=>{
  for (const slug of ['healthcare-ai','mikes-coffee','edm-platform','mike-wiki','ig-threads','likegrok','flightbot','likeroom','flight-mike','qweros','imageconvert']) {
    const p = projects.find(item=>item.slug===slug);
    assert.ok(p,`Missing scanned product ${slug}`);
    for (const locale of ['zh-TW','en']) {
      for (const key of ['overview','problem','solution','role','architecture']) assert.ok(p[key]?.[locale],`${slug} ${key} ${locale}`);
      assert.ok(p.features?.[locale]?.length>=3,`${slug} capabilities ${locale}`);
      assert.ok(p.evidence?.scope?.[locale]);
    }
    assert.equal(p.evidence.kind,'source-review');
    assert.equal(p.verified,false);
    assert.equal(p.caseStudyUrl,`/projects/${slug}`);
  }
});
test('unknown public links stay null and published content excludes local file paths',()=>{
  for (const p of projects) {
    for(const key of ['demoUrl','githubUrl']) assert.ok(p[key]===null || /^https:\/\//.test(p[key]),`${p.slug} ${key}`);
    assert.ok(!JSON.stringify(p).includes('/Volumes/'));
    assert.ok(!JSON.stringify(p).includes('/Users/'));
  }
});

test('Gemini is removed from content, routes, and sitemap',()=>{
  assert.equal(projects.length,12);
  assert.equal(projects.some(p=>p.slug==='gemini-fintech'),false);
  assert.equal(fs.existsSync('projects/gemini-fintech/index.html'),false);
  assert.equal(fs.existsSync('en/projects/gemini-fintech/index.html'),false);
  assert.ok(!fs.readFileSync('.site-build/sitemap.xml','utf8').includes('gemini-fintech'));
});
