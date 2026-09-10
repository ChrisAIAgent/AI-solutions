import '../scss/tac-home.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Rive } from '@rive-app/canvas';
import { content } from '../data/tac-home-content.js';
import { skills } from '../data/tac-skills.js';
import { mountTacAssistant } from './tac-assistant.js';

gsap.registerPlugin(ScrollTrigger);

let tacLenis;

function scrollToTacSection(target) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;
  if (tacLenis) {
    tacLenis.scrollTo(element, { offset: -94, duration: 1.05, lock: false });
    return;
  }
  element.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

const icon = (name) => `<i class="fa-solid ${name}" aria-hidden="true"></i>`;
const link = ({ label, href = '#' }, className = 'tac-button tac-button--dark') => `<a class="${className}" href="${href}">${label}<span aria-hidden="true">↗</span></a>`;

function renderHeader() {
  const header = document.querySelector('.tac-header');
  const renderNavChild = (item, child) => {
    const label = typeof child === 'string' ? child : child.label;
    const href = typeof child === 'string' ? item.target : child.href;
    const external = /^https?:\/\//i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${href}" role="menuitem"${external}>${label}<span>↗</span></a>`;
  };
  header.innerHTML = `
    <nav class="tac-nav" aria-label="Primary navigation">
      <a class="tac-brand" href="#top" aria-label="TAC home"><img src="/assets/tac/tac-mark.png" alt="TAC"><span>TAC<span class="tac-brand-dot">.</span>AI</span></a>
      <button class="tac-menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false">${icon('fa-bars')}</button>
      <div class="tac-nav-links" id="navLinks">
        ${content.nav.map((item, index) => `<div class="tac-nav-item">
          <button class="tac-nav-trigger" type="button" aria-expanded="false" aria-controls="navMenu${index}">${item.label} ${icon('fa-chevron-down')}</button>
          <div class="tac-nav-popover" id="navMenu${index}" role="menu">${item.items.map((child) => renderNavChild(item, child)).join('')}</div>
        </div>`).join('')}
      </div>
      <div class="tac-nav-actions"><a class="tac-signin" href="#contact">Sign in</a>${link({ label: content.download.navLabel, href: './pages/tacwork-download.html' }, 'tac-button tac-button--nav')}</div>
    </nav>`;
}

function renderHero() {
  document.querySelector('.tac-hero').innerHTML = `
    <div class="tac-hero-aurora" aria-hidden="true"><span></span><span></span><span></span></div>
    <div class="tac-hero-grid" aria-hidden="true"></div>
    <div class="tac-hero-content section-shell">
      <div class="tac-hero-copy"><p class="tac-eyebrow hero-reveal"><span></span>${content.hero.eyebrow}</p><h1 class="hero-reveal">${content.hero.title}</h1><p class="tac-lead hero-reveal">${content.hero.lead}</p><div class="tac-hero-actions hero-reveal">${link(content.hero.primary)}${link(content.hero.secondary, 'tac-button tac-button--light')}</div></div>
      <article class="tac-artemis-card" id="artemisCard" tabindex="0" aria-label="TAC Agent Platform visual preview">
        <div class="tac-artemis-copy"><p>THE TAC AI AGENT PLATFORM</p><h2>Meet <span>{ TAC }</span></h2><b>NEW</b><p class="tac-artemis-description">An AI-programmable foundation for building dependable agent workflows across the enterprise.</p></div>
        <div class="tac-artemis-visual" aria-hidden="true"><img class="tac-artemis-fallback" src="/assets/tac/industrial-hero.png" alt=""><video class="tac-artemis-video" muted loop playsinline preload="metadata" poster="/assets/tac/industrial-hero.png"><source src="/videos/planet-earth.mp4" type="video/mp4"></video><div class="tac-artemis-bloom"></div><div class="tac-artemis-grid"></div><div class="tac-artemis-orbit tac-artemis-orbit--one"></div><div class="tac-artemis-orbit tac-artemis-orbit--two"></div></div>
        <span class="tac-artemis-arrow">↗</span>
      </article>
      <div class="tac-feature-cards" aria-label="TAC application models">${content.hero.featureCards.map((card, index) => `<article class="tac-feature-card tac-feature-card--${index + 1}"><div class="tac-feature-card-heading"><h2>${card.title}</h2><span>↗</span></div><p>${card.text}</p>${featureCardVisual(index)}</article>`).join('')}</div>
    </div>`;
}

