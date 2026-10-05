const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup(stored, fail = false) {
 const storage = new Map([['qweros-theme',stored]]);
 const document = {documentElement:{dataset:{},style:{}},querySelector:()=>null,addEventListener:()=>{}};
 const window = {localStorage:{getItem:key=>{if(fail)throw Error('blocked');return storage.get(key)},setItem:(k,v)=>{if(fail)throw Error('blocked');storage.set(k,v)}},dispatchEvent:()=>{}};
 const context = {document,window,CustomEvent:class {constructor(name,options){this.name=name;this.detail=options.detail}}};
 vm.runInNewContext(fs.readFileSync('js/themes.js','utf8'), context);
 return {api:window.QWEROS_THEMES,document,storage};
}
test('three themes validate stored values and safely handle unavailable storage',()=>{
 assert.equal(setup('midnight').document.documentElement.dataset.theme,'midnight');
 assert.equal(setup('bogus').document.documentElement.dataset.theme,'ivory');
 assert.equal(setup(null,true).document.documentElement.dataset.theme,'ivory');
 assert.equal(setup('jade').api.normalize('JADE'),'ivory');
});
test('switching updates theme and persistence without navigation',()=>{
 const {api,document,storage}=setup('ivory');
 assert.equal(api.apply('jade'),true);
 assert.equal(document.documentElement.dataset.theme,'jade');
 assert.equal(storage.get('qweros-theme'),'jade');
 assert.equal(api.apply('missing'),false);
 assert.equal(document.documentElement.dataset.theme,'jade');
});
test('stage dimensions allow readable desktop panels in every theme',()=>{
 for(const theme of ['ivory','midnight','jade']) {
  const dims=setup(theme).api.stageDimensions(1440,1024);
  assert.ok(dims.stageWidth >= 970);
  assert.ok(dims.stageHeight >= 820);
 }
 assert.equal(setup('ivory').api.renderSelect('en').match(/<option /g).length,3);
});
