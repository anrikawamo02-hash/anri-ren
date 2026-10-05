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
  const eyeLayer = document.getElementById('eyeLayer');
  const mouthLayer = document.getElementById('mouthLayer');

  const renBase =
    document.getElementById('renImage') ||
    document.getElementById('ren') ||
    document.querySelector('.ren-image') ||
    document.querySelector('.ren-stage img:not(.eye-layer):not(.mouth-layer)') ||
    [...document.images].find((img) => {
      const src = (img.getAttribute('src') || '').split('?')[0];
      return src === 'ren.png' || src.endsWith('/ren.png');
    });

  const JP = {
    waiting: '\u5f85\u3063\u3066\u308b',
    listening: '\u805e\u3044\u3066\u308b',
    thinking: '\u8003\u3048\u4e2d',
    speaking: '\u8a71\u3057\u3066\u308b',
    replying: '\u8fd4\u4e8b\u4e2d',
    ren: '\u84ee',
    anri: '\u674f\u91cc',
    micNext: '\u30de\u30a4\u30af\u6a5f\u80fd\u306f\u6b21\u306e\u6bb5\u968e\u3067\u3064\u306a\u3050\u3067\u3002',
    demoReply: '\u3046\u3093\u3002\u3053\u306e\u611f\u3058\u3067\u3001\u5c11\u3057\u305a\u3064\u674f\u91cc\u597d\u307f\u306b\u4ed5\u4e0a\u3052\u3066\u3044\u3053\u304b\u3002',
    voiceOn: '\ud83d\udd0a \u97f3\u58f0ON',
    voiceOff: '\ud83d\udd07 \u97f3\u58f0OFF',
    displayCheck: '\u8868\u793a\u78ba\u8a8d',
    displayAuto: '\u81ea\u52d5',
    displayDay: '\u663c',
    displayNight: '\u591c',
    mouthPending: '\u53e3\u30d1\u30af\u6e96\u5099\u4e2d'
  };

  const BASE_ONLY_TEST = true;

  const WINTER_PROFILES = {
    day: { base: 'images/winter_day_main/ren_base.png' },
    night: { base: 'images/winter_night_main/ren_base.png' }
  };

  function getTimeSlot() {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18 ? 'day' : 'night';
  }

  let displayMode = 'auto';
  let switchToken = 0;
  let displayCheckButtons = {};

  function currentSlot() {
    return displayMode === 'auto' ? getTimeSlot() : displayMode;
  }

  function hideOldFaceLayers() {
    if (eyeLayer) eyeLayer.style.opacity = '0';
    if (mouthLayer) mouthLayer.style.opacity = '0';
  }

  function switchBaseImage(slot, instant = false) {
    if (!renBase) return;
    const profile = WINTER_PROFILES[slot];
    if (!profile) return;

    const myToken = ++switchToken;
    const nextSrc = profile.base;
    const currentSrc = renBase.getAttribute('src') || '';

    if (currentSrc === nextSrc) {
      renBase.style.opacity = '1';
      return;
    }

    const preloader = new Image();

    preloader.onload = () => {
      if (myToken !== switchToken) return;

      const doSwap = () => {
        if (myToken !== switchToken) return;
        renBase.src = nextSrc;
        requestAnimationFrame(() => {
          renBase.style.opacity = '1';
        });
      };

      renBase.style.opacity = '0';

      if (instant) {
        doSwap();
      } else {
        setTimeout(doSwap, 360);
      }
    };

    preloader.onerror = () => {
      if (myToken !== switchToken) return;
      renBase.style.opacity = '1';
      console.log('Base image could not be loaded:', nextSrc);
    };

    preloader.src = nextSrc;
  }

  function updateDisplayCheckButtons() {
    Object.entries(displayCheckButtons).forEach(([mode, button]) => {
      button.classList.toggle('is-active', mode === displayMode);
    });
  }

  function applyCurrentRen(instant = false) {
    hideOldFaceLayers();
    switchBaseImage(currentSlot(), instant);
    updateDisplayCheckButtons();
  }

  function createDisplayCheckPanel() {
    document.getElementById('renDisplayCheckPanel')?.remove();
    document.getElementById('renDisplayCheckStyle')?.remove();

    const panel = document.createElement('div');
    panel.id = 'renDisplayCheckPanel';
    panel.className = 'ren-display-check';

    const label = document.createElement('span');
    label.className = 'ren-display-check__label';
    label.textContent = JP.displayCheck;

    const group = document.createElement('div');
    group.className = 'ren-display-check__group';

    [
      ['auto', JP.displayAuto],
      ['day', JP.displayDay],
      ['night', JP.displayNight]
    ].forEach(([mode, text]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ren-display-check__btn';
      button.dataset.mode = mode;
      button.textContent = text;

      button.addEventListener('click', () => {
        displayMode = mode;
        applyCurrentRen();
      });

      group.appendChild(button);
      displayCheckButtons[mode] = button;
    });

    panel.append(label, group);

    const themeContainer = lavBtn?.parentElement;
    if (themeContainer?.parentElement) {
      themeContainer.insertAdjacentElement('afterend', panel);
    } else if (app) {
      app.prepend(panel);
    } else {
      document.body.prepend(panel);
    }

    const style = document.createElement('style');
    style.id = 'renDisplayCheckStyle';
    style.textContent = `
      .ren-display-check {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin: 10px 0 12px;
        padding: 8px 10px;
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 14px;
        background: rgba(255,255,255,.04);
        font-size: 13px;
      }
      .ren-display-check__label {
        opacity: .72;
        white-space: nowrap;
      }
      .ren-display-check__group {
        display: flex;
        gap: 6px;
      }
      .ren-display-check__btn {
        appearance: none;
        border: 1px solid rgba(255,255,255,.14);
        border-radius: 999px;
        padding: 7px 12px;
        background: rgba(255,255,255,.05);
        color: inherit;
        font: inherit;
        font-weight: 700;
      }
      .ren-display-check__btn.is-active {
        background: #f5f5f7;
        color: #111216;
      }
    `;
    document.head.appendChild(style);
  }

  setInterval(() => {
    if (displayMode === 'auto') {
      applyCurrentRen();
    }
  }, 60 * 1000);

  if (renBase) {
    renBase.style.transition = 'opacity 360ms ease';
  }

  function clearThemeClasses() {
    app?.classList.remove('theme-lavender', 'theme-morning', 'theme-evening');
  }

  function setActive(btn) {
    [autoBtn, blackBtn, lavBtn].forEach((button) => {
      if (button) button.classList.toggle('active', button === btn);
    });
  }

  function applyAuto() {
    clearThemeClasses();
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      app?.classList.add('theme-morning');
    } else if (hour >= 12 && hour < 18) {
      app?.classList.add('theme-evening');
    }

    setActive(autoBtn);
  }

  autoBtn?.addEventListener('click', applyAuto);

  blackBtn?.addEventListener('click', () => {
    clearThemeClasses();
    setActive(blackBtn);
  });

  lavBtn?.addEventListener('click', () => {
    clearThemeClasses();
    app?.classList.add('theme-lavender');
    setActive(lavBtn);
  });

  let voiceOn = true;

  voiceBtn?.addEventListener('click', () => {
    voiceOn = !voiceOn;
    voiceBtn.classList.toggle('active', voiceOn);
    voiceBtn.textContent = voiceOn ? JP.voiceOn : JP.voiceOff;
  });

  if (BASE_ONLY_TEST && lipBtn) {
    lipBtn.disabled = true;
    lipBtn.classList.remove('active');
    lipBtn.textContent = JP.mouthPending;
    lipBtn.style.opacity = '0.55';
  }

  function showBubble(who, text) {
    if (!bubble) return;

    bubble.textContent = '';

    const whoEl = document.createElement('div');
    whoEl.className = 'who';
    whoEl.textContent = who;

    const textEl = document.createElement('div');
    textEl.textContent = text;

    bubble.append(whoEl, textEl);
  }

  micBtn?.addEventListener('click', () => {
    if (status) status.textContent = JP.listening;
    showBubble(JP.ren, JP.micNext);

    setTimeout(() => {
      if (status) status.textContent = JP.waiting;
    }, 1200);
  });

  function sendDemo() {
    if (!msg) return;

    const value = msg.value.trim();
    if (!value) return;

    if (status) status.textContent = JP.thinking;
    showBubble(JP.anri, value);

    setTimeout(() => {
      if (status) status.textContent = voiceOn ? JP.speaking : JP.replying;
      showBubble(JP.ren, JP.demoReply);

      setTimeout(() => {
        if (status) status.textContent = JP.waiting;
      }, 1000);
    }, 500);

    msg.value = '';
  }

  sendBtn?.addEventListener('click', sendDemo);

  msg?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendDemo();
    }
  });

  if (!BASE_ONLY_TEST) {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    function showEyes(src) {
      if (!eyeLayer) return;
      eyeLayer.src = src;
      eyeLayer.style.opacity = '1';
    }

    function hideEyes() {
      if (!eyeLayer) return;
      eyeLayer.style.opacity = '0';
    }

    async function blinkOnce() {
      if (!eyeLayer) return;
      showEyes('eyes_half.png');
      await sleep(70);
      showEyes('eyes_closed.png');
      await sleep(95);
      showEyes('eyes_half.png');
      await sleep(70);
      hideEyes();
    }

    function scheduleNextBlink() {
      const nextBlink = 3200 + Math.random() * 3000;
      setTimeout(async () => {
        await blinkOnce();
        if (Math.random() < 0.06) {
          await sleep(140);
          await blinkOnce();
        }
        scheduleNextBlink();
      }, nextBlink);
    }

    scheduleNextBlink();
  }

  applyAuto();
  createDisplayCheckPanel();
  applyCurrentRen(true);
})();