function setupHeroVideo() {
  const card = document.querySelector('#artemisCard');
  const video = card?.querySelector('.tac-artemis-video');
  if (!card || !video) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isVisible = true;
  const play = () => {
    if (!reduceMotion && isVisible && !document.hidden) video.play().catch(() => card.classList.remove('is-video-ready'));
  };
  video.addEventListener('canplay', () => { card.classList.add('is-video-ready'); play(); }, { once: true });
  video.addEventListener('error', () => card.classList.remove('is-video-ready'), { once: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); else play(); });
  new IntersectionObserver(([entry]) => { isVisible = entry.isIntersecting; if (isVisible) play(); else video.pause(); }, { threshold: .12 }).observe(card);
}

function featureCardVisual(index) {
  const sources = ['prebuilt.riv', 'accelerators.riv', 'tailored.riv'];
  const labels = ['Pre-built Applications animation', 'Application Accelerators animation', 'Tailored Applications animation'];
  return `<div class="tac-feature-rive" aria-hidden="true"><canvas class="tac-rive-canvas" data-rive-src="/assets/tac/rive/${sources[index]}" aria-label="${labels[index]}"></canvas><div class="tac-feature-fallback">${featureCardFallback(index)}</div></div>`;
}

function featureCardFallback(index) {
  if (index === 0) return '<div class="tac-feature-ui tac-feature-ui--search"><div class="tac-feature-search"><span>⌕</span><b>Banking</b><i>Automation</i></div><div class="tac-feature-cursor">↗</div></div>';
  if (index === 1) return '<div class="tac-feature-ui tac-feature-ui--accelerator"><div class="tac-feature-stack"><span></span><span></span><span></span><span></span></div><div class="tac-feature-orb">TAC</div></div>';
  return '<div class="tac-feature-ui tac-feature-ui--code"><div class="tac-feature-code-line"><b>def</b> route_request(<i>context</i>):</div><div class="tac-feature-code-line">&nbsp;&nbsp;<b>return</b> tac.resolve(context)</div><button type="button">▶ RUN</button><div class="tac-feature-code-cursor"></div></div>';
}

function setupRiveAnimations() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const instances = [];

  document.querySelectorAll('.tac-rive-canvas[data-rive-src]').forEach((canvas) => {
    const wrapper = canvas.closest('.tac-feature-rive');
    let instance;
    instance = new Rive({
      src: canvas.dataset.riveSrc,
      canvas,
      autoplay: !reduceMotion,
      onLoad: () => {
        instance.resizeDrawingSurfaceToCanvas();
        wrapper?.classList.add('is-loaded');
      },
      onLoadError: () => {
        wrapper?.classList.add('has-error');
      }
    });
    instances.push(instance);
  });

  document.addEventListener('visibilitychange', () => {
    instances.forEach((instance) => {
      if (document.hidden) instance.pause();
      else if (!reduceMotion) instance.play();
    });
  });
}

function renderTrust() {
  const [first] = content.industries;
  document.querySelector('.tac-trust').innerHTML = `
    <div class="tac-section-heading reveal"><p class="tac-eyebrow"><span></span>INDUSTRIES</p><h2>Built for the work enterprises need to move.</h2><p>Start with the context of the industry, then design the AI experience around the outcome.</p></div>
    <div class="tac-industry-tabs reveal" role="tablist" aria-label="Industries">${content.industries.map((item, index) => `<button role="tab" id="industry-${item.id}" aria-selected="${index === 0}" aria-controls="industry-panel" data-industry="${item.id}" tabindex="${index === 0 ? '0' : '-1'}">${item.label}</button>`).join('')}</div>
    <article class="tac-industry-panel reveal tone-${first.tone}" id="industry-panel" role="tabpanel" aria-labelledby="industry-${first.id}">
      <div><p class="tac-panel-index">01 / INDUSTRY</p><h3>${first.title}</h3><p>${first.text}</p>${link({ label: 'EXPLORE INDUSTRY', href: '#applications' }, 'tac-text-link')}</div>
      <div class="tac-logo-cloud" aria-label="Industry capabilities">${first.logos.map((label, i) => `<span style="--delay:${i}">${label}</span>`).join('')}</div>
    </article>`;
}

