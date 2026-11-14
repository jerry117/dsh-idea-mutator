export const CARDS = [
  { id: 'reverse', name: '反着做', en: 'REVERSE IT', mark: '↶', color: 'purple', tag: '打破惯性', desc: '如果把最理所当然的规则反过来？', rule: '反转一个核心假设，保留用户真正想要的结果。', angle: '让用户先看到结果，再决定要不要投入', experiment: '做两个入口：一个沿用原流程，一个先展示可体验的结果，各邀请 5 人尝试', metric: '记录首次获得价值所需时间，以及愿意继续的人数', risk: '反转后可能失去原有体验中必要的解释与信任' },
  { id: 'budget', name: '预算砍九成', en: 'LESS IS MORE', mark: '−90%', color: 'orange', tag: '极限约束', desc: '只剩十分之一预算，什么值得留下？', rule: '预算和功能都缩到十分之一，只保留一个价值闭环。', angle: '用一个页面和一次手动交付，验证最核心的需求', experiment: '删掉登录、积分和复杂后台，先用表单或可点击原型为 3 人完成一次交付', metric: '记录每次交付耗时、实际成本，以及是否有人愿意再次使用', risk: '人工验证能证明需求，不能直接证明大规模交付能力' },
  { id: 'game', name: '变成游戏', en: 'MAKE IT PLAY', mark: '✳', color: 'green', tag: '快乐驱动', desc: '把“我应该做”变成“再来一局”。', rule: '把核心行为做成 60 秒以内的挑战，用反馈而非强制签到推动重玩。', angle: '把一次完整体验压成一分钟的小挑战', experiment: '实现一个目标、一种操作、即时反馈和再来一次按钮，找 5 人各试玩 3 局', metric: '记录首局完成率、主动重玩人数和重玩的原因', risk: '游戏奖励可能掩盖真实价值；检查移除奖励后用户是否仍愿意使用' },
  { id: 'audience', name: '换一群人', en: 'NEW PEOPLE', mark: '↗', color: 'blue', tag: '换个视角', desc: '同一个点子，谁会比现在的人更需要？', rule: '选择一个被忽视的具体人群，按他们的场景重做入口。', angle: '从所有人，收窄到第一次接触这件事的新手', experiment: '找 3 位目标新手，观察他们第一次操作时停在哪一步，再只修改这一步', metric: '记录无指导完成率，以及每个人说出的具体使用场景', risk: '目标人群可能容易触达，却并没有足够强的需求' },
  { id: 'offline', name: '离开屏幕', en: 'GO OFFLINE', mark: '◈', color: 'pink', tag: '场景迁移', desc: '如果体验发生在桌边、街角或一张纸上？', rule: '把核心体验转成一个现实中的动作，屏幕只承担记录或反馈。', angle: '做成一张可以交到朋友手里的挑战卡', experiment: '打印或手写 5 张体验卡，面对面观察使用过程，最后再用一个二维码承接反馈', metric: '记录实际参与人数、完成动作的人数和自发分享次数', risk: '线下互动有新鲜感，但分发与回收成本可能较高' },
  { id: 'social', name: '两个人才好玩', en: 'BETTER TOGETHER', mark: '∞', color: 'purple', tag: '关系化学', desc: '从一个人的工具，变成两个人的默契。', rule: '设计一种无需强制拉新的双人协作，让对方的参与真的改变结果。', angle: '一人出题，一人回应，共同完成一个小目标', experiment: '邀请 3 对朋友，用链接或纸面原型完成一轮协作，不添加排行榜', metric: '记录双人完成率，以及是否自愿发起第二轮', risk: '等待另一人会增加流失；为未配对用户保留单人体验' },
  { id: 'tiny', name: '只做一分钟', en: 'ONE MINUTE', mark: '60s', color: 'orange', tag: '缩小尺度', desc: '删到用户一分钟就能得到第一次惊喜。', rule: '将第一次价值体验限制在 60 秒内，移除前置配置。', angle: '打开即用，先给一次完整的小结果', experiment: '用秒表观察 5 人的首次体验，把每个阻塞步骤逐项删掉或延后', metric: '记录首次价值时间中位数及一分钟内完成的人数', risk: '为了速度过度简化，可能让结果失去实际用途' },
  { id: 'remix', name: '跨界杂交', en: 'UNLIKELY MIX', mark: '⊕', color: 'green', tag: '意外连接', desc: '给这个想法，嫁接一个陌生领域的机制。', rule: '借用盲盒的揭晓感或展览的策展机制，不照搬付费抽奖。', angle: '把结果做成一次有主题的发现与揭晓', experiment: '做 6 个有差异的样本，用户先选择主题再揭晓，并能跳过动画直接查看', metric: '记录样本收藏率和用户对结果差异的评价', risk: '揭晓动画只能制造期待；样本本身必须提供实质差异' },
  { id: 'slow', name: '故意慢一点', en: 'SLOW MAGIC', mark: '◷', color: 'blue', tag: '反效率', desc: '什么东西，值得让人期待到明天？', rule: '把即时输出改为可期待的有限交付，同时给用户明确进度和退出方式。', angle: '每天只交付一个经过挑选的小成果', experiment: '连续 3 天，为 5 位用户手动挑选一份结果，让他们自行选择是否订阅下一天', metric: '记录主动续订人数、实际阅读反馈和退订原因', risk: '延迟本身没有价值；需要证明策展或质量值得等待' },
  { id: 'transparent', name: '拆开给人看', en: 'OPEN THE BOX', mark: '⌘', color: 'pink', tag: '信任设计', desc: '让过程也成为体验的一部分。', rule: '把关键依据、过程和可修改参数展示出来，让用户能纠正结果。', angle: '每个结果附一张可调整的过程配方', experiment: '给 5 人同一个结果，让他们修改一项参数，观察是否能得到更合适的版本', metric: '记录成功修改人数及用户能否解释结果为什么变化', risk: '过程细节过多可能增加负担，默认只展示最关键的三项' },
  { id: 'gift', name: '把它当礼物', en: 'MAKE A GIFT', mark: '✧', color: 'purple', tag: '情绪价值', desc: '如果不是自己用，而是想送给一个人？', rule: '围绕一个具体收件人与场合定制结果，让接收者无需注册即可体验。', angle: '生成一份只有这个朋友才懂的小作品', experiment: '让 3 人为各自的一位朋友制作并发送样本，向接收者收集真实反馈', metric: '记录成功送出数、被打开数和收到的具体回应', risk: '定制内容可能涉及隐私；只使用发送者明确提供的信息' },
  { id: 'opposite', name: '拒绝一个功能', en: 'SAY NO', mark: '×', color: 'orange', tag: '减法实验', desc: '去掉行业标配，体验会不会反而更好？', rule: '选择一个常见但非必要的功能删除，用更清楚的规则替代。', angle: '去掉评分和排行榜，改成个人进度与作品留存', experiment: '做一份删减版原型，请 5 人完成同一任务，询问他们真正想找回的功能', metric: '记录任务完成率、被要求恢复的功能及原因', risk: '被删除的功能可能支持一类重要用户，保留反馈与恢复路径' },
];

