const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '../docs/design/macos-login-preview/index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];

function createBoot({ supported = true, mp4 = supported, webm = supported, playbackFailure = false } = {}) {
  const classes = new Set();
  const timers = [];
  const storage = new Map();
  function element(hidden = false) {
    const listeners = new Map();
    return {
      hidden, dataset: {}, attributes: {},
      addEventListener(name, callback) {
        listeners.set(name, [...(listeners.get(name) || []), callback]);
      },
      dispatch(name) {
        for (const callback of listeners.get(name) || []) callback({ type: name });
        if (typeof this[`on${name}`] === 'function') this[`on${name}`]({ type: name });
      },
      setAttribute(name, value) { this.attributes[name] = value; },
      removeAttribute(name) { delete this.attributes[name]; },
      pause() { this.paused = true; },
      play() {
        this.played = true;
        return playbackFailure ? Promise.reject(new Error('Unsupported media')) : Promise.resolve();
      },
      canPlayType(type) { return (type === 'video/mp4' ? mp4 : webm) ? 'probably' : ''; }
    };
  }
  const ids = Object.fromEntries([
    'date', 'time', 'login-label', 'login', 'hint', 'footer',
    'boot-overlay', 'boot-video', 'boot-gif-fallback', 'skip-boot'
  ].map(id => [id, element(id === 'boot-gif-fallback')]));
  ids['boot-gif-fallback'].dataset.src = '/assets/animations/macos-boot-4k.gif';
  const sources = [element(), element()];
  ids['boot-video'].querySelectorAll = () => sources;
  const context = {
    document: {
      documentElement: {},
      body: { classList: { add: name => classes.add(name), remove: name => classes.delete(name) } },
      getElementById: id => ids[id],
      querySelectorAll: () => []
    },
    window: {
      location: { search: '' },
      matchMedia: () => ({ matches: false }),
      setTimeout: callback => timers.push(callback)
    },
    sessionStorage: {
      getItem: key => storage.get(key),
      setItem: (key, value) => storage.set(key, value),
      removeItem: key => storage.delete(key)
    },
    URLSearchParams, Date, Intl, setInterval() {}
  };
  vm.runInNewContext(script, context);
  return { video: ids['boot-video'], gif: ids['boot-gif-fallback'], skip: ids['skip-boot'], classes, timers, sources };
}

test('a video decoder error starts the GIF fallback', () => {
  const { video, gif } = createBoot();
  video.dispatch('error');
  assert.equal(video.hidden, true);
  assert.equal(gif.src, gif.dataset.src);
});

test('Safari can play the MP4 source without entering GIF fallback', () => {
  const { video, gif } = createBoot({ mp4: true, webm: false });
  assert.equal(video.played, true);
  assert.equal(video.hidden, false);
  assert.equal(gif.hidden, true);
  assert.equal(gif.src, undefined);
  assert.match(html, /<source\s+src="\/assets\/animations\/[^"\s]+\.mp4"\s+type="video\/mp4"/);
});

test('WebM remains usable when MP4 is unsupported', () => {
  const { video, gif } = createBoot({ mp4: false, webm: true });
  assert.equal(video.played, true);
  assert.equal(gif.hidden, true);
  assert.equal(gif.src, undefined);
});

test('a rejected playback attempt starts the hidden GIF fallback', async () => {
  const { video, gif } = createBoot({ playbackFailure: true });
  await Promise.resolve();
  assert.equal(video.hidden, true);
  assert.equal(gif.src, gif.dataset.src);
  assert.equal(gif.hidden, true);
});

test('a playback rejection after skipping cannot start a fallback', async () => {
  const { gif, skip } = createBoot({ playbackFailure: true });
  skip.dispatch('click');
  await Promise.resolve();
  assert.equal(gif.src, undefined);
  assert.equal(gif.hidden, true);
});

test('unsupported video leaves the GIF hidden until its load succeeds', () => {
  const { video, gif } = createBoot({ supported: false });
  assert.equal(video.hidden, true);
  assert.equal(gif.src, gif.dataset.src);
  assert.equal(gif.hidden, true, 'Safari must never draw an unloaded image box');
  gif.dispatch('load');
  assert.equal(gif.hidden, false);
});

test('a GIF load failure retains only the poster overlay', () => {
  const { video, gif, classes } = createBoot({ supported: false });
  gif.dispatch('error');
  assert.equal(video.hidden, true);
  assert.equal(gif.hidden, true);
  assert.equal(classes.has('boot-enabled'), true);
  assert.match(declarationsFor('.boot-overlay'), /background:[^;]*macos-boot-poster\.jpg/);
});

test('a late GIF load after skipping cannot restore the image', () => {
  const { gif, skip, classes } = createBoot({ supported: false });
  skip.dispatch('click');
  gif.dispatch('load');
  assert.equal(gif.hidden, true);
  assert.equal(classes.has('boot-enabled'), false);
});

test('a late video error after boot completion cannot start another fallback', () => {
  const { video, gif, timers } = createBoot();
  timers[0]();
  video.dispatch('error');
  assert.equal(gif.hidden, true);
  assert.equal(gif.src, undefined);
});

function declarationsFor(selector) {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selectors]) => selectors.split(',').some(value => value.trim() === selector))
    .map(([, , declarations]) => declarations).join(';');
}

test('both media layers occupy the overlay without creating a second grid row', () => {
  for (const selector of ['.boot-overlay video', '.boot-overlay .boot-fallback']) {
    const declarations = declarationsFor(selector);
    assert.match(declarations, /position:\s*absolute\b/, selector);
    assert.match(declarations, /inset:\s*0\s*[;}]/, selector);
  }
});

test('hidden video and GIF layers are removed from layout explicitly', () => {
  for (const selectors of [
    ['.boot-overlay video[hidden]', '#boot-video[hidden]'],
    ['.boot-overlay .boot-fallback[hidden]', '.boot-fallback[hidden]', '#boot-gif-fallback[hidden]']
  ]) {
    assert.match(selectors.map(declarationsFor).join(';'), /display:\s*none\b/);
  }
});

test('exhausted source elements start fallback even without a video error', () => {
  const { video, gif, sources } = createBoot();
  sources[0].dispatch('error');
  sources[0].dispatch('error');
  assert.equal(video.hidden, false);
  sources[1].dispatch('error');
  assert.equal(video.hidden, true);
  assert.equal(gif.src, gif.dataset.src);
  assert.equal(gif.hidden, true);
});