function applicationVisual(index) {
  const screens = ['banking', 'healthcare', 'retail', 'it', 'hr', 'recruiting'];
  const item = screens[index] || screens[0];
  return `<div class="tac-reference-screen" aria-hidden="true"><img src="/assets/tac/reference-apps/${item}.webp" loading="lazy" alt=""></div>`;
}

function renderApplications() {
  const products = document.querySelector('.tac-products');
  products.innerHTML = `
    <div class="tac-products-top reveal"><div><p class="tac-eyebrow"><span></span>AI SOLUTIONS</p><h2>Drive faster business outcomes in customer service and employee productivity.</h2></div><p>Choose an application model that matches where your organization is today.</p></div>
    <div class="tac-product-layout reveal"><div class="tac-product-tabs" role="tablist" aria-label="Solution models">${content.productTabs.map((tab, index) => `<button role="tab" id="product-${tab.id}" aria-controls="product-panel" aria-selected="${index === 0}" data-product="${tab.id}" tabindex="${index === 0 ? '0' : '-1'}"><span>${String(index + 1).padStart(2, '0')}</span>${tab.label}${tab.id === 'platform-tab' ? '<b class="tac-tab-new">NEW</b>' : ''}</button>`).join('')}</div><div class="tac-product-panel" id="product-panel" role="tabpanel"></div></div>`;
  setProductPanel('prebuilt');
}

function prebuiltMarkup() {
  return `<div class="tac-product-panel-heading"><p class="tac-eyebrow"><span></span>PRE-BUILT APPLICATIONS</p><h3>Use purpose-built agentic AI applications</h3><p>We solve the most urgent industry and enterprise challenges with regulation-approved applications.</p></div><div class="tac-application-grid">${content.applications.map((item, index) => `<article class="tac-application-card"><div><h4>${item.title.replace(item.accent, `<em>${item.accent}</em>`)}</h4><p>${item.text}</p><div class="tac-card-actions">${item.actions.map((itemAction, actionIndex) => link(itemAction, actionIndex ? 'tac-mini-link' : 'tac-mini-button')).join('')}</div></div>${applicationVisual(index)}</article>`).join('')}</div>`;
}

function acceleratorMarkup() {
  return `<div class="tac-product-panel-heading"><p class="tac-eyebrow"><span></span>APPLICATION ACCELERATORS</p><h3>${content.accelerators.title}</h3><p>${content.accelerators.lead}</p></div><div class="tac-accelerator-showcase"><div class="tac-integration-scene" aria-hidden="true"><div class="tac-integration-core"><span>TAC</span><strong>ORCHESTRATOR</strong><i></i><i></i><i></i></div><div class="tac-integration-node tac-integration-node--one">CRM</div><div class="tac-integration-node tac-integration-node--two">KNOWLEDGE</div><div class="tac-integration-node tac-integration-node--three">POLICY</div><div class="tac-integration-node tac-integration-node--four">WORKFLOW</div><svg class="tac-integration-lines" viewBox="0 0 560 330" preserveAspectRatio="none"><path d="M280 165 L100 90 M280 165 L450 82 M280 165 L450 256 M280 165 L100 248" /></svg></div><div class="tac-accelerator-grid">${content.accelerators.items.map(([title, text], index) => `<article><span>0${index + 1}</span><h4>${title}</h4><p>${text}</p><a href="#contact">EXPLORE <b>↗</b></a></article>`).join('')}</div></div>`;
}

