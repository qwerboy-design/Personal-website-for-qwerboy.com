const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ctx = {window:{}};
vm.runInNewContext(fs.readFileSync('js/content.js','utf8'),ctx);
const projects = ctx.window.QWEROS_CONTENT.projects;
const routes = ['mike', 'about','resume','projects','contact','ai','travel','photos','coffee',...projects.map(p=>'projects/'+p.slug)];
test('all static routes have localized metadata, readable content and resolvable assets', () => {
  for (const locale of ['', 'en/']) for (const route of routes) {
    const filename = `.site-build/${locale}${route ? route+'/' : ''}index.html`;
    const html = fs.readFileSync(filename,'utf8');
    assert.match(html, /<main class="seo-fallback"/);
    const data = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(data['@graph'][1].inLanguage, locale ? 'en' : 'zh-TW');
    assert.equal((html.match(/hreflang=/g)||[]).length,3);
    for(const match of html.matchAll(/(?:src|href)="\/(?!\/)([^"?#]+)(?:[?#][^"]*)?"/g)) {
      const target = `.site-build/${match[1]}`;
      assert.ok(fs.existsSync(target) || fs.existsSync(target+'/index.html'), `Missing ${target}`);
    }
    if(route === 'resume') assert.match(html, /2008\/4/);
    if(route === 'projects') for(const slug of projects.map(p=>p.slug)) assert.ok(html.includes(`/projects/${slug}`));
    if(route === 'contact') assert.match(html,/mailto:qwerboy@gmail.com/);
  }
});
test('artifact includes PDF and crawler files, excludes private drafts and tooling', () => {
  assert.deepEqual(fs.readFileSync('.site-build/assets/downloads/Mike.pdf'),fs.readFileSync('assets/downloads/Mike.pdf'));
  assert.match(fs.readFileSync('.site-build/robots.txt','utf8'),/Sitemap: https:\/\/qwerboy.com\/sitemap.xml/);
  assert.equal((fs.readFileSync('.site-build/sitemap.xml','utf8').match(/<loc>/g)||[]).length,routes.length*2+2);
  for(const directory of ['docs','skills','tests','scripts','.git','assets/.DS_Store','assets/images/.DS_Store','assets/images/ruru-cats']) assert.equal(fs.existsSync(`.site-build/${directory}`),false);
});
test('public login routes include generated wallpaper and localized resume navigation', () => {
  assert.ok(fs.existsSync('.site-build/assets/images/wallpaper-login.png'));
  assert.ok(fs.existsSync('.site-build/assets/images/macos-boot-poster.jpg'));
  assert.ok(fs.existsSync('.site-build/assets/animations/macos-boot-4k.mp4'));
  assert.ok(fs.existsSync('.site-build/assets/animations/macos-boot-4k.webm'));
  assert.ok(fs.existsSync('.site-build/assets/animations/macos-boot-4k.gif'));
  for (const locale of ['', 'en/']) {
    const html = fs.readFileSync(`.site-build/${locale}login/index.html`, 'utf8');
    assert.match(html, /\/assets\/images\/wallpaper-login\.png/);
    assert.match(html, /poster="\/assets\/images\/macos-boot-poster\.jpg"/);
    assert.match(html, /<source src="\/assets\/animations\/macos-boot-4k\.mp4" type="video\/mp4">/);
    assert.match(html, /\/assets\/animations\/macos-boot-4k\.webm/);
    assert.match(html, /data-src="\/assets\/animations\/macos-boot-4k\.gif"/);
    assert.match(html, /id="skip-boot"/);
    assert.match(html, /\/assets\/images\/profile-professional\.jpg/);
    assert.ok(html.includes(`href="/${locale}resume/"`));
    assert.match(html, /route: '\/en\/resume\/'/);
    assert.ok(!html.includes('../../../'));
    if (locale) assert.match(html, /data-lang="en"\]\'\)\.click/);
  }
});
test('company homepage at / and /en/ identifies Qwerboy and links to founder portfolio', () => {
  for (const file of ['.site-build/index.html','.site-build/en/index.html']) {
    const html = fs.readFileSync(file,'utf8');
    assert.match(html, /"@type":"Organization"/);
    assert.match(html, /mailto:mike.liu@qwerboy.com/);
    assert.match(html, /href="\/mike"/);
    for(const match of html.matchAll(/(?:src|href)="\/(?!\/)([^"?#]+)(?:[?#][^"]*)?"/g)) assert.ok(fs.existsSync(`.site-build/${match[1]}`) || fs.existsSync(`.site-build/${match[1]}/index.html`), match[1]);
  }
});