export const EXAMPLES = [
  { label: '一款微信小游戏', text: '我做了一款微信小游戏，想让玩家愿意多玩一局，也愿意分享给朋友。预算有限，希望先验证一个新的玩法。' },
  { label: '一个独立产品', text: '做一个帮独立开发者记录每天进展的轻量工具，让一个人做项目时也能感受到持续前进。' },
  { label: '一家街角咖啡店', text: '给街角咖啡店设计一个小活动，让附近上班的人第一次来之后，还愿意带朋友再来。' },
];

export function drawCards(count = 3, locked = [], rng = Math.random) {
  const n = Math.max(1, Math.min(3, Math.trunc(Number(count)) || 1));
  const held = [...new Set(locked)].filter(id => CARDS.some(card => card.id === id)).slice(0, n);
  const pool = CARDS.filter(card => !held.includes(card.id));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.max(0, Math.min(0.999999999, rng())) * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return [...held, ...pool.slice(0, n - held.length).map(card => card.id)];
}

export function validateIdea(value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('先放进来一个想法，再看看它会长成什么。');
  if (value.trim().length > 1600) throw new Error('想法有点长，请压缩到 1600 字以内。');
  return value.trim();
}

export function generatePlan(idea, ids, { variant = 0, now = Date.now(), id = globalThis.crypto.randomUUID() } = {}) {
  const source = validateIdea(idea);
  const selected = [...new Set(ids)].map(key => CARDS.find(card => card.id === key)).filter(Boolean).slice(0, 3);
  if (!selected.length) throw new Error('至少选一张变异卡。');
  const subject = source.replace(/[。！？!?\n].*$/s, '').slice(0, 26);
  const perspectives = ['先做给一个真实的人', '先验证最出乎意料的部分', '先把第一次体验做完整'];
  const lead = selected[Math.abs(variant) % selected.length];
  const sections = [
    { label: '新的打开方式', value: `围绕「${subject}」，${lead.angle}。\n\n${selected.map((card, index) => `${index + 1}. ${card.name}：${card.rule}`).join('\n')}\n\n组合原则：以「${lead.name}」为主机制，其余卡作为约束；出现冲突时，优先保留用户能实际获得的价值。` },
    { label: '第一版就做这些', value: `${perspectives[Math.abs(variant) % perspectives.length]}。\n\n${selected.map((card, index) => `${index + 1}. ${card.experiment}。`).join('\n')}\n\n先做可点击原型或手动交付；没有验证过的部分，先写成假设。` },
    { label: '怎么知道它有用', value: `${selected.map(card => `• ${card.metric}。`).join('\n')}\n\n提前约定继续投入的门槛；小样本只用来发现问题，不作为增长或收入的证明。` },
    { label: '留意这件事', value: selected.map(card => `• ${card.risk}。`).join('\n') },
    { label: '现在就能做的一步', value: `把「${lead.angle}」画成三个画面：进入、核心动作、获得结果。找一位符合目标的人尝试，记下他第一次犹豫的位置。` },
  ];
  return { id, createdAt: now, idea: source, cardIds: selected.map(card => card.id), title: `${subject} · ${lead.name}实验`, sections, saved: false, variant, origin: 'rules' };
}

