(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.nav');

  const closeMenu = () => {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  };

  if (menuButton && navigation) {
    menuButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      if (open) closeMobileToc();
      menuButton.setAttribute('aria-expanded', String(open));
      navigation.classList.toggle('is-open', open);
    });
    navigation.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('click', (event) => {
      if (!navigation.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 820) closeMenu();
    });
  }

  const mobileToc = document.querySelector('[data-mobile-toc]');
  const tocButton = mobileToc?.querySelector('[data-toc-toggle]');
  const tocPanel = mobileToc?.querySelector('[data-toc-panel]');

  const closeMobileToc = () => {
    if (!tocButton || !tocPanel) return;
    tocButton.setAttribute('aria-expanded', 'false');
    tocButton.setAttribute('aria-label', tocButton.dataset.openLabel);
    tocPanel.setAttribute('aria-hidden', 'true');
    tocPanel.classList.remove('is-open');
  };

  if (mobileToc && tocButton && tocPanel) {
    tocButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = tocButton.getAttribute('aria-expanded') !== 'true';
      if (open) closeMenu();
      tocButton.setAttribute('aria-expanded', String(open));
      tocButton.setAttribute('aria-label', open ? tocButton.dataset.closeLabel : tocButton.dataset.openLabel);
      tocPanel.setAttribute('aria-hidden', String(!open));
      tocPanel.classList.toggle('is-open', open);
    });
    tocPanel.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMobileToc();
    });
    document.addEventListener('click', (event) => {
      if (!mobileToc.contains(event.target)) closeMobileToc();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMobileToc();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 560) closeMobileToc();
    });
  }

  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    const updateVisibility = () => {
      const visible = window.scrollY > 120;
      backToTop.classList.toggle('is-visible', visible);
      backToTop.setAttribute('aria-hidden', visible ? 'false' : 'true');
    };
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
  }

  const faqDetails = [...document.querySelectorAll('.faq-list details')];
  let bulkFaqChange = false;

  const getTocTop = () => {
    const sidebar = document.querySelector('.faq-sidebar, .version-sidebar');
    if (!sidebar || window.getComputedStyle(sidebar).display === 'none') return 16;
    return Math.max(0, Number.parseFloat(window.getComputedStyle(sidebar).top) || 0);
  };

  const desktopFaqTocIsVisible = () => {
    const sidebar = document.querySelector('.faq-sidebar');
    return Boolean(sidebar && window.getComputedStyle(sidebar).display !== 'none');
  };

  faqDetails.forEach((details) => {
    details.addEventListener('toggle', () => {
      if (!details.open || bulkFaqChange) return;
      window.requestAnimationFrame(() => {
        const top = details.getBoundingClientRect().top + window.scrollY - getTocTop();
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      });
    });
  });

  const setAllFaqDetails = (open) => {
    if (!faqDetails.length) return;
    bulkFaqChange = true;
    faqDetails.forEach((details) => { details.open = open; });
    closeMobileToc();
    window.setTimeout(() => {
      bulkFaqChange = false;
      window.dispatchEvent(new Event('scroll'));
    }, 100);
  };

  document.querySelectorAll('[data-faq-expand-all]').forEach((button) => {
    button.addEventListener('click', () => setAllFaqDetails(true));
  });
  document.querySelectorAll('[data-faq-collapse-all]').forEach((button) => {
    button.addEventListener('click', () => setAllFaqDetails(false));
  });

  const scrollSections = [...document.querySelectorAll('[data-scroll-section]')];
  const scrollLinks = [...document.querySelectorAll('[data-scroll-nav] a')];
  if (scrollSections.length) {
    let scheduled = false;
    let pinnedSectionId = null;

    const setActiveSection = (id) => {
      scrollLinks.forEach((link) => link.classList.toggle('is-active', link.hash === `#${id}`));
    };

    const updateActiveSection = () => {
      scheduled = false;
      if (pinnedSectionId) {
        setActiveSection(pinnedSectionId);
        return;
      }
      let active = scrollSections[0];
      const trackingLine = Math.max(getTocTop(), window.innerHeight * 0.55);
      scrollSections.forEach((section) => {
        const trackingTarget = section.matches('.faq-group')
          ? section.querySelector('.faq-list details') || section
          : section;
        if (trackingTarget.getBoundingClientRect().top <= trackingLine) active = section;
      });

      setActiveSection(active.id);
    };

    const scheduleActiveSectionUpdate = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(updateActiveSection);
    };

    const scrollToSection = (id) => {
      const target = document.getElementById(id);
      if (!target) return;
      pinnedSectionId = id;
      const alignmentTarget = target.matches('.faq-group') && desktopFaqTocIsVisible()
        ? target.querySelector('.faq-list details') || target
        : target;
      const top = alignmentTarget.getBoundingClientRect().top + window.scrollY - getTocTop();
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      setActiveSection(id);
    };

    scrollLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const id = link.hash.slice(1);
        window.history.replaceState(null, '', `#${id}`);
        scrollToSection(id);
      });
    });

    window.addEventListener('scroll', scheduleActiveSectionUpdate, { passive: true });
    window.addEventListener('resize', scheduleActiveSectionUpdate);
    window.addEventListener('hashchange', scheduleActiveSectionUpdate);
    const releasePinnedSection = () => {
      if (!pinnedSectionId) return;
      pinnedSectionId = null;
      scheduleActiveSectionUpdate();
    };
    window.addEventListener('wheel', releasePinnedSection, { passive: true });
    window.addEventListener('touchstart', releasePinnedSection, { passive: true });
    window.addEventListener('keydown', (event) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
        releasePinnedSection();
      }
    });
    updateActiveSection();
  }

  const interpointValues = document.querySelector('[data-interpoint-values]');
  const interpointChart = document.querySelector('[data-interpoint-chart]');
  const interpointTabs = [...document.querySelectorAll('[data-interpoint-mode]')];
  if (interpointValues && interpointChart && interpointTabs.length) {
    const grid = '<path class="chart-grid" d="M45 22V160M45 160H410M45 125H410M45 90H410M45 55H410M135 22V160M225 22V160M315 22V160M405 22V160"/>';
    const modes = {
      linear: {
        label: 'График линейной интерполяции',
        values: [['X₁', '0'], ['Y₁', '10'], ['X₂', '20'], ['Y₂', '50'], ['X', '15', 'demo-target'], ['Y', '40', 'demo-result-value']],
        chart: `${grid}<path class="chart-line" d="M58 147L392 35"/><circle cx="58" cy="147" r="6"/><circle cx="392" cy="35" r="6"/><circle class="chart-target" cx="309" cy="63" r="7"/><text x="62" y="141">(0; 10)</text><text x="319" y="82">(15; 40)</text><text x="326" y="29">(20; 50)</text>`
      },
      quadratic: {
        label: 'График квадратичной интерполяции',
        values: [['X₁', '0'], ['Y₁', '10'], ['X₂', '10'], ['Y₂', '20'], ['X₃', '20'], ['Y₃', '50'], ['X', '15', 'demo-target'], ['Y', '32,5', 'demo-result-value']],
        chart: `${grid}<path class="chart-line" d="M58 147Q224 136 392 35"/><circle cx="58" cy="147" r="6"/><circle cx="225" cy="119" r="6"/><circle cx="392" cy="35" r="6"/><circle class="chart-target" cx="309" cy="84" r="7"/><text x="64" y="140">(0; 10)</text><text x="234" y="114">(10; 20)</text><text x="315" y="102">(15; 32,5)</text><text x="325" y="29">(20; 50)</text>`
      },
      bilinear: {
        label: 'Схема билинейной интерполяции',
        values: [['X₁', '0'], ['X₂', '20'], ['Y₁', '0'], ['Y₂', '10'], ['X', '15', 'demo-target'], ['Y', '6', 'demo-target'], ['P', '31', 'demo-result-value']],
        chart: `${grid}<polygon class="chart-surface" points="78,142 360,142 360,42 78,42"/><path class="chart-line chart-line-thin" d="M78 142L360 42M78 42L360 142"/><circle cx="78" cy="142" r="6"/><circle cx="360" cy="142" r="6"/><circle cx="78" cy="42" r="6"/><circle cx="360" cy="42" r="6"/><circle class="chart-target" cx="290" cy="82" r="7"/><text x="83" y="136">Q₁₁ = 10</text><text x="287" y="136">Q₂₁ = 30</text><text x="83" y="36">Q₁₂ = 20</text><text x="287" y="36">Q₂₂ = 40</text><text x="300" y="101">P(15; 6) = 31</text>`
      }
    };

    const showMode = (name) => {
      const mode = modes[name] || modes.linear;
      interpointTabs.forEach((tab) => tab.setAttribute('aria-selected', String(tab.dataset.interpointMode === name)));
      interpointValues.replaceChildren(...mode.values.map(([label, value, className]) => {
        const field = document.createElement('span');
        if (className) field.className = className;
        field.append(document.createTextNode(`${label} `));
        const number = document.createElement('b');
        number.textContent = value;
        field.append(number);
        return field;
      }));
      interpointChart.innerHTML = mode.chart;
      interpointChart.setAttribute('aria-label', mode.label);
    };

    interpointTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => showMode(tab.dataset.interpointMode));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const next = interpointTabs[(index + direction + interpointTabs.length) % interpointTabs.length];
        next.focus();
        showMode(next.dataset.interpointMode);
      });
    });
    showMode('linear');
  }

  const demos = [...document.querySelectorAll('[data-calc-demo]')];
  if (!demos.length) return;

  const examples = [
    { expression: '100 + 10%', result: '110' },
    { expression: '2^(3^2)', result: '512' },
    { expression: '25 MPa * 300 mm^2', result: '7,5 kN' },
    { expression: 'log2(1024)', result: '10' }
  ];

  const render = (expression, result = '', confirmed = false) => {
    demos.forEach((demo) => {
      const expressionNode = demo.querySelector('[data-demo-expression]');
      const resultNode = demo.querySelector('[data-demo-result]');
      if (expressionNode) expressionNode.textContent = expression;
      if (resultNode) {
        resultNode.textContent = result ? `= ${result}` : '';
        resultNode.classList.toggle('is-confirmed', confirmed);
      }
    });
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    render(examples[2].expression, examples[2].result, false);
    return;
  }

  const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  const waitForVisiblePage = async () => {
    while (document.hidden) await wait(250);
  };

  const animate = async () => {
    let index = 0;
    while (true) {
      await waitForVisiblePage();
      const example = examples[index];
      render('');
      await wait(360);

      for (let length = 1; length <= example.expression.length; length += 1) {
        await waitForVisiblePage();
        render(example.expression.slice(0, length));
        await wait(64 + Math.random() * 28);
      }

      render(example.expression, example.result, false);
      await wait(720);
      render(example.expression, example.result, true);
      await wait(1450);
      index = (index + 1) % examples.length;
    }
  };

  animate();
})();