function tailoredMarkup() {
  return `<div class="tac-product-panel-heading"><p class="tac-eyebrow"><span></span>TAILORED APPLICATIONS</p><h3>Build experiences around the work that makes your organization distinct.</h3><p>Use a platform foundation with the flexibility to meet your own goals and operating realities.</p></div><div class="tac-tailored-showcase"><div class="tac-code-window" aria-label="TAC workflow code preview"><div class="tac-code-window-top"><span></span><span></span><span></span><b>tac-workflow.ts</b></div><pre><code><span>01</span><i>const</i> workflow = <em>tac</em>.agent({<br><span>02</span>  intent: <strong>'resolve_request'</strong>,<br><span>03</span>  context: <em>enterprise.knowledge</em>,<br><span>04</span>  guardrails: [<strong>'policy'</strong>, <strong>'review'</strong>]<br><span>05</span>});</code></pre><button type="button" class="tac-run-button" data-run-workflow>▶ RUN</button><p class="tac-code-result" aria-live="polite">Ready to execute</p></div><div class="tac-tailored-grid">${content.tailored.map((item, index) => `<article><div class="tac-tailored-mark">0${index + 1}</div><div><h4>${item.title}</h4><p>${item.text}</p><div>${item.links.map((label) => `<a class="tac-mini-link" href="#contact">${label} <b>↗</b></a>`).join('')}</div></div></article>`).join('')}</div></div>`;
}

function platformMarkup() {
  return `<div class="tac-product-panel-heading"><p class="tac-eyebrow"><span></span>AGENT PLATFORM</p><h3>A dependable layer for AI work that needs to operate.</h3><p>Move from isolated pilots to intentional, governed experiences across teams and systems.</p></div><div class="tac-platform-brief"><div class="tac-platform-motion" aria-hidden="true"><img src="/assets/tac/logo-system.png" alt=""><span></span><span></span></div><div><p>PLATFORM BRIEF</p><h4>Bring your people, systems, and AI experiences into one operating model.</h4>${link({ label: 'EXPLORE THE PLATFORM', href: '#platform' }, 'tac-text-link')}</div></div>`;
}

function setProductPanel(id) {
  const panel = document.querySelector('#product-panel');
  if (!panel) return;
  panel.innerHTML = id === 'prebuilt' ? prebuiltMarkup() : id === 'accelerators' ? acceleratorMarkup() : id === 'tailored' ? tailoredMarkup() : platformMarkup();
  setupProductDemos(panel);
}

function setupProductDemos(panel) {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const chatBubbles = panel.querySelectorAll('.tac-chat-visual--animated .tac-chat-bubble');
    if (chatBubbles.length) gsap.fromTo(chatBubbles, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .36, stagger: .17, ease: 'power2.out' });
    const integrationItems = panel.querySelectorAll('.tac-integration-node, .tac-integration-core');
    if (integrationItems.length) gsap.fromTo(integrationItems, { autoAlpha: 0, scale: .82 }, { autoAlpha: 1, scale: 1, duration: .48, stagger: .1, ease: 'back.out(1.4)' });
  }
  const runButton = panel.querySelector('[data-run-workflow]');
  runButton?.addEventListener('click', () => {
    const result = panel.querySelector('.tac-code-result');
    runButton.classList.add('is-running');
    runButton.textContent = '● RUNNING';
    window.setTimeout(() => {
      runButton.classList.remove('is-running');
      runButton.textContent = '✓ COMPLETE';
      result.textContent = 'Workflow completed · policy checks passed';
      result.classList.add('is-complete');
    }, 720);
  });
}

