import { createHomeRenderer } from './tac-home-render.js';
import '../scss/tac-home.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { content } from '../data/tac-home-content.js';
import { mountTacAssistant } from './tac-assistant.js';
import { emailTac } from '../data/tac-contact.js';

gsap.registerPlugin(ScrollTrigger);

const { renderHeader, renderHero, renderTrust, renderApplications, prebuiltMarkup, acceleratorMarkup, tailoredMarkup, platformMarkup, renderCapabilities, renderReports, renderSkillMarketplaceFeature, renderPartners, renderInsights, renderContactAndFooter } = createHomeRenderer(document);
const link = ({ label, href = '#' }, className = 'tac-button tac-button--dark') => `<a class="${className}" href="${href}">${label}<span aria-hidden="true">↗</span></a>`;
let tacLenis;
const productHashes = { prebuilt: '#Pre-built-Applications', accelerators: '#Application-Accelerators', tailored: '#Tailored-Applications', 'platform-tab': '#Agent-Platform' };

function scrollToTacSection(target) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;
  if (tacLenis) {
    tacLenis.scrollTo(element, { offset: -94, duration: 1.05, lock: false });
    return;
  }
  element.scrollIntoView({ block: 'start', behavior: 'smooth' });
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

async function setupRiveAnimations() {
  let Rive;
  try { ({ Rive } = await import('@rive-app/canvas')); } catch { return; }
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
    const product = Object.entries(productHashes).find(([, hash]) => hash.toLowerCase() === href.toLowerCase())?.[0]
      || (href === '#accelerators' ? 'accelerators' : null);
    if (product) {
      event.preventDefault();
      activateProduct(product, { syncHash: true, scroll: true });
      closeNav();
      return;
    }
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    history.pushState(null, '', href);
    scrollToTacSection(target);
    closeNav();
  });

  document.querySelector('.tac-industry-tabs')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-industry]'); if (!button) return;
    const item = content.industries.find((industry) => industry.id === button.dataset.industry); if (!item) return;
    activateTab('industry', item.id);
    const panel = document.querySelector('#industry-panel');
    panel.className = `tac-industry-panel tone-${item.tone}`;
    panel.innerHTML = `<div><p class="tac-panel-index">${String(content.industries.indexOf(item) + 1).padStart(2, '0')} / INDUSTRY</p><h3>${item.title}</h3><p>${item.text}</p>${link({ label: 'EXPLORE INDUSTRY', href: '#applications' }, 'tac-text-link')}</div><div class="tac-logo-cloud">${item.logos.map((label, i) => `<span style="--delay:${i}">${label}</span>`).join('')}</div>`;
  });

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
  document.querySelector('.tac-reports-tabs')?.addEventListener('click', (event) => { const button = event.target.closest('[data-report]'); if (!button) return; const report = content.reports.find((item) => item.id === button.dataset.report); activateTab('report', report.id); document.querySelector('#reportPanel').innerHTML = `<div class="tac-report-visual"><span>TAC<br>INSIGHT<br>${String(content.reports.indexOf(report) + 1).padStart(2, '0')}</span></div><div><p class="tac-eyebrow"><span></span>${report.label}</p><h2>${report.title}</h2><p>${report.text}</p>${link({ label: 'REQUEST REPORT DETAILS', href: emailTac('TAC report enquiry') }, 'tac-text-link')}</div>`; });

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
  if (!document.querySelector('body[data-static-home]')) {
    renderHeader(); renderHero(); renderTrust(); renderApplications(); renderCapabilities(); renderReports(); renderPartners(); renderInsights(); renderSkillMarketplaceFeature(); renderContactAndFooter();
  }
  setupInteractions();
  mountTacAssistant(content);
  try { setupHeroVideo(); setupMotionController(); } catch (error) { console.warn('TAC motion unavailable', error); gsap.set('.hero-reveal, .reveal, .tac-artemis-card', { clearProps: 'all' }); }
  const startRive = () => setupRiveAnimations().catch(error => console.warn('TAC animation unavailable', error));
  if ('requestIdleCallback' in window) window.requestIdleCallback(startRive, { timeout: 3000 });
  else window.setTimeout(startRive, 1500);
});
