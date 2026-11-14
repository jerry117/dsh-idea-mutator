import test from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, drawCards, generatePlan, toMarkdown, toPrompt, normalizeHistory, validateIdea } from '../src/engine.js';

test('drawing preserves valid locks without repeating cards, across all strengths', () => {
  for (const count of [1, 2, 3]) {
    for (let trial = 0; trial < 100; trial++) {
      const cards = drawCards(count, ['game', 'game', 'unknown']);
      assert.equal(cards.length, count);
      assert.equal(new Set(cards).size, count);
      assert.equal(cards[0], 'game');
      assert.ok(cards.every(id => CARDS.some(card => card.id === id)));
    }
  }
});
test('empty and oversized ideas do not become a document', () => {
  assert.throws(() => validateIdea(' \n '));
  assert.throws(() => generatePlan('a'.repeat(1601), ['game']));
  assert.throws(() => generatePlan('小游戏', ['unknown']));
  assert.equal(validateIdea(' 想法 '), '想法');
});
test('each card makes a distinct draft with its own experiment and measurable outcome', () => {
  const drafts = CARDS.map(card => generatePlan('帮朋友改善小游戏体验', [card.id]));
  assert.equal(new Set(drafts.map(plan => plan.sections[1].value)).size, CARDS.length);
  for (const plan of drafts) {
    assert.equal(plan.sections.length, 5);
    assert.ok(plan.sections.every(section => section.value.length > 10));
    assert.equal(plan.idea, '帮朋友改善小游戏体验');
    assert.equal(plan.origin, 'rules');
  }
});
test('a combined draft keeps every constraint and clearly chooses a primary mechanism', () => {
  const plan = generatePlan('一款小游戏', ['game', 'budget', 'reverse', 'game']);
  assert.deepEqual(plan.cardIds, ['game', 'budget', 'reverse']);
  for (const id of plan.cardIds) assert.ok(plan.sections[0].value.includes(CARDS.find(card => card.id === id).rule));
  assert.ok(plan.sections[0].value.includes('出现冲突时'));
});
test('Markdown export and DSH handoff use edited title and section text', () => {
  const plan = generatePlan('我想做一个工具', ['tiny']);
  plan.title = '我编辑后的标题';
  plan.sections[1].value = '只验证自己真正想做的那一步';
  assert.ok(toMarkdown(plan).startsWith('# 我编辑后的标题'));
  assert.ok(toPrompt(plan).includes('只验证自己真正想做的那一步'));
  assert.ok(toPrompt(plan).includes('尚未经过事实验证'));
  assert.ok(toPrompt(plan).includes('不执行部署'));
});
test('storage recovery rejects malformed data and duplicates, keeping edits bounded', () => {
  const plan = generatePlan('一个点子', ['game']);
  plan.saved = true;
  const restored = normalizeHistory([null, {}, { ...plan, id: 'bad', sections: [] }, plan, plan]);
  assert.equal(restored.length, 1);
  assert.equal(restored[0].saved, true);
  assert.deepEqual(restored[0].sections, plan.sections);
  assert.deepEqual(normalizeHistory({}), []);
  assert.deepEqual(normalizeHistory([{ ...plan, cardIds: ['fake'] }]), []);
});