function renderCapabilities() {
  const active = content.capabilities[0];
  document.querySelector('.tac-capabilities').innerHTML = `
    <div class="tac-capability-intro reveal"><p class="tac-eyebrow"><span></span>AGENT PLATFORM</p><h2>Make AI useful at every stage of the operating cycle.</h2></div>
    <div class="tac-capability-workspace reveal"><div class="tac-capability-display" id="capabilityPanel"><span>${active.label.toUpperCase()}</span><h3>${active.headline}</h3><p>${active.text}</p><strong>${active.metric}</strong></div><div class="tac-capability-gallery"><div class="tac-capability-gallery-head"><p>EXPLORE CAPABILITIES</p><div><button class="tac-capability-nav" type="button" data-capability-direction="prev" aria-label="Show previous capabilities">←</button><button class="tac-capability-nav" type="button" data-capability-direction="next" aria-label="Show next capabilities">→</button></div></div><div class="tac-capability-tabs" role="tablist" aria-label="Platform capabilities"><div class="tac-capability-track">${content.capabilities.map((item, index) => `<button role="tab" data-capability="${item.id}" aria-selected="${index === 0}" tabindex="${index === 0 ? '0' : '-1'}"><span>${String(index + 1).padStart(2, '0')}</span><b>${item.label}</b><i>${item.metric}</i></button>`).join('')}</div></div><p class="tac-capability-gallery-index"><span>01</span> / ${String(content.capabilities.length).padStart(2, '0')}</p></div></div>`;
}

function renderReports() {
  const first = content.reports[0];
  document.querySelector('.tac-reports').innerHTML = `
    <div class="tac-reports-tabs reveal" role="tablist" aria-label="TAC reports">${content.reports.map((report, index) => `<button role="tab" data-report="${report.id}" aria-selected="${index === 0}" tabindex="${index === 0 ? '0' : '-1'}">${report.label}</button>`).join('')}</div><article class="tac-report-card reveal" id="reportPanel"><div class="tac-report-visual"><span>TAC<br>INSIGHT<br>01</span></div><div><p class="tac-eyebrow"><span></span>TAC INSIGHT</p><h2>${first.title}</h2><p>${first.text}</p>${link({ label: 'REGISTER INTEREST', href: '#contact' }, 'tac-text-link')}</div></article>`;
}

function renderSkillMarketplaceFeature() {
  const feature = content.skillsMarketplace;
  const featuredSkills = feature.featuredIds.map((id) => skills.find((skill) => skill.id === id)).filter(Boolean);
  document.querySelector('.tac-skills-feature').innerHTML = `
    <div class="tac-skills-feature-heading reveal">
      <p class="tac-eyebrow"><span></span>${feature.eyebrow}</p>
      <div><h2>${feature.title}</h2><p>${feature.text}</p></div>
    </div>
    <div class="tac-skills-feature-panel reveal">
      <div class="tac-skills-feature-panel-top"><span>COMMUNITY SKILLS</span><span>PUBLIC SOURCE DIRECTORY</span></div>
      <div class="tac-skills-feature-grid">${featuredSkills.map((skill, index) => `<a class="tac-skill-feature-card" href="${feature.route}#${skill.id}"><div class="tac-skill-feature-card-meta"><span>0${index + 1}</span><span>${skill.category}</span></div><h3>${skill.name}</h3><p>${skill.description}</p><div class="tac-skill-feature-tags">${skill.tags.map((tag) => `<span>${tag}</span>`).join('')}</div><b aria-hidden="true">↗</b></a>`).join('')}</div>
      <a class="tac-skills-feature-cta" href="${feature.route}">Explore Skill Marketplace <b aria-hidden="true">↗</b></a>
    </div>`;
}

function renderPartners() {
  document.querySelector('.tac-partners').innerHTML = `<div class="tac-partners-copy reveal"><p class="tac-eyebrow"><span></span>ECOSYSTEM</p><h2>Technology is more useful when it fits the way work already gets done.</h2></div><div class="tac-partner-grid reveal">${content.partners.map((partner, index) => `<article><span>0${index + 1}</span><h3>${partner.name}</h3><p>${partner.text}</p><a href="#contact">PARTNER WITH TAC <b>↗</b></a></article>`).join('')}</div>`;
}

function renderInsights() {
  document.querySelector('.tac-insights').innerHTML = `<div class="tac-insights-heading reveal"><div><p class="tac-eyebrow"><span></span>AI INSIGHTS</p><h2>Ideas for AI that can hold up in the real world.</h2></div><a class="tac-text-link" href="#contact">VIEW ALL <b>↗</b></a></div><div class="tac-insights-grid reveal">${content.insights.map((item, index) => `<article><div class="tac-insight-image tac-insight-image--${index + 1}"><span>${String(index + 1).padStart(2, '0')}</span></div><p>${item.tag}<span>${item.date}</span></p><h3>${item.title}</h3><p class="tac-insight-body">${item.text}</p><a href="#contact" aria-label="Read ${item.title}">READ INSIGHT <b>↗</b></a></article>`).join('')}</div>`;
}

