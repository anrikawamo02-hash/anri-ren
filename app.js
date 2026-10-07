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
  const renBase = document.getElementById('renImage') || document.querySelector('.ren-base');
  const eyeLayer = document.getElementById('eyeLayer');
  const mouthLayer = document.getElementById('mouthLayer');

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
    mouthPending: '\u53e3\u30d1\u30af\u6e96\u5099\u4e2d',
    mouthCheck: '\u53e3\u5143\u78ba\u8a8d',
    mouthNormal: '\u901a\u5e38',
    mouthSmall: '\u5c0f',
    mouthOpen: '\u5927',
    mouthRound: '\u3046\u30fb\u304a'
  };

  /*
    å¶ä½ä¸­ã®å±éã«ã¼ã«
    - åãã­ãã£ã¼ã«ã¯ããã©ã«ãã¼åä½ãã§æ±ãã
    - ãã©ã«ãã¼åã®ãã¡ã¤ã«åã¯å±éï¼
      ren_base.png / eyes_half.png / eyes_closed.png /
      mouth_small.png / mouth_open.png / mouth_round.png
    - ç®åã¯éå¸¸ç¬ããæå¹ã
    - å£åã¯å¶ä½ç¢ºèªç¨ããã«ã§åå¥è¡¨ç¤ºã§ãããå®éã®å£ãã¯åä½ã¯ã¾ã ç¡å¹ã
  */
  const REN_PROFILES = {
    spring_summer: {
      day: 'images/spring_summer_day_main',
      night: 'images/spring_summer_night_main'
    },
    winter: {
      day: 'images/winter_day_main',
      night: 'images/winter_night_main'
    }
  };

  // éçºä¸­ã¯ãã¼ã¸ãåèª­ã¿è¾¼ã¿ãããã³ã«ææ°ç»åãåããããããã
  const DEV_ASSET_VERSION = Date.now();

  // 3/1ã8/31 = æ¥å¤ã9/1ã2ææ« = ç§å¬ï¼winterãã©ã«ãã¼ï¼
  function getSeason(date = new Date()) {
    const month = date.getMonth() + 1;
    return month >= 3 && month <= 8 ? 'spring_summer' : 'winter';
  }

  // 06:00ã17:59 = dayã18:00ã05:59 = night
  function getTimeSlot(date = new Date()) {
    const hour = date.getHours();
    return hour >= 6 && hour < 18 ? 'day' : 'night';
  }

  function withVersion(path) {
    return `${path}?v=${DEV_ASSET_VERSION}`;
  }

  function buildAssets(season, slot) {
    const folder = REN_PROFILES[season]?.[slot];
    if (!folder) return null;

    return {
      key: `${season}:${slot}`,
      folder,
      base: withVersion(`${folder}/ren_base.png`),
      eyesHalf: withVersion(`${folder}/eyes_half.png`),
      eyesClosed: withVersion(`${folder}/eyes_closed.png`),
      mouthSmall: withVersion(`${folder}/mouth_small.png`),
      mouthOpen: withVersion(`${folder}/mouth_open.png`),
      mouthRound: withVersion(`${folder}/mouth_round.png`)
    };
  }

  let displayMode = 'auto';
  let displayCheckButtons = {};
  let mouthCheckButtons = {};
  let mouthCheckMode = 'normal';

  let activeAssets = null;
  let activeProfileKey = '';
  let switchToken = 0;
  let blinkToken = 0;
  let blinkTimer = null;

  let eyeAvailability = {
    half: false,
    closed: false
  };

  let mouthAvailability = {
    small: false,
    open: false,
    round: false
  };

  function currentProfile() {
    const now = new Date();
    const season = getSeason(now);
    const slot = displayMode === 'auto' ? getTimeSlot(now) : displayMode;
    return { season, slot };
  }

  function preloadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  function hideEyes() {
    if (!eyeLayer) return;
    eyeLayer.style.opacity = '0';
  }

  function showEyes(src) {
    if (!eyeLayer) return;
    eyeLayer.src = src;
    eyeLayer.style.opacity = '1';
  }

  function hideMouth() {
    if (!mouthLayer) return;
    mouthLayer.style.opacity = '0';
    mouthLayer.removeAttribute('src');
  }

  function showMouth(src) {
    if (!mouthLayer) return;
    mouthLayer.src = src;
    mouthLayer.style.opacity = '1';
  }

  function updateMouthCheckButtons() {
    Object.entries(mouthCheckButtons).forEach(([mode, button]) => {
      const available =
        mode === 'normal' ||
        (mode === 'small' && mouthAvailability.small) ||
        (mode === 'open' && mouthAvailability.open) ||
        (mode === 'round' && mouthAvailability.round);

      button.disabled = !available;
      button.style.opacity = available ? '1' : '0.4';
      button.classList.toggle('is-active', mode === mouthCheckMode);
    });
  }

  function applyMouthCheck() {
    if (!activeAssets) {
      hideMouth();
      updateMouthCheckButtons();
      return;
    }

    if (mouthCheckMode === 'small' && mouthAvailability.small) {
      showMouth(activeAssets.mouthSmall);
    } else if (mouthCheckMode === 'open' && mouthAvailability.open) {
      showMouth(activeAssets.mouthOpen);
    } else if (mouthCheckMode === 'round' && mouthAvailability.round) {
      showMouth(activeAssets.mouthRound);
    } else {
      mouthCheckMode = 'normal';
      hideMouth();
    }

    updateMouthCheckButtons();
  }

  function stopBlinking() {
    blinkToken += 1;
    if (blinkTimer) {
      clearTimeout(blinkTimer);
      blinkTimer = null;
    }
    hideEyes();
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function blinkOnce(token) {
    if (!activeAssets || !eyeAvailability.half || token !== blinkToken) return;

    // éç¼ï¼ãã¼ã¹ï¼â åç®
    showEyes(activeAssets.eyesHalf);
    await sleep(70);
    if (token !== blinkToken) return;

    // éãç®ãã¾ã ç¡ãå¶ä½éä¸­ã§ã¯ãåç®ã ãç¢ºèªã§ããã
    if (eyeAvailability.closed) {
      showEyes(activeAssets.eyesClosed);
      await sleep(95);
      if (token !== blinkToken) return;

      showEyes(activeAssets.eyesHalf);
      await sleep(70);
      if (token !== blinkToken) return;
    }

    // åç® â éç¼ï¼ãã¼ã¹ï¼
    hideEyes();
  }

  function scheduleNextBlink() {
    if (!eyeAvailability.half || !activeAssets) return;

    const token = blinkToken;
    const nextBlink = 3200 + Math.random() * 3000;

    blinkTimer = setTimeout(async () => {
      if (token !== blinkToken) return;

      await blinkOnce(token);

      if (token !== blinkToken) return;

      // åã®ç¢ºå®è¨­å®ï¼ã¾ãã«äºåº¦ç¬ãï¼6%ï¼
      if (Math.random() < 0.06) {
        await sleep(140);
        if (token !== blinkToken) return;
        await blinkOnce(token);
      }

      if (token === blinkToken) {
        scheduleNextBlink();
      }
    }, nextBlink);
  }

  async function switchBaseImage(nextSrc, instant = false) {
    if (!renBase) return false;

    const myToken = ++switchToken;
    const loaded = await preloadImage(nextSrc);

    if (myToken !== switchToken) return false;

    if (!loaded) {
      renBase.style.opacity = '1';
      console.log('Base image could not be loaded:', nextSrc);
      return false;
    }

    const currentSrc = renBase.getAttribute('src') || '';

    if (currentSrc === nextSrc) {
      renBase.style.opacity = '1';
      return true;
    }

    if (!instant) {
      renBase.style.opacity = '0';
      await sleep(360);
      if (myToken !== switchToken) return false;
    }

    renBase.src = nextSrc;

    requestAnimationFrame(() => {
      if (myToken === switchToken) {
        renBase.style.opacity = '1';
      }
    });

    return true;
  }

  async function prepareMouth(assets, tokenAtStart) {
    const [small, open, round] = await Promise.all([
      preloadImage(assets.mouthSmall),
      preloadImage(assets.mouthOpen),
      preloadImage(assets.mouthRound)
    ]);

    if (tokenAtStart !== switchToken || activeAssets?.key !== assets.key) {
      return;
    }

    mouthAvailability = { small, open, round };
    applyMouthCheck();
  }

  async function prepareEyes(assets, tokenAtStart) {
    const [half, closed] = await Promise.all([
      preloadImage(assets.eyesHalf),
      preloadImage(assets.eyesClosed)
    ]);

    if (tokenAtStart !== switchToken || activeAssets?.key !== assets.key) {
      return;
    }

    eyeAvailability = { half, closed };

    stopBlinking();

    // stopBlinking() increments blinkToken, so start a fresh cycle after it.
    if (eyeAvailability.half) {
      scheduleNextBlink();
    }
  }

  function updateDisplayCheckButtons() {
    Object.entries(displayCheckButtons).forEach(([mode, button]) => {
      button.classList.toggle('is-active', mode === displayMode);
    });
  }

  async function applyCurrentRen(instant = false) {
    const { season, slot } = currentProfile();
    const assets = buildAssets(season, slot);

    updateDisplayCheckButtons();

    if (!assets) return;

    if (activeProfileKey === assets.key && activeAssets) {
      return;
    }

    stopBlinking();
    mouthCheckMode = 'normal';
    mouthAvailability = { small: false, open: false, round: false };
    hideMouth();
    updateMouthCheckButtons();

    const switched = await switchBaseImage(assets.base, instant);
    if (!switched) return;

    activeAssets = assets;
    activeProfileKey = assets.key;

    const tokenAtStart = switchToken;
    prepareEyes(assets, tokenAtStart);
    prepareMouth(assets, tokenAtStart);
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

  function createMouthCheckPanel() {
    document.getElementById('renMouthCheckPanel')?.remove();
    document.getElementById('renMouthCheckStyle')?.remove();

    const panel = document.createElement('div');
    panel.id = 'renMouthCheckPanel';
    panel.className = 'ren-mouth-check';

    const label = document.createElement('span');
    label.className = 'ren-mouth-check__label';
    label.textContent = JP.mouthCheck;

    const group = document.createElement('div');
    group.className = 'ren-mouth-check__group';

    [
      ['normal', JP.mouthNormal],
      ['small', JP.mouthSmall],
      ['open', JP.mouthOpen],
      ['round', JP.mouthRound]
    ].forEach(([mode, text]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ren-mouth-check__btn';
      button.dataset.mode = mode;
      button.textContent = text;

      button.addEventListener('click', () => {
        if (button.disabled) return;
        mouthCheckMode = mode;
        applyMouthCheck();
      });

      group.appendChild(button);
      mouthCheckButtons[mode] = button;
    });

    panel.append(label, group);

    const displayPanel = document.getElementById('renDisplayCheckPanel');
    if (displayPanel?.parentElement) {
      displayPanel.insertAdjacentElement('afterend', panel);
    } else {
      const themeContainer = lavBtn?.parentElement;
      if (themeContainer?.parentElement) {
        themeContainer.insertAdjacentElement('afterend', panel);
      } else if (app) {
        app.prepend(panel);
      } else {
        document.body.prepend(panel);
      }
    }

    const style = document.createElement('style');
    style.id = 'renMouthCheckStyle';
    style.textContent = `
      .ren-mouth-check {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin: 0 0 12px;
        padding: 8px 10px;
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 14px;
        background: rgba(255,255,255,.04);
        font-size: 13px;
      }

      .ren-mouth-check__label {
        opacity: .72;
        white-space: nowrap;
      }

      .ren-mouth-check__group {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 6px;
      }

      .ren-mouth-check__btn {
        appearance: none;
        border: 1px solid rgba(255,255,255,.14);
        border-radius: 999px;
        padding: 7px 11px;
        background: rgba(255,255,255,.05);
        color: inherit;
        font: inherit;
        font-weight: 700;
      }

      .ren-mouth-check__btn.is-active {
        background: #f5f5f7;
        color: #111216;
      }

      .ren-mouth-check__btn:disabled {
        cursor: default;
      }
    `;

    document.head.appendChild(style);
    updateMouthCheckButtons();
  }

  // èªåè¡¨ç¤ºæã¯ã6æã»18æãªã©ã®åãæ¿ãããæ¾ãã
  setInterval(() => {
    if (displayMode === 'auto') {
      const { season, slot } = currentProfile();
      const nextKey = `${season}:${slot}`;

      if (nextKey !== activeProfileKey) {
        applyCurrentRen();
      }
    }
  }, 60 * 1000);

  if (renBase) {
    renBase.style.transition = 'opacity 360ms ease';
  }

  hideEyes();
  hideMouth();

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

  // å®éã®èªåå£ãã¯ã¯ã¾ã æªæ¥ç¶ãä»åã¯ç´ æç¢ºèªããã«ã ãæå¹ã«ããã
  if (lipBtn) {
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

  applyAuto();
  createDisplayCheckPanel();
  createMouthCheckPanel();
  applyCurrentRen(true);
})();
