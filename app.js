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
    [autoBtn, blackBtn, lavBtn].forEach((button) => {
      button.classList.toggle('active', button === btn);
    });
  }

  function applyAuto() {
    clearThemeClasses();
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      app.classList.add('theme-morning');
    } else if (hour >= 12 && hour < 18) {
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
    voiceBtn.textContent = voiceOn ? '🔊 音声ON' : '🔇 音声OFF';
  });

  lipBtn.addEventListener('click', () => {
    lipBtn.classList.toggle('active');
  });

  micBtn.addEventListener('click', () => {
    status.textContent = '聞いてる';
    bubble.innerHTML = '<div class="who">蓮</div>マイク機能は次の段階でつなぐで。';

    setTimeout(() => {
      status.textContent = '待ってる';
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

    status.textContent = '考え中';
    bubble.innerHTML = '<div class="who">杏里</div>' + escapeHtml(value);

    setTimeout(() => {
      status.textContent = voiceOn ? '話してる' : '返事中';
      bubble.innerHTML = '<div class="who">蓮</div>うん。この感じで、少しずつ杏里好みに仕上げていこか。';

      setTimeout(() => {
        status.textContent = '待ってる';
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
