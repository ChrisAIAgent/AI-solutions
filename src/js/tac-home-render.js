import { content } from '../data/tac-home-content.js';
import { skills } from '../data/tac-skills.js';
import { contactEmail, contactLinks, emailTac } from '../data/tac-contact.js';

export function createHomeRenderer(document) {
  const icon = (name) => `<i class="fa-solid ${name}" aria-hidden="true"></i>`;
  const link = ({ label, href = '#' }, className = 'tac-button tac-button--dark') => `<a class="${className}" href="${href}">${label}<span aria-hidden="true">↗</span></a>`;
  const productHashes = { prebuilt: '#Pre-built-Applications', accelerators: '#Application-Accelerators', tailored: '#Tailored-Applications', 'platform-tab': '#Agent-Platform' };
  function renderHeader() {
    const header = document.querySelector('.tac-header');
    const renderNavChild = (item, child) => {
      const label = typeof child === 'string' ? child : child.label;
      if (child.disabled) return `<span class="tac-nav-unavailable" role="menuitem" aria-disabled="true">${label}<small>${child.note || 'Coming soon'}</small></span>`;
      const href = typeof child === 'string' ? item.target : child.href;
      const external = /^https?:\/\//i.test(href) && !child.sameTab ? ' target="_blank" rel="noopener noreferrer"' : '';
      const suffix = child.note ? `<small>${child.note}</small>` : '<span aria-hidden="true">↗</span>';
      return `<a href="${href}" role="menuitem"${external}>${label}${suffix}</a>`;
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
        <div class="tac-nav-actions"><span class="tac-signin tac-signin--unavailable" aria-disabled="true">Sign in <small>Coming soon</small></span>${link({ label: content.download.navLabel, href: './pages/tacwork-download.html' }, 'tac-button tac-button--nav')}</div>
      </nav>`;
  }

  function renderHero() {
    document.querySelector('.tac-hero').innerHTML = `
      <div class="tac-hero-aurora" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="tac-hero-grid" aria-hidden="true"></div>
      <div class="tac-hero-content section-shell">
        <div class="tac-hero-copy"><p class="tac-eyebrow hero-reveal"><span></span>${content.hero.eyebrow}</p><h1 class="hero-reveal">${content.hero.title}</h1><p class="tac-lead hero-reveal">${content.hero.lead}</p><div class="tac-hero-actions hero-reveal">${link(content.hero.primary)}${link(content.hero.secondary, 'tac-button tac-button--light')}</div></div>
        <article class="tac-artemis-card" id="artemisCard" aria-label="TAC Agent Platform visual preview">
          <div class="tac-artemis-copy"><p>THE TAC AI AGENT PLATFORM</p><h2>Meet <span>{ TAC }</span></h2><b>NEW</b><p class="tac-artemis-description">An AI-programmable foundation for building dependable agent workflows across the enterprise.</p></div>
          <div class="tac-artemis-visual" aria-hidden="true"><img class="tac-artemis-fallback" src="/assets/tac/industrial-hero.png" alt=""><video class="tac-artemis-video" muted loop playsinline preload="none" poster="/assets/tac/industrial-hero.png"><source src="/videos/planet-earth.mp4" type="video/mp4"></video><div class="tac-artemis-bloom"></div><div class="tac-artemis-grid"></div><div class="tac-artemis-orbit tac-artemis-orbit--one"></div><div class="tac-artemis-orbit tac-artemis-orbit--two"></div></div>
          <a class="tac-artemis-arrow" href="#platform" aria-label="Explore the TAC Agent Platform">↗</a>
        </article>
        <div class="tac-feature-cards" aria-label="TAC application models">${content.hero.featureCards.map((card, index) => `<article class="tac-feature-card tac-feature-card--${index + 1}"><a class="tac-feature-card-heading" href="${Object.values(productHashes)[index]}"><h2>${card.title}</h2><span>↗</span></a><p>${card.text}</p>${featureCardVisual(index)}</article>`).join('')}</div>
      </div>`;
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
    document.querySelector('#product-panel').innerHTML = prebuiltMarkup();
  }

  function prebuiltMarkup() {
    return `<div class="tac-product-panel-heading"><p class="tac-eyebrow"><span></span>PRE-BUILT APPLICATIONS</p><h3>Use purpose-built agentic AI applications</h3><p>Explore purpose-built AI application approaches for industry and business workflows. Contact TAC to confirm availability and requirements for your use case.</p></div><div class="tac-application-grid">${content.applications.map((item, index) => `<article class="tac-application-card"><div><h4>${item.title.replace(item.accent, `<em>${item.accent}</em>`)}</h4><p>${item.text}</p><div class="tac-card-actions">${item.actions.map((itemAction, actionIndex) => link(itemAction, actionIndex ? 'tac-mini-link' : 'tac-mini-button')).join('')}</div></div>${applicationVisual(index)}</article>`).join('')}</div>`;
  }

  function acceleratorMarkup() {
    return `<div class="tac-product-panel-heading"><p class="tac-eyebrow"><span></span>APPLICATION ACCELERATORS</p><h3>${content.accelerators.title}</h3><p>${content.accelerators.lead}</p></div><div class="tac-accelerator-showcase"><div class="tac-integration-scene" aria-hidden="true"><div class="tac-integration-core"><span>TAC</span><strong>ORCHESTRATOR</strong><i></i><i></i><i></i></div><div class="tac-integration-node tac-integration-node--one">CRM</div><div class="tac-integration-node tac-integration-node--two">KNOWLEDGE</div><div class="tac-integration-node tac-integration-node--three">POLICY</div><div class="tac-integration-node tac-integration-node--four">WORKFLOW</div><svg class="tac-integration-lines" viewBox="0 0 560 330" preserveAspectRatio="none"><path d="M280 165 L100 90 M280 165 L450 82 M280 165 L450 256 M280 165 L100 248" /></svg></div><div class="tac-accelerator-grid">${content.accelerators.items.map(([title, text], index) => `<article><span>0${index + 1}</span><h4>${title}</h4><p>${text}</p><a href="${emailTac('TAC ' + title + ' enquiry')}">DISCUSS THIS OPTION <b>↗</b></a></article>`).join('')}</div></div>`;
  }

  function tailoredMarkup() {
    return `<div class="tac-product-panel-heading"><p class="tac-eyebrow"><span></span>TAILORED APPLICATIONS</p><h3>Build experiences around the work that makes your organization distinct.</h3><p>Use a platform foundation with the flexibility to meet your own goals and operating realities.</p></div><div class="tac-tailored-showcase"><div class="tac-code-window" aria-label="TAC workflow code preview"><div class="tac-code-window-top"><span></span><span></span><span></span><b>tac-workflow.ts</b></div><pre><code><span>01</span><i>const</i> workflow = <em>tac</em>.agent({<br><span>02</span>  intent: <strong>'resolve_request'</strong>,<br><span>03</span>  context: <em>enterprise.knowledge</em>,<br><span>04</span>  guardrails: [<strong>'policy'</strong>, <strong>'review'</strong>]<br><span>05</span>});</code></pre><button type="button" class="tac-run-button" data-run-workflow>▶ RUN</button><p class="tac-code-result" aria-live="polite">Ready to execute</p></div><div class="tac-tailored-grid">${content.tailored.map((item, index) => `<article><div class="tac-tailored-mark">0${index + 1}</div><div><h4>${item.title}</h4><p>${item.text}</p><div>${item.links.map((label) => `<a class="tac-mini-link" href="${emailTac('TAC ' + item.title + ' enquiry')}">${label} <b>↗</b></a>`).join('')}</div></div></article>`).join('')}</div></div>`;
  }

  function platformMarkup() {
    return `<div class="tac-product-panel-heading"><p class="tac-eyebrow"><span></span>AGENT PLATFORM</p><h3>A dependable layer for AI work that needs to operate.</h3><p>Move from isolated pilots to intentional, governed experiences across teams and systems.</p></div><div class="tac-platform-brief"><div class="tac-platform-motion" aria-hidden="true"><img src="/assets/tac/logo-system.png" alt=""><span></span><span></span></div><div><p>PLATFORM BRIEF</p><h4>Bring your people, systems, and AI experiences into one operating model.</h4>${link({ label: 'EXPLORE THE PLATFORM', href: '#platform' }, 'tac-text-link')}</div></div>`;
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
      <div class="tac-reports-tabs reveal" role="tablist" aria-label="TAC reports">${content.reports.map((report, index) => `<button role="tab" data-report="${report.id}" aria-selected="${index === 0}" tabindex="${index === 0 ? '0' : '-1'}">${report.label}</button>`).join('')}</div><article class="tac-report-card reveal" id="reportPanel"><div class="tac-report-visual"><span>TAC<br>INSIGHT<br>01</span></div><div><p class="tac-eyebrow"><span></span>TAC INSIGHT</p><h2>${first.title}</h2><p>${first.text}</p>${link({ label: 'REQUEST REPORT DETAILS', href: emailTac('TAC report enquiry') }, 'tac-text-link')}</div></article>`;
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
    document.querySelector('.tac-partners').innerHTML = `<div class="tac-partners-copy reveal"><p class="tac-eyebrow"><span></span>ECOSYSTEM</p><h2>Technology is more useful when it fits the way work already gets done.</h2></div><div class="tac-partner-grid reveal">${content.partners.map((partner, index) => `<article><span>0${index + 1}</span><h3>${partner.name}</h3><p>${partner.text}</p><a href="${contactLinks.partnership}">PARTNER WITH TAC <b>↗</b></a></article>`).join('')}</div>`;
  }

  function renderInsights() {
    document.querySelector('.tac-insights').innerHTML = `<div class="tac-insights-heading reveal"><div><p class="tac-eyebrow"><span></span>AI INSIGHTS</p><h2>Ideas for AI that can hold up in the real world.</h2></div><span class="tac-coming-soon" aria-disabled="true">Full articles coming soon</span></div><div class="tac-insights-grid reveal">${content.insights.map((item, index) => `<article><div class="tac-insight-image tac-insight-image--${index + 1}"><span>${String(index + 1).padStart(2, '0')}</span></div><p>${item.tag}<span>${item.date}</span></p><h3>${item.title}</h3><p class="tac-insight-body">${item.text}</p><span class="tac-coming-soon" aria-disabled="true">Full article coming soon</span></article>`).join('')}</div>`;
  }

  function renderContactAndFooter() {
    document.querySelector('.tac-contact').innerHTML = `<div class="section-shell tac-contact-content reveal"><p class="tac-eyebrow"><span></span>START A CONVERSATION</p><h2>Let’s build the next useful AI experience together.</h2><p>Tell us about your project, request a demo, or ask about TAC products.</p><a class="tac-contact-email" href="${contactLinks.sales}">${contactEmail}</a><div class="tac-contact-actions">${link({ label: 'GET IN TOUCH', href: '/pages/contact-us' }, 'tac-button tac-button--light')}${link({ label: 'REQUEST A DEMO', href: contactLinks.demo }, 'tac-button tac-button--light')}</div><p class="tac-contact-note">Get in touch through our contact page, or email us directly using the address above.</p></div>`;
    document.querySelector('.tac-footer').innerHTML = `<div class="section-shell tac-footer-grid"><div><a class="tac-brand tac-brand--footer" href="#top"><img src="/assets/tac/tac-mark.png" alt="TAC"><span>TAC<span class="tac-brand-dot">.</span>AI</span></a><p>Dependable AI operations for enterprise teams.</p></div><div><p>PRODUCT</p><a href="#applications">AI Applications</a><a href="#platform">Agent Platform</a><a href="#Application-Accelerators">Accelerators</a><a class="tac-footer-download" href="/pages/tacwork-download">${content.download.navLabel}</a></div><div><p>COMPANY</p><a href="#industries">Industries</a><a href="/pages/skills">Skills Marketplace</a><a href="/pages/contact-us">Contact Us</a><a class="tac-footer-email" href="${contactLinks.sales}">${contactEmail}</a></div><div><p>RESOURCES</p><a href="#insights">Insights</a><a href="#reports">Reports</a><a href="${contactLinks.support}">Support</a></div></div><div class="section-shell tac-footer-bottom"><span>© 2026 TAC. All rights reserved.</span><span>TAC · A ChrisAI Brand</span></div>`;
  }
  return { renderHeader, renderHero, featureCardVisual, featureCardFallback, renderTrust, applicationVisual, renderApplications, prebuiltMarkup, acceleratorMarkup, tailoredMarkup, platformMarkup, renderCapabilities, renderReports, renderSkillMarketplaceFeature, renderPartners, renderInsights, renderContactAndFooter };
}
