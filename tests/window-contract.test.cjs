const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const contentContext = { window: {} };
vm.runInNewContext(fs.readFileSync('js/content.js', 'utf8'), contentContext);
const content = contentContext.window.QWEROS_CONTENT;
test('metrics and projects carry evidence and distinct links', () => {
  for (const metric of content.person.stats) {
    assert.ok(metric.source && metric.scope);
    assert.equal(typeof metric.verified, 'boolean');
  }
  for (const project of content.projects) {
    assert.ok(project.slug && project.caseStudyUrl);
    assert.equal(typeof project.verified, 'boolean');
    assert.ok('demoUrl' in project && 'githubUrl' in project);
    assert.ok(!('id' in project) && !('url' in project));
  }
});
const code = fs.readFileSync('js/window-state.js', 'utf8');
const context = { window: {} };
vm.runInNewContext(code, context);
const api = context.window.QWEROS_WINDOW_STATE;
test('routes parse locale and project with malformed/unknown paths rejected', () => {
  assert.equal(api.parseRoute('/en/projects/healthcare-ai/', ['healthcare-ai']).app, 'projects');
  assert.equal(api.parseRoute('/en/projects/healthcare-ai/', ['healthcare-ai']).locale, 'en');
  assert.equal(api.parseRoute('/projects/%zz', []).projectSlug, null);
  assert.equal(api.parseRoute('/projects/missing', []).known, false);
});
test('geometry clamps corrupt storage and small viewports', () => {
  const result = api.clampGeometry({ position: {x: 99999, y: -100}, size: { width: 9999, height: 9999 } }, {width: 800, height: 600});
  assert.ok(result.size.width <= 776 && result.size.height <= 464);
  assert.ok(result.position.x >= 12 && result.position.y >= 12);
  assert.ok(result.position.x + result.size.width <= 788);
  const fallback = api.clampGeometry({ position: {x: null, y: 'bad'}, size: {width: Infinity, height: -1} }, {width: 1024, height: 768});
  assert.ok(Number.isFinite(fallback.size.width) && fallback.size.height >= 240);
});
test('fallback chooses most recently focused visible window', () => {
  assert.equal(api.topVisible({ about: {id:'about',isOpen:true,zIndex:21}, projects: {id:'projects',isOpen:true,zIndex:40}, resume: {id:'resume',isOpen:true,isMinimized:true,zIndex:99} }), 'projects');
});
test('project panels restore a readable minimum without exceeding the stage', () => {
  const result=api.clampGeometry({size:{width:318,height:500}}, {width:1440,height:1024,stageWidth:1280,stageHeight:860,minWidth:680});
  assert.equal(result.size.width,680);
  const compact=api.clampGeometry({size:{width:318,height:500}}, {width:800,height:800,stageWidth:500,stageHeight:636,minWidth:680});
  assert.equal(compact.size.width,476);
});
