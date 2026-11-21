    const heroVideo = document.querySelector('.hero-film');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const pageRoot = document.documentElement;
    const loader = document.querySelector('.loader');
    const intro = loader.querySelector('video');
    const skipIntro = loader.querySelector('.intro-skip');
    const introSound = loader.querySelector('.intro-sound');
    const english = document.documentElement.lang === 'en';
    const localText = (italian, translated) => english ? translated : italian;

    for (const option of document.querySelectorAll('.language-option')) {
      option.addEventListener('click', event => {
        if (option.getAttribute('aria-current') === 'page' &&
            !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
          event.preventDefault();
          return;
        }
        const destination = new URL(option.href);
        destination.hash = location.hash;
        option.href = destination.href;
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        try { sessionStorage.setItem('a2m-language-target', destination.pathname); } catch {}
      });
    }

    function syncHeroMotion() {
      if (reducedMotion.matches ||
          (pageRoot.classList.contains('intro-active') && !loader.classList.contains('is-leaving'))) {
        heroVideo.pause();
        return;
      }
      heroVideo.play().catch(() => {});
    }

    if (pageRoot.classList.contains('intro-active')) {
      const startupLimit = window.setTimeout(closeIntro, 2600);
      const playbackLimit = window.setTimeout(closeIntro, 6700);

      function skipOnEscape(event) {
        if (event.key === 'Escape') closeIntro();
      }

      function closeIntro() {
        if (loader.classList.contains('is-leaving')) return;
        clearTimeout(startupLimit);
        clearTimeout(playbackLimit);
        window.removeEventListener('keydown', skipOnEscape);
        loader.classList.add('is-leaving');
        if (loader.contains(document.activeElement)) {
          document.querySelector('.brand').focus({ preventScroll: true });
        }
        intro.pause();
        syncHeroMotion();
        window.setTimeout(() => {
          pageRoot.classList.remove('intro-active');
          intro.removeAttribute('src');
          intro.load();
        }, 550);
      }

      skipIntro.addEventListener('click', closeIntro);
      intro.addEventListener('playing', () => clearTimeout(startupLimit), { once: true });
      intro.addEventListener('ended', closeIntro, { once: true });
      intro.addEventListener('error', closeIntro, { once: true });
      reducedMotion.addEventListener('change', event => {
        if (event.matches) closeIntro();
      });
      window.addEventListener('keydown', skipOnEscape);
      function setIntroSound(enabled, remember = false) {
        intro.muted = !enabled;
        introSound.setAttribute('aria-pressed', String(enabled));
        introSound.textContent = enabled
          ? localText('Disattiva audio', 'Mute sound')
          : localText('Attiva audio', 'Enable sound');
        if (remember) {
          try { localStorage.setItem('a2m-intro-sound', enabled ? 'on' : 'off'); } catch {}
        }
      }

      let soundChangeCount = 0;
      introSound.addEventListener('click', () => {
        const soundChange = ++soundChangeCount;
        setIntroSound(intro.muted, true);
        intro.play().catch(() => {
          if (soundChange !== soundChangeCount || loader.classList.contains('is-leaving')) return;
          setIntroSound(false);
          intro.play().catch(closeIntro);
        });
      });
      intro.volume = .72;
      let wantsIntroSound = true;
      try { wantsIntroSound = localStorage.getItem('a2m-intro-sound') !== 'off'; } catch {}
      setIntroSound(wantsIntroSound);
      intro.src = '/assets/a2m-intro-hd.mp4';
      intro.play().catch(() => {
        if (soundChangeCount || loader.classList.contains('is-leaving')) return;
        setIntroSound(false);
        intro.play().catch(closeIntro);
      });
    }
    reducedMotion.addEventListener('change', syncHeroMotion);
    syncHeroMotion();
    const header=document.querySelector('.site-header');
    const menu=document.getElementById('menuToggle');
    const nav=document.getElementById('navLinks');
    const onScroll=()=>header.classList.toggle('scrolled',window.scrollY>20);
    window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
    menu.addEventListener('click',()=>{const opened=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(opened));menu.setAttribute('aria-label',opened ? localText('Chiudi menu', 'Close menu') : localText('Apri menu', 'Open menu'))});
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-label', localText('Apri menu', 'Open menu'));
    }));
    const terminal = document.querySelector('.stack-intro');
    const aiSection = document.getElementById('tecnologia-ai');
    let letters = [];
    let typingFrame = 0;
    let terminalVisible = false;

    function showFullTerminal() {
      cancelAnimationFrame(typingFrame);
      for (const letter of letters) letter.className = '';
    }

    function typeTerminal() {
      cancelAnimationFrame(typingFrame);
      if (reducedMotion.matches || !letters.length || !terminalVisible || document.hidden) return;
      for (const letter of letters) letter.className = 'terminal-pending';
      let start;
      let index = 0;
      function tick(now) {
        start ??= now;
        const next = Math.min(letters.length, Math.floor((now - start) / 19));
        letters[index]?.classList.remove('terminal-caret');
        while (index < next) letters[index++].classList.remove('terminal-pending');
        if (index < letters.length) {
          letters[index].classList.add('terminal-caret');
        }
        if (next < letters.length || now - start < letters.length * 19 + 2500) {
          typingFrame = requestAnimationFrame(tick);
        } else {
          typeTerminal();
        }
      }
      typingFrame = requestAnimationFrame(tick);
    }

    let waveFrame = 0;
    function updateWave() {
      waveFrame = 0;
      const rect = aiSection.getBoundingClientRect();
      const height = window.innerHeight;
      const center = rect.top + rect.height / 2;
      const reach = (height + rect.height) / 2;
      const distance = Math.abs(center - height / 2);
      const progress = Math.max(0, Math.min(1, (reach - distance) / (reach * .69)));
      const eased = progress * progress * (3 - 2 * progress);
      const radius = Math.hypot(rect.width, rect.height) / 2 + 2;
      aiSection.style.setProperty('--wave-radius', (radius * eased).toFixed(1) + 'px');
    }

    function scheduleWave() {
      if (!reducedMotion.matches && !waveFrame) waveFrame = requestAnimationFrame(updateWave);
    }

    if ('IntersectionObserver' in window) {
      document.documentElement.classList.add('motion-ready');
      if (!reducedMotion.matches) {
        const copy = terminal.textContent.trim();
        const accessibleCopy = document.createElement('span');
        accessibleCopy.className = 'terminal-accessible';
        accessibleCopy.textContent = copy;
        terminal.replaceChildren(accessibleCopy);
        letters = Array.from(copy, character => {
          const letter = document.createElement('span');
          letter.textContent = character;
          letter.className = 'terminal-pending';
          letter.setAttribute('aria-hidden', 'true');
          return letter;
        });
        terminal.append(...letters);
      }
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }, {threshold: .12});
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
      const metrics = document.querySelector('.reveal-metrics');
      const metricsObserver = new IntersectionObserver(([entry]) => {
        metrics.classList.toggle('visible', entry.isIntersecting);
      }, {threshold: .2, rootMargin: '-72px 0px 0px'});
      metricsObserver.observe(metrics);
      const terminalObserver = new IntersectionObserver(([entry]) => {
        terminalVisible = entry.isIntersecting;
        if (terminalVisible) typeTerminal();
        else showFullTerminal();
      });
      terminalObserver.observe(terminal);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) showFullTerminal();
        else typeTerminal();
      });
      window.addEventListener('scroll', scheduleWave, {passive: true});
      window.addEventListener('resize', scheduleWave);
      if ('ResizeObserver' in window) new ResizeObserver(scheduleWave).observe(aiSection);
      reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches) showFullTerminal();
        else { scheduleWave(); typeTerminal(); }
      });
      scheduleWave();
    } else {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    }

    const methodSteps = document.getElementById('method-steps');
    const methodToggle = document.querySelector('.method-loop-toggle');

    if ('IntersectionObserver' in window && typeof methodSteps.animate === 'function') {
      let stepsInView = false;
      let stepsPaused = false;
      let phaseAnimations = [];
      const phases = Array.from(methodSteps.querySelectorAll('.step'));

      function syncMethodLoop() {
        const enabled = !reducedMotion.matches;
        methodToggle.hidden = !enabled;
        methodToggle.textContent = stepsPaused ? localText('Avvia animazione', 'Start animation') : localText('Ferma animazione', 'Stop animation');
        if (!enabled || !stepsInView || stepsPaused || document.hidden) {
          phaseAnimations.forEach(animation => animation.cancel());
          phaseAnimations = [];
          return;
        }
        if (phaseAnimations.length) return;

        phaseAnimations = phases.map((phase, index) => {
          const entry = .005 + index * .035;
          return phase.animate([
            { opacity: 0, transform: 'translateY(10px)', offset: 0 },
            { opacity: 0, transform: 'translateY(10px)', offset: entry, easing: 'ease-out' },
            { opacity: 1, transform: 'translateY(0)', offset: entry + .045 },
            { opacity: 1, transform: 'translateY(0)', offset: .96, easing: 'ease-in' },
            { opacity: 0, transform: 'translateY(0)', offset: 1 }
          ], { duration: 14000, iterations: Infinity });
        });
      }

      const methodObserver = new IntersectionObserver(([entry]) => {
        stepsInView = entry.isIntersecting && entry.intersectionRatio >= .2;
        syncMethodLoop();
      }, { threshold: [.2], rootMargin: '-72px 0px 0px' });
      methodObserver.observe(methodSteps);
      methodToggle.addEventListener('click', () => {
        stepsPaused = !stepsPaused;
        syncMethodLoop();
      });
      reducedMotion.addEventListener('change', syncMethodLoop);
      document.addEventListener('visibilitychange', syncMethodLoop);
      syncMethodLoop();
    }

    const carousel = document.querySelector('[data-carousel]');
    const slides = Array.from(carousel.querySelectorAll('.plc-slide'));
    const caption = carousel.querySelector('[data-slide-caption]');
    const toggle = carousel.querySelector('[data-toggle]');
    const slideNames = [localText('TIA Portal · logica PLC', 'TIA Portal · PLC logic'), localText('TIA Portal · sequenza GRAPH', 'TIA Portal · GRAPH sequence'), 'RSLogix 5000 · Structured Text'];
    let activeSlide = 0;
    let slideTimer;
    let carouselVisible = false;
    let slidesPaused = reducedMotion.matches;

    function showSlide(offset) {
      activeSlide = (activeSlide + offset + slides.length) % slides.length;
      slides.forEach((slide, index) => { slide.hidden = index !== activeSlide; });
      caption.textContent = slideNames[activeSlide];
    }

    function syncCarousel() {
      clearInterval(slideTimer);
      if (carouselVisible && !slidesPaused && !document.hidden) {
        slideTimer = setInterval(() => showSlide(1), 4500);
      }
      const label = slidesPaused ? localText('Avvia le slide', 'Play slideshow') : localText('Metti in pausa le slide', 'Pause slideshow');
      toggle.textContent = slidesPaused ? '▶' : 'Ⅱ';
      toggle.setAttribute('aria-label', label);
      toggle.title = label;
    }

    for (const [selector, offset] of [['[data-prev]', -1], ['[data-next]', 1]]) {
      carousel.querySelector(selector).addEventListener('click', () => {
        showSlide(offset);
        syncCarousel();
      });
    }
    toggle.addEventListener('click', () => {
      slidesPaused = !slidesPaused;
      syncCarousel();
    });
    carousel.querySelector('.slide-controls').hidden = false;
    document.addEventListener('visibilitychange', syncCarousel);
    reducedMotion.addEventListener('change', () => {
      slidesPaused = reducedMotion.matches;
      syncCarousel();
    });

    const phone = document.querySelector('.weld-phone-video');
    const cellVideo = document.querySelector('.showcase-video');
    const videosInView = new Set();
    let cellPaused = false;

    function syncShowcaseVideos() {
      for (const video of [phone, cellVideo]) {
        const canPlay = videosInView.has(video) && !reducedMotion.matches && !document.hidden;
        if (canPlay && (video !== cellVideo || !cellPaused)) video.play().catch(() => {});
        else if (!videosInView.has(video) || document.hidden || video === phone) video.pause();
      }
    }

    cellVideo.addEventListener('pause', () => {
      if (videosInView.has(cellVideo) && !reducedMotion.matches && !document.hidden) cellPaused = true;
    });
    cellVideo.addEventListener('play', () => { cellPaused = false; });

    if ('IntersectionObserver' in window) {
      const mediaObserver = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.target === carousel) carouselVisible = entry.isIntersecting;
          else if (entry.isIntersecting) videosInView.add(entry.target);
          else videosInView.delete(entry.target);
        }
        syncCarousel();
        syncShowcaseVideos();
      }, {threshold: .12});
      mediaObserver.observe(carousel);
      mediaObserver.observe(phone);
      mediaObserver.observe(cellVideo);
    }
    reducedMotion.addEventListener('change', syncShowcaseVideos);
    document.addEventListener('visibilitychange', syncShowcaseVideos);
    syncCarousel();

    document.getElementById('year').textContent=new Date().getFullYear();
    document.getElementById('contactForm').addEventListener('submit', async event => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const status = document.getElementById('formStatus');
      const text = [
        localText('Richiesta di contatto A²M Automation', 'A²M Automation project enquiry'),
        '',
        localText('Nome', 'Name') + ': ' + data.get('name'),
        localText('Azienda', 'Company') + ': ' + (data.get('company') || localText('Non indicata', 'Not provided')),
        'Email: ' + data.get('email'),
        '',
        localText('Progetto:', 'Project:'),
        data.get('message')
      ].join('\n');
      try {
        await navigator.clipboard.writeText(text);
        status.textContent = localText(
          'Richiesta copiata. Puoi incollarla nel tuo messaggio email.',
          'Enquiry copied. You can paste it into your email.'
        );
      } catch {
        status.textContent = localText(
          'Modulo di anteprima: l’invio email verrà attivato nella versione definitiva.',
          'Preview form: email delivery will be enabled in the final version.'
        );
      }
    });