function renderContactAndFooter() {
  document.querySelector('.tac-contact').innerHTML = `<div class="section-shell tac-contact-content reveal"><p class="tac-eyebrow"><span></span>START A CONVERSATION</p><h2>Let’s build the next useful AI experience together.</h2><p>Tell TAC what work you want to make clearer, faster, or easier to govern.</p>${link({ label: 'GET IN TOUCH', href: '#top' }, 'tac-button tac-button--light')}</div>`;
  document.querySelector('.tac-footer').innerHTML = `<div class="section-shell tac-footer-grid"><div><a class="tac-brand tac-brand--footer" href="#top"><img src="/assets/tac/tac-mark.png" alt="TAC"><span>TAC<span class="tac-brand-dot">.</span>AI</span></a><p>Dependable AI operations for enterprise teams.</p></div><div><p>PRODUCT</p><a href="#applications">AI Applications</a><a href="#platform">Agent Platform</a><a href="#accelerators">Accelerators</a><a class="tac-footer-download" href="./pages/tacwork-download.html">${content.download.navLabel}</a></div><div><p>COMPANY</p><a href="#industries">Industries</a><a href="./pages/skills.html">Skills Marketplace</a><a href="#contact">Contact</a></div><div><p>RESOURCES</p><a href="#insights">Insights</a><a href="#reports">Reports</a><a href="#contact">Support</a></div></div><div class="section-shell tac-footer-bottom"><span>© 2026 TAC. All rights reserved.</span><span>TAC · A ChrisAI Brand</span></div>`;
}

function activateTab(group, id) {
  document.querySelectorAll(`[data-${group}]`).forEach((button) => {
    const active = button.dataset[group] === id;
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });
}

function setupRovingTabs(selector) {
  document.querySelectorAll(selector).forEach((tablist) => tablist.addEventListener('keydown', (event) => {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus();
    tabs[next].click();
  }));
}

function setupMotionController() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = window.matchMedia('(min-width: 981px)').matches;
  const heroItems = gsap.utils.toArray('.hero-reveal');
  if (reduceMotion) {
    heroItems.forEach((item) => { item.style.opacity = '1'; item.style.transform = 'none'; });
    return;
  }

  gsap.fromTo(heroItems, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: .8, stagger: .13, ease: 'power3.out', delay: .12 });
  gsap.fromTo('.tac-artemis-card', { autoAlpha: 0, y: 42, scale: .985 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1.05, ease: 'power3.out', delay: .28 });
  gsap.to('.tac-hero-aurora span', { xPercent: 10, yPercent: -8, scale: 1.12, duration: 9, stagger: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to('.tac-artemis-bloom', { scale: 1.18, opacity: .88, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to('.tac-artemis-orbit--one', { rotate: 360, duration: 20, ease: 'none', repeat: -1 });
  gsap.to('.tac-artemis-orbit--two', { rotate: -360, duration: 25, ease: 'none', repeat: -1 });

  document.addEventListener('visibilitychange', () => {
    gsap.globalTimeline.paused(document.hidden);
  });

  gsap.utils.toArray('.reveal').forEach((element) => gsap.fromTo(element, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: .78, ease: 'power3.out', immediateRender: false, scrollTrigger: { trigger: element, start: 'top 84%', once: true } }));
  gsap.utils.toArray('.tac-chat-visual--animated').forEach((element) => gsap.fromTo(element.querySelectorAll('.tac-chat-bubble'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .42, stagger: .2, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true } }));
  gsap.utils.toArray('.tac-integration-scene').forEach((element) => gsap.fromTo(element.querySelectorAll('.tac-integration-node, .tac-integration-core'), { autoAlpha: 0, scale: .82 }, { autoAlpha: 1, scale: 1, duration: .55, stagger: .12, ease: 'back.out(1.5)', scrollTrigger: { trigger: element, start: 'top 85%', once: true } }));

  const artemisCard = document.querySelector('#artemisCard');
  if (desktop && artemisCard) {
    artemisCard.addEventListener('pointermove', (event) => {
      const bounds = artemisCard.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      gsap.to(artemisCard.querySelector('.tac-artemis-visual'), { x: x * 16, y: y * 10, duration: .7, ease: 'power2.out', overwrite: true });
    });
    artemisCard.addEventListener('pointerleave', () => gsap.to(artemisCard.querySelector('.tac-artemis-visual'), { x: 0, y: 0, duration: .9, ease: 'power2.out' }));
    gsap.to('.tac-hero-aurora', { yPercent: 9, ease: 'none', scrollTrigger: { trigger: '.tac-hero', start: 'top top', end: 'bottom top', scrub: .85 } });
    gsap.to('.tac-capabilities::before', {});
  }

  if (desktop) {
    tacLenis = new Lenis({ lerp: .075, smoothWheel: true, syncTouch: false, autoRaf: true, wheelMultiplier: .9 });
    tacLenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);
    document.addEventListener('visibilitychange', () => { if (document.hidden) tacLenis?.stop(); else tacLenis?.start(); });
    window.addEventListener('pagehide', () => tacLenis?.destroy(), { once: true });
  }
}

