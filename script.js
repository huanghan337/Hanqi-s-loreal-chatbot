/* script.js - front-end logic connecting to the Cloudflare Worker */
(() => {
  const WORKER_URL = typeof WORKER_URL !== 'undefined' ? WORKER_URL : null;
  const FRONTEND_SECRET = typeof FRONTEND_SECRET !== 'undefined' ? FRONTEND_SECRET : '';
  const chatEl = document.getElementById('chat');
  const input = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const latestQ = document.getElementById('latest-question');

  let conversationHistory = [
    { role: 'system', content: "You are a helpful assistant that ONLY answers questions about L'Oréal products and routines. Politely refuse unrelated requests." }
  ];

  function appendMessage(role, text) {
    const wrapper = document.createElement('div');
    wrapper.className = 'message ' + (role === 'user' ? 'user' : 'assistant');
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerText = text;
    wrapper.appendChild(bubble);
    chatEl.appendChild(wrapper);
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  async function askWorker(question) {
    latestQ.textContent = 'Latest question: ' + question;
    conversationHistory.push({ role: 'user', content: question });
    appendMessage('user', question);
    appendMessage('assistant', 'Typing...');

    if (!WORKER_URL) {
      const last = chatEl.querySelectorAll('.assistant .bubble');
      last[last.length - 1].innerText = 'WORKER_URL not configured. Please edit config.js';
      return;
    }

    try {
      const resp = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-project-secret': FRONTEND_SECRET
        },
        body: JSON.stringify({ messages: conversationHistory })
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error('Worker returned error: ' + resp.status + ' ' + text);
      }

      const data = await resp.json();
      const assistantText = data?.choices?.[0]?.message?.content || JSON.stringify(data);
      const last = chatEl.querySelectorAll('.assistant .bubble');
      last[last.length - 1].innerText = assistantText;
      conversationHistory.push({ role: 'assistant', content: assistantText });
    } catch (err) {
      const last = chatEl.querySelectorAll('.assistant .bubble');
      last[last.length - 1].innerText = 'Error communicating with Worker: ' + err.toString();
      console.error(err);
    }
  }

  sendBtn.addEventListener('click', () => {
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    askWorker(q);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click();
    }
  });

  // initial helper message
  appendMessage('assistant', 'Hello — ask me about L\'Oréal products or routines. I will answer for demo purposes.');
})();
