const React = require('react');
const { createPortal } = require('react-dom');
const { createElement: h, useState, useRef, useEffect } = React;

function IdeaMutatorDock({ inputActions, sessionId }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialog = useRef(null);
  const frame = useRef(null);
  const insertion = useRef(null);
  const trigger = useRef(null);
  const actions = useRef(inputActions);
  actions.current = inputActions;
  const session = useRef(sessionId);
  session.current = sessionId;

  useEffect(() => {
    if (!mounted) return;
    if (open && !dialog.current.open) dialog.current.showModal();
    else if (!open && dialog.current.open) dialog.current.close();
  }, [open, mounted]);

  useEffect(() => {
    const onMessage = event => {
      if (!frame.current || event.source !== frame.current.contentWindow || event.data?.source !== 'idea-mutator') return;
      const reply = payload => frame.current.contentWindow.postMessage({ source: 'idea-mutator-host', ...payload }, '*');
      if (event.data.type === 'ready') reply({ type: 'init', canInsert: typeof actions.current?.insertText === 'function' && typeof actions.current?.captureInsertion === 'function' });
      if (event.data.type === 'insert-prompt') {
        let ok = false;
        const captured = insertion.current;
        if (typeof event.data.text === 'string' && event.data.text.length <= 70000 && captured && captured.sessionId === session.current) {
          try {
            ok = actions.current?.insertText(event.data.text, captured.span) === true;
            if (ok) actions.current.persistDraft?.();
          } catch { ok = false; }
        }
        reply({ type: 'insert-result', id: event.data.id, ok });
        if (ok) setOpen(false);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    setOpen(false);
    insertion.current = null;
  }, [sessionId]);

  const launch = () => {
    try { insertion.current = { sessionId, span: inputActions?.captureInsertion?.() }; }
    catch { insertion.current = null; }
    setMounted(true); setOpen(true);
  };
  return h(React.Fragment, null,
    h('button', {
      ref: trigger, type: 'button', onClick: launch, title: '打开灵感变异机',
      style: { padding: '6px 11px', border: '1px solid #e0d6c8', borderRadius: '7px', background: '#faf2e8', color: '#b76d46', cursor: 'pointer', fontSize: '12px' },
    }, '✳ 灵感变异机'),
    mounted ? createPortal(h('dialog', {
      ref: dialog, 'aria-label': '灵感变异机',
      onClose: () => { setOpen(false); trigger.current?.focus(); },
      onCancel: () => setOpen(false),
      style: { width: 'min(1320px, 96vw)', height: 'min(940px, 92dvh)', maxWidth: '96vw', maxHeight: '92dvh', border: '1px solid #dedfd5', padding: 0, borderRadius: '12px', background: '#f5f4ef', overflow: 'hidden', boxShadow: '0 25px 100px #0004' },
    },
      h('style', null, 'dialog[aria-label="灵感变异机"]::backdrop{background:#20291f66;backdrop-filter:blur(3px)}'),
      h('div', { style: { height: '38px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 14px', borderBottom: '1px solid #dedfd5', fontSize: '11px', color: '#7b836f' } },
        h('span', null, '✳ 灵感变异机 / MUTANT IDEA LAB'),
        h('button', { type: 'button', onClick: () => setOpen(false), 'aria-label': '关闭灵感变异机', style: { border: 0, background: 'none', cursor: 'pointer', fontSize: '20px', color: '#7b836f', padding: '4px 8px' } }, '×'),
      ),
      h('iframe', { ref: frame, title: '灵感变异机工作台', srcDoc: APP_HTML, allow: 'clipboard-write', style: { display: 'block', width: '100%', height: 'calc(100% - 38px)', border: 0, background: '#f5f4ef' } }),
    ), document.body) : null,
  );
}

function apply(ctx) {
  ctx.slots.inject('conversation.input.dock', () => ctx.slots.register(
    { name: 'conversation.input.dock', id: 'idea-mutator', order: 80 },
    IdeaMutatorDock,
  ));
}