export function toMarkdown(plan) {
  const cards = plan.cardIds.map(id => CARDS.find(card => card.id === id)?.name).filter(Boolean);
  return `# ${plan.title}\n\n> 灵感变异机 · 规则草案\n\n## 原始想法\n\n${plan.idea}\n\n变异配方：${cards.join(' × ')}\n\n${plan.sections.map(section => `## ${section.label}\n\n${section.value}`).join('\n\n')}\n`;
}

export function toPrompt(plan) {
  return `请把下面的灵感变异草案深化为针对原始想法的具体方案。草案来自本地规则模板，尚未经过事实验证。\n\n要求：\n1. 保留我对草案的编辑，以及所选变异卡的约束。\n2. 写清目标用户、核心体验、最小实现、验证步骤和失败条件。\n3. 遇到规则冲突，给出明确取舍；不要堆砌功能。\n4. 不编造用户数据、收入、市场规模或验证结论。\n5. 先输出可继续修改的 Markdown 方案，不执行部署、发布或付费操作。\n\n${toMarkdown(plan)}`;
}

// Treat browser storage as untrusted and retain only our bounded document format.
export function normalizeHistory(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.filter(item => {
    if (!item || typeof item.id !== 'string' || seen.has(item.id) || typeof item.idea !== 'string' || typeof item.title !== 'string' || !Number.isFinite(item.createdAt) || !Array.isArray(item.cardIds) || !item.cardIds.length || !item.cardIds.every(id => CARDS.some(card => card.id === id)) || !Array.isArray(item.sections) || item.sections.length !== 5 || !item.sections.every(section => typeof section?.label === 'string' && typeof section?.value === 'string')) return false;
    seen.add(item.id);
    return true;
  }).slice(0, 60).map(item => ({ id: item.id.slice(0, 100), idea: item.idea.slice(0, 1600), title: item.title.slice(0, 120), createdAt: item.createdAt, cardIds: [...new Set(item.cardIds)].slice(0, 3), sections: item.sections.map(section => ({ label: section.label.slice(0, 40), value: section.value.slice(0, 10000) })), saved: item.saved === true, variant: Number.isInteger(item.variant) ? item.variant : 0, origin: 'rules' }));
}
