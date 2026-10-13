// Chat del club: habla con el workflow n8n "social_boxing_asistente".

const CHAT_WEBHOOK_URL = 'https://n8n.zifros.de/webhook/c47ab0b3-941f-46b9-b1eb-3fa6957225de/chat';
const CHAT_FALLBACK = 'Se me fue la señal un momento. Escríbenos directo por WhatsApp al +503 7869 4928 y te atienden.';

document.addEventListener('DOMContentLoaded', () => {
  const widget = document.getElementById('chatWidget');
  const toggleBtn = document.getElementById('chatToggle');
  const closeBtn = document.getElementById('chatClose');
  const body = document.getElementById('chatBody');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  if (!widget) return;

  function getSessionId() {
    try {
      let id = localStorage.getItem('sbc-chat-session');
      if (!id) {
        id = 'web-' + (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(16).slice(2));
        localStorage.setItem('sbc-chat-session', id);
      }
      return id;
    } catch (e) {
      return 'web-' + Date.now();
    }
  }
  const sessionId = getSessionId();
  let opened = false;

  function addMessage(text, who) {
    const el = document.createElement('div');
    el.className = `chat-msg chat-msg--${who}`;
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }
  function showTyping() {
    const el = document.createElement('div');
    el.className = 'chat-msg chat-msg--typing';
    el.id = 'chatTypingIndicator';
    el.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }
  function hideTyping() {
    const el = document.getElementById('chatTypingIndicator');
    if (el) el.remove();
  }

  toggleBtn.addEventListener('click', () => {
    widget.classList.toggle('is-open');
    if (widget.classList.contains('is-open')) {
      input.focus();
      if (!opened) {
        opened = true;
        addMessage('Hola, soy el asistente virtual de Social Boxing Club (una inteligencia artificial). Te cuento de las promos, el contacto y los eventos del club. Lo que no tenga confirmado, te lo confirma el club por WhatsApp. ¿Qué te gustaría saber?', 'bot');
      }
    }
  });
  closeBtn.addEventListener('click', () => widget.classList.remove('is-open'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';
    input.disabled = true;
    showTyping();
    try {
      const res = await fetch(CHAT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatInput: text, sessionId })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      hideTyping();
      addMessage(data.output || CHAT_FALLBACK, 'bot');
    } catch (err) {
      hideTyping();
      addMessage(CHAT_FALLBACK, 'bot');
    } finally {
      input.disabled = false;
      input.focus();
    }
  });
});
