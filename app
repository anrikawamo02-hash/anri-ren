(() => {
  const app = document.getElementById('app');
  const autoBtn = document.getElementById('autoBtn');
  const blackBtn = document.getElementById('blackBtn');
  const lavBtn = document.getElementById('lavBtn');
  const status = document.getElementById('status');
  const bubble = document.getElementById('bubble');
  const voiceBtn = document.getElementById('voiceBtn');
  const lipBtn = document.getElementById('lipBtn');
  const micBtn = document.getElementById('micBtn');
  const sendBtn = document.getElementById('sendBtn');
  const msg = document.getElementById('msg');

  function clearThemeClasses() {
    app.classList.remove('theme-lavender', 'theme-morning', 'theme-evening');
  }

  function setActive(btn) {
    [autoBtn, blackBtn, lavBtn].forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
  }

  function applyAuto() {
    clearThemeClasses();
    const h = new Date().getHours();

    if (h >= 5 && h < 12) {
      app.classList.add('theme-morning');
    } else if (h >= 12 && h < 18) {
      app.classList.add('theme-evening');
    }

    setActive(autoBtn);
  }

  autoBtn.addEventListener('click', applyAuto);

  blackBtn.addEventListener('click', () => {
    clearThemeClasses();
    setActive(blackBtn);
  });

  lavBtn.addEventListener('click', () => {
    clearThemeClasses();
    app.classList.add('theme-lavender');
    setActive(lavBtn);
  });

  let voiceOn = true;

  voiceBtn.addEventListener('click', () => {
    voiceOn = !voiceOn;
    voiceBtn.classList.toggle('active', voiceOn);
    voiceBtn.textContent = voiceOn ? 'ð é³å£°ON' : 'ð é³å£°OFF';
  });

  lipBtn.addEventListener('click', () => {
    lipBtn.classList.toggle('active');
  });

  micBtn.addEventListener('click', () => {
    status.textContent = 'èãã¦ã';
    bubble.innerHTML = '<div class="who">è®</div>ãã¤ã¯æ©è½ã¯æ¬¡ã®æ®µéã§ã¤ãªãã§ã';

    setTimeout(() => {
      status.textContent = 'å¾ã£ã¦ã';
    }, 1200);
  });

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[char]);
  }

  function sendDemo() {
    const value = msg.value.trim();
    if (!value) return;

    status.textContent = 'èãä¸­';
    bubble.innerHTML = '<div class="who">æé</div>' + escapeHtml(value);

    setTimeout(() => {
      status.textContent = voiceOn ? 'è©±ãã¦ã' : 'è¿äºä¸­';
      bubble.innerHTML = '<div class="who">è®</div>ããããã®æãã§å°ããã¤ä»ä¸ãã¦ãããã';

      setTimeout(() => {
        status.textContent = 'å¾ã£ã¦ã';
      }, 1000);
    }, 500);

    msg.value = '';
  }

  sendBtn.addEventListener('click', sendDemo);

  msg.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendDemo();
    }
  });

  applyAuto();
})();
