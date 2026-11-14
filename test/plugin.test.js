import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { apply as hostApply } from '../src/index.js';

test('host half has no privileged operations', () => assert.doesNotThrow(() => hostApply({})));
test('built bundle registers lazily and attaches to the documented composer slot', () => {
  let definition;
  runInNewContext(readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8'), { window: { __ModuleLoader__: { load(value) { definition = value; } } } });
  const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(definition.id, manifest.name);
  assert.ok(readFileSync(new URL('../cordis.patch.yml', import.meta.url), 'utf8').includes(`name: '${manifest.name}'`));
  const plugin = definition.factory(name => {
    assert.ok(['react', 'react-dom'].includes(name));
    return name === 'react' ? { createElement() {}, useState() {}, useRef() {}, useEffect() {} } : { createPortal() {} };
  });
  let registration;
  plugin.apply({ slots: {
    inject(name, callback) { assert.equal(name, 'conversation.input.dock'); return callback(); },
    register(options, component) { registration = { options, component }; },
  } });
  assert.equal(registration.options.id, 'idea-mutator');
  assert.equal(typeof registration.component, 'function');
});

function createDock(actions) {
  let definition;
  let messageListener;
  const refs = [];
  const replies = [];
  const frameWindow = { postMessage(message) { replies.push(message); } };
  const React = {
    createElement(type, props, ...children) { return { type, props, children }; },
    useState(initial) { return [initial, () => {}]; },
    useRef(initial) { const ref = { current: initial }; refs.push(ref); return ref; },
    useEffect(callback) { callback(); },
  };
  runInNewContext(readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8'), { window: { __ModuleLoader__: { load(value) { definition = value; } } } });
  // The factory closes over the main realm, so give that realm the message API.
  const window = {
    __ModuleLoader__: { load(value) { definition = value; } },
    addEventListener(type, listener) { assert.equal(type, 'message'); messageListener = listener; },
    removeEventListener() {},
  };
  runInNewContext(readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8'), { window });
  const plugin = definition.factory(name => name === 'react' ? React : { createPortal() {} });
  let component;
  plugin.apply({ slots: { inject(name, callback) { callback(); }, register(options, entry) { component = entry; } } });
  const rendered = component({ inputActions: actions, sessionId: 'session-a' });
  rendered.children[0].props.onClick();
  refs[1].current = { contentWindow: frameWindow };
  return { refs, replies, receive: data => messageListener({ source: frameWindow, data: { source: 'idea-mutator', ...data } }), foreign: data => messageListener({ source: {}, data: { source: 'idea-mutator', ...data } }) };
}

test('DSH handoff inserts a revision-guarded draft and never submits it', () => {
  const span = { start: 12, end: 12, draftRev: 4 };
  const calls = [];
  let persisted = false;
  const dock = createDock({
    captureInsertion: () => span,
    insertText(text, target) { calls.push({ text, target }); return true; },
    persistDraft() { persisted = true; },
    submit() { throw new Error('Must not auto-submit'); },
  });
  dock.receive({ type: 'ready' });
  assert.equal(dock.replies[0].canInsert, true);
  dock.foreign({ type: 'insert-prompt', text: 'foreign message' });
  assert.equal(calls.length, 0);
  dock.receive({ type: 'insert-prompt', id: 'request-a', text: 'edited plan prompt' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].text, 'edited plan prompt');
  assert.equal(calls[0].target, span);
  assert.equal(persisted, true);
  assert.equal(dock.replies.at(-1).ok, true);
});

test('DSH handoff refuses a stale draft, a different session, and oversized input', () => {
  let calls = 0;
  const dock = createDock({ captureInsertion: () => ({ start: 0, end: 0, draftRev: 1 }), insertText() { calls++; return false; } });
  dock.receive({ type: 'insert-prompt', id: 'stale', text: 'prompt' });
  assert.equal(dock.replies.at(-1).ok, false);
  assert.equal(calls, 1);
  dock.refs[5].current = 'session-b';
  dock.receive({ type: 'insert-prompt', id: 'switched', text: 'prompt' });
  assert.equal(calls, 1);
  assert.equal(dock.replies.at(-1).ok, false);
  dock.refs[5].current = 'session-a';
  dock.receive({ type: 'insert-prompt', id: 'too-long', text: 'x'.repeat(70001) });
  assert.equal(calls, 1);
  assert.equal(dock.replies.at(-1).ok, false);
});