function setupInteractions() {
  const header = document.querySelector('.tac-header');
  const menuToggle = document.querySelector('.tac-menu-toggle');
  const navLinks = document.querySelector('.tac-nav-links');
  const navTriggers = [...document.querySelectorAll('.tac-nav-trigger')];
  const closeNav = () => { navTriggers.forEach((trigger) => trigger.setAttribute('aria-expanded', 'false')); navLinks.classList.remove('is-open'); menuToggle?.setAttribute('aria-expanded', 'false'); };
  menuToggle?.addEventListener('click', () => { const isOpen = navLinks.classList.toggle('is-open'); menuToggle.setAttribute('aria-expanded', String(isOpen)); });
  navTriggers.forEach((trigger) => trigger.addEventListener('click', (event) => { event.stopPropagation(); const isOpen = trigger.getAttribute('aria-expanded') === 'true'; navTriggers.forEach((item) => item.setAttribute('aria-expanded', 'false')); trigger.setAttribute('aria-expanded', String(!isOpen)); }));
  document.addEventListener('click', (event) => { if (!header.contains(event.target)) closeNav(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeNav(); });
  window.addEventListener('scroll', () => header.classList.toggle('is-scrolled', window.scrollY > 16), { passive: true });
  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    const href = anchor?.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    history.pushState(null, '', href);
    scrollToTacSection(target);
  });

  document.querySelector('.tac-industry-tabs')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-industry]'); if (!button) return;
    const item = content.industries.find((industry) => industry.id === button.dataset.industry); if (!item) return;
    activateTab('industry', item.id);
    const panel = document.querySelector('#industry-panel');
    panel.className = `tac-industry-panel tone-${item.tone}`;
    panel.innerHTML = `<div><p class="tac-panel-index">${String(content.industries.indexOf(item) + 1).padStart(2, '0')} / INDUSTRY</p><h3>${item.title}</h3><p>${item.text}</p>${link({ label: 'EXPLORE INDUSTRY', href: '#applications' }, 'tac-text-link')}</div><div class="tac-logo-cloud">${item.logos.map((label, i) => `<span style="--delay:${i}">${label}</span>`).join('')}</div>`;
  });

  const productHashes = { prebuilt: '#Pre-built-Applications', accelerators: '#Application-Accelerators', tailored: '#Tailored-Applications', 'platform-tab': '#Agent-Platform' };
  const activateProduct = (id, { syncHash = false, scroll = false } = {}) => {
    if (!productHashes[id]) return;
    activateTab('product', id);
    setProductPanel(id);
    if (syncHash && window.location.hash !== productHashes[id]) history.replaceState(null, '', productHashes[id]);
    if (scroll) scrollToTacSection('#applications');
  };
  document.querySelector('.tac-product-tabs')?.addEventListener('click', (event) => { const button = event.target.closest('[data-product]'); if (button) activateProduct(button.dataset.product, { syncHash: true }); });
  document.querySelector('.tac-capability-tabs')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-capability]'); if (!button) return;
    const item = content.capabilities.find((capability) => capability.id === button.dataset.capability); if (!item) return;
    activateTab('capability', item.id);
    const capabilityPosition = content.capabilities.indexOf(item);
    const visibleCards = window.matchMedia('(max-width: 620px)').matches ? 1 : 3;
    const pageCount = Math.ceil(content.capabilities.length / visibleCards);
    capabilityPage = Math.floor(capabilityPosition / visibleCards);
    capabilityTrack.style.transform = `translateX(-${capabilityPage * (100 / pageCount)}%)`;
    capabilityIndex.textContent = String(capabilityPosition + 1).padStart(2, '0');
    const panel = document.querySelector('#capabilityPanel');
    gsap.to(panel, {
      autoAlpha: 0, x: -10, duration: .16, ease: 'power1.in', onComplete: () => {
        panel.innerHTML = `<span>${item.label.toUpperCase()}</span><h3>${item.headline}</h3><p>${item.text}</p><strong>${item.metric}</strong>`;
        gsap.fromTo(panel, { autoAlpha: 0, x: 10 }, { autoAlpha: 1, x: 0, duration: .38, ease: 'power2.out' });
      },
    });
  });
  const capabilityTrack = document.querySelector('.tac-capability-track');
  const capabilityIndex = document.querySelector('.tac-capability-gallery-index span');
  let capabilityPage = 0;
  const moveCapabilityGallery = (direction) => {
    if (!capabilityTrack) return;
    const visibleCards = window.matchMedia('(max-width: 620px)').matches ? 1 : 3;
    const pageCount = Math.ceil(content.capabilities.length / visibleCards);
    capabilityPage = (capabilityPage + direction + pageCount) % pageCount;
    capabilityTrack.style.transform = `translateX(-${capabilityPage * (100 / pageCount)}%)`;
    capabilityIndex.textContent = String(capabilityPage * visibleCards + 1).padStart(2, '0');
  };
  document.querySelectorAll('[data-capability-direction]').forEach((button) => button.addEventListener('click', () => moveCapabilityGallery(button.dataset.capabilityDirection === 'next' ? 1 : -1)));
  document.querySelector('.tac-reports-tabs')?.addEventListener('click', (event) => { const button = event.target.closest('[data-report]'); if (!button) return; const report = content.reports.find((item) => item.id === button.dataset.report); activateTab('report', report.id); document.querySelector('#reportPanel').innerHTML = `<div class="tac-report-visual"><span>TAC<br>INSIGHT<br>${String(content.reports.indexOf(report) + 1).padStart(2, '0')}</span></div><div><p class="tac-eyebrow"><span></span>${report.label}</p><h2>${report.title}</h2><p>${report.text}</p>${link({ label: 'REGISTER INTEREST', href: '#contact' }, 'tac-text-link')}</div>`; });

  setupRovingTabs('.tac-industry-tabs, .tac-product-tabs, .tac-capability-tabs, .tac-reports-tabs');
  const applyProductHash = (scroll = false) => {
    const normalizedHash = window.location.hash.toLowerCase();
    const match = Object.entries(productHashes).find(([, hash]) => hash.toLowerCase() === normalizedHash);
    if (match) activateProduct(match[0], { scroll });
  };
  applyProductHash(Boolean(window.location.hash));
  window.addEventListener('hashchange', () => applyProductHash(true));
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeader(); renderHero(); setupHeroVideo(); setupRiveAnimations(); renderTrust(); renderApplications(); renderCapabilities(); renderReports(); renderPartners(); renderInsights(); renderSkillMarketplaceFeature(); renderContactAndFooter(); setupInteractions(); setupMotionController(); mountTacAssistant(content);
});
