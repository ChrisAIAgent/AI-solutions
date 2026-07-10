/**
 * Marketing Library Portal — Main JavaScript
 * All client-side logic in one DOMContentLoaded handler.
 */

// Import styles — Vite will bundle them automatically
import '../scss/main.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // 0. SAFETY NET — never let a JS error white-screen the page
  // If anything throws before fade-up reveal, force-show all content.
  // ============================================
  function revealAllFadeUp() {
    document.querySelectorAll('.fade-up-element').forEach(el => el.classList.add('visible'));
  }
  window.addEventListener('error', revealAllFadeUp);

  // ============================================
  // STATE
  // ============================================
  let currentLang = 'en';
  let currentVideoIndex = 0;
  let openPanelId = null;

  // Video sources array — supports direct MP4 files or external links
  // The first entry auto-plays when the page opens.
  const videoSources = [
    {
      type: 'youtube',
      title: 'The Agent Company — Brand Film',
      src: 'https://www.youtube.com/watch?v=_Sl8diqCAFw',
      poster: 'https://img.youtube.com/vi/_Sl8diqCAFw/maxresdefault.jpg',
      link: 'https://www.youtube.com/watch?v=_Sl8diqCAFw'
    },
    {
      type: 'video',
      title: 'The Agent Company Launch',
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      poster: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
      link: '#'
    },
    {
      type: 'video',
      title: 'Agentic Era Product Demo',
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      poster: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
      link: '#'
    },
    {
      type: 'video',
      title: 'Customer Success Story',
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      poster: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80',
      link: '#'
    }
  ];

  // ============================================
  // 0.5. NAVBAR SCROLL STATE DETECTION
  // ============================================
  const navbarEl = document.querySelector('.navbar-main');

  function updateNavbarScroll() {
    if (!navbarEl) return;
    if (window.scrollY > 20) {
      navbarEl.classList.add('scrolled');
    } else {
      navbarEl.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', throttle(updateNavbarScroll, 16), { passive: true });
  updateNavbarScroll(); // init

  // ============================================
  // 0.7. SCROLL-TRIGGERED FADE-UP (set up early, opt-in hiding)
  // ============================================
  const fadeUpElements = document.querySelectorAll('.fade-up-element');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (fadeUpElements.length > 0 && !prefersReducedMotion) {
    document.documentElement.classList.add('anim-ready'); // CSS now hides them
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    fadeUpElements.forEach(el => fadeObserver.observe(el));

    // Fallback: if IO never fires (edge cases), reveal after 1.2s
    setTimeout(revealAllFadeUp, 1200);
  } else {
    fadeUpElements.forEach(el => el.classList.add('visible'));
  }

  // ============================================
  // 1. DARK / LIGHT THEME TOGGLE
  // ============================================
  const themeToggle = document.getElementById('themeToggle');
  const htmlEl = document.documentElement;

  // Restore saved preference or default to light
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    htmlEl.setAttribute('data-theme', 'dark');
    if (themeToggle) {
      themeToggle.querySelector('i').className = 'fas fa-sun';
      themeToggle.classList.add('active');
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = htmlEl.getAttribute('data-theme') === 'dark';
      if (isDark) {
        htmlEl.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggle.querySelector('i').className = 'fas fa-moon';
        themeToggle.classList.remove('active');
      } else {
        htmlEl.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggle.querySelector('i').className = 'fas fa-sun';
        themeToggle.classList.add('active');
      }
    });
  }

  // ============================================
  // 2. HERO SUBTITLE TYPEWRITER
  // ============================================
  const heroSubtitle = document.getElementById('heroSubtitle');

  function typewriterSubtitle(speed = 60) {
    if (!heroSubtitle) return;
    const text = heroSubtitle.getAttribute(`data-${currentLang}`)
                 || heroSubtitle.getAttribute('data-en')
                 || '';
    heroSubtitle.textContent = '';
    let i = 0;
    function type() {
      if (i < text.length) {
        heroSubtitle.textContent += text[i];
        i++;
        setTimeout(type, speed);
      }
    }
    type();
  }

  // ============================================
  // 3. LANGUAGE SWITCH (EN / CN)
  // ============================================
  const langToggle = document.getElementById('langToggle');

  function applyLanguage(lang) {
    currentLang = lang;

    // Update all [data-en] elements
    document.querySelectorAll('[data-en]').forEach(el => {
      // Skip the subtitle; typewriterSubtitle will handle it below
      if (el.id === 'heroSubtitle') return;
      const text = el.getAttribute(`data-${lang}`);
      if (text !== null) el.textContent = text;
    });

    // Update placeholders
    document.querySelectorAll('[data-placeholder-en]').forEach(el => {
      el.placeholder = el.getAttribute(`data-placeholder-${lang}`) || '';
    });

    // Update lang toggle button text
    if (langToggle) {
      langToggle.innerHTML = `<span style="font-size:12px;font-weight:600;">${lang.toUpperCase()}</span>`;
    }

    // Re-type the subtitle in the new language
    typewriterSubtitle();
  }

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const newLang = currentLang === 'en' ? 'cn' : 'en';
      applyLanguage(newLang);
    });
  }

  // Initialize language from saved state or default
  applyLanguage(currentLang);

  // ============================================
  // 4. SEARCH FUNCTIONALITY
  // ============================================
  const searchInput = document.getElementById('searchInput');
  const searchDropdown = document.getElementById('searchDropdown');
  const searchSubmit = document.getElementById('searchSubmit');
  const categoryCards = document.querySelectorAll('.category-card');
  let searchDebounceTimer = null;

  // Local card filtering
  function filterCards(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
      categoryCards.forEach(card => card.classList.remove('hidden'));
      return [];
    }

    let matchedCards = [];
    categoryCards.forEach(card => {
      const titleEn = (card.dataset.titleEn || '').toLowerCase();
      const titleCn = (card.dataset.titleCn || '').toLowerCase();
      const descEn = (card.dataset.descEn || '').toLowerCase();
      const descCn = (card.dataset.descCn || '').toLowerCase();

      const matches = titleEn.includes(q) || titleCn.includes(q) ||
                      descEn.includes(q) || descCn.includes(q);

      if (matches) {
        card.classList.remove('hidden');
        matchedCards.push({
          title: card.dataset[`title${lang === 'en' ? 'En' : 'Cn'}`] || '',
          desc: card.dataset[`desc${lang === 'en' ? 'En' : 'Cn'}`] || '',
          icon: card.querySelector('.card-icon i')?.className?.replace('fas ', '') || 'fa-folder',
          type: card.classList.contains('expandable') ? 'expandable' : 'link',
          section: card.dataset.category
        });
      } else {
        card.classList.add('hidden');
      }
    });

    return matchedCards;
  }

  // Global search via search-index.json
  async function globalSearch(query) {
    try {
      const resp = await fetch('./public/search-index.json');
      const index = await resp.json();
      const q = query.toLowerCase().trim();
      return index.filter(item =>
        (item.title?.toLowerCase() || '').includes(q) ||
        (item.description?.toLowerCase() || '').includes(q)
      ).slice(0, 12);
    } catch (e) {
      console.warn('Search index not available:', e);
      return [];
    }
  }

  // Render dropdown results
  function renderDropdown(results) {
    if (!searchDropdown) return;
    if (results.length === 0) {
      searchDropdown.classList.remove('show');
      return;
    }

    searchDropdown.innerHTML = results.map(r => `
      <div class="search-result-item" data-section="${r.section || ''}">
        <div class="result-icon"><i class="fas ${r.icon || 'fa-folder'}"></i></div>
        <div class="result-info">
          <div class="result-title">${r.title}</div>
          <div class="result-desc">${r.desc}</div>
        </div>
        ${r.type ? `<span class="result-type">${r.type}</span>` : ''}
      </div>
    `).join('');

    searchDropdown.classList.add('show');
  }

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      clearTimeout(searchDebounceTimer);
      const query = e.target.value;

      searchDebounceTimer = setTimeout(async () => {
        // Always filter local cards first
        const localMatches = filterCards(query);

        // Also try global search for dropdown suggestions
        if (query.length >= 2) {
          const globalResults = await globalSearch(query);
          const combined = [...localMatches];
          // Deduplicate by title
          globalResults.forEach(g => {
            if (!combined.some(l => l.title === g.title)) combined.push(g);
          });
          renderDropdown(combined.slice(0, 12));
        } else {
          renderDropdown(localMatches);
        }
      }, 200);
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        searchDropdown?.classList.remove('show');
      }
    });
  }

  if (searchSubmit) {
    searchSubmit.addEventListener('click', () => {
      if (searchInput) {
        filterCards(searchInput.value);
        searchDropdown?.classList.remove('show');
      }
    });
  }

  // ============================================
  // 5. FILTER TAG CHIPS
  // ============================================
  const filterTags = document.getElementById('filterTags');

  if (filterTags) {
    filterTags.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;

      // Toggle active state
      filterTags.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filter = chip.dataset.filter;

      if (filter === 'all') {
        categoryCards.forEach(card => card.classList.remove('hidden'));
      } else {
        categoryCards.forEach(card => {
          const tags = (card.dataset.tags || '').split(',');
          const match = tags.some(tag => tag.trim() === filter.trim());
          card.classList.toggle('hidden', !match);
        });
      }
    });

    // Set "All" as default active
    const allChip = filterTags.querySelector('[data-filter="all"]');
    if (allChip) allChip.classList.add('active');
  }

  // ============================================
  // 6. EXPANDABLE CARDS (Single Open)
  // ============================================
  const expandableCards = document.querySelectorAll('.category-card.expandable');

  expandableCards.forEach(card => {
    card.addEventListener('click', () => {
      const categoryId = card.dataset.category;
      const panelId = `panel-${categoryId}`;
      const panel = document.getElementById(panelId);

      if (!panel) return;

      // If this panel is already open → close it
      if (openPanelId === panelId) {
        panel.classList.remove('open');
        card.classList.remove('expanded');
        openPanelId = null;
        return;
      }

      // Close any previously open panel
      if (openPanelId) {
        const prevPanel = document.getElementById(openPanelId);
        const prevCard = document.querySelector(`.category-card[data-category="${openPanelId.replace('panel-', '')}"]`);
        prevPanel?.classList.remove('open');
        prevCard?.classList.remove('expanded');
      }

      // Open new panel
      panel.classList.add('open');
      card.classList.add('expanded');
      openPanelId = panelId;

      // Smooth scroll to panel after animation starts
      requestAnimationFrame(() => {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
  });

  // Linked cards navigate
  document.querySelectorAll('.category-card.card-linked').forEach(card => {
    card.addEventListener('click', () => {
      const link = card.dataset.link;
      if (link) window.location.href = link;
    });
  });

  // ============================================
  // 7. HERO STATS
  // ============================================
  function updateHeroStats() {
    const statCases = document.getElementById('statCases');
    const statVideos = document.getElementById('statVideos');
    const statCategories = document.getElementById('statCategories');
    const statCollections = document.getElementById('statCollections');

    if (statCases) statCases.innerHTML = '50<span>+</span>';
    if (statVideos) statVideos.innerHTML = '30<span>+</span>';
    if (statCategories) statCategories.innerHTML = '100<span>+</span>';
    if (statCollections) statCollections.innerHTML = '10<span>+</span>';
  }

  updateHeroStats();

  // ============================================
  // 8. [REMOVED] TOC SIDEBAR SYNC — feature not needed
  // ============================================
  // ============================================
  // 9. VIDEO CAROUSEL
  // ============================================
  const showcaseVideo = document.getElementById('showcaseVideo');
  const showcaseIframe = document.getElementById('showcaseIframe');
  const videoPoster = document.getElementById('videoPoster');
  const videoDots = document.getElementById('videoDots');
  const videoPrevBtn = document.getElementById('videoPrev');
  const videoNextBtn = document.getElementById('videoNext');
  const videoLinkBtn = document.getElementById('videoLinkBtn');
  const videoOverlay = document.getElementById('videoOverlay');

  function resetVideoVisibility() {
    if (showcaseVideo) {
      showcaseVideo.classList.remove('is-playing', 'can-play');
    }
  }

  function youtubeId(url) {
    if (!url) return null;
    const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    return m ? m[1] : null;
  }

  function loadVideo(index) {
    if (!showcaseVideo || !videoSources[index]) return;
    const source = videoSources[index];
    currentVideoIndex = index;
    resetVideoVisibility();

    // Detect YouTube embed (either explicit type or a YouTube URL in external mode)
    const ytId = (source.type === 'youtube' || source.type === 'external')
      ? youtubeId(source.src || source.link)
      : null;

    if (ytId && showcaseIframe) {
      // ── YouTube inline embed ──
      showcaseVideo.style.display = 'none';
      showcaseIframe.style.display = 'block';
      showcaseIframe.src =
        `https://www.youtube.com/embed/${ytId}` +
        `?autoplay=1&mute=1&loop=1&playlist=${ytId}` +
        `&rel=0&modestbranding=1&playsinline=1`;
    } else {
      // ── Direct MP4 / link-only path ──
      if (showcaseIframe) {
        showcaseIframe.style.display = 'none';
        showcaseIframe.removeAttribute('src');
      }
      showcaseVideo.style.display = '';

      while (showcaseVideo.firstChild) {
        showcaseVideo.removeChild(showcaseVideo.firstChild);
      }

      if (source.type === 'external') {
        showcaseVideo.removeAttribute('src');
      } else {
        const newSource = document.createElement('source');
        newSource.src = source.src;
        newSource.type = 'video/mp4';
        showcaseVideo.appendChild(newSource);
        showcaseVideo.load();
        // Auto play muted
        showcaseVideo.play().catch(() => {}); // Ignore autoplay policy errors
      }
    }

    // Update poster image
    if (videoPoster) {
      videoPoster.src = source.poster || '';
      videoPoster.style.opacity = source.poster ? '1' : '0';
    }
    showcaseVideo.poster = source.poster || '';

    // Update watch link + overlay
    const watchUrl = source.link || '#';
    if (videoLinkBtn) {
      videoLinkBtn.href = watchUrl;
      videoLinkBtn.title = source.title || 'Watch video';
    }
    if (videoOverlay) {
      if (ytId) {
        // Keep the embedded player interactive — hide the big play overlay
        videoOverlay.style.display = 'none';
      } else {
        videoOverlay.style.display = '';
        videoOverlay.href = watchUrl;
        videoOverlay.title = source.title || 'Watch video';
      }
    }

    updateVideoDots();
  }

  function buildVideoDots() {
    if (!videoDots) return;
    videoDots.innerHTML = videoSources.map((_, i) =>
      `<span class="dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>`
    ).join('');
  }

  function updateVideoDots() {
    if (!videoDots) return;
    videoDots.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentVideoIndex);
    });
  }

  function nextVideo() {
    currentVideoIndex = (currentVideoIndex + 1) % videoSources.length;
    loadVideo(currentVideoIndex);
  }

  function prevVideo() {
    currentVideoIndex = (currentVideoIndex - 1 + videoSources.length) % videoSources.length;
    loadVideo(currentVideoIndex);
  }

  if (showcaseVideo) {
    buildVideoDots();
    loadVideo(0);

    showcaseVideo.addEventListener('canplay', () => {
      showcaseVideo.classList.add('can-play');
    });

    showcaseVideo.addEventListener('playing', () => {
      showcaseVideo.classList.add('is-playing', 'can-play');
    });

    showcaseVideo.addEventListener('waiting', () => {
      showcaseVideo.classList.remove('is-playing');
    });

    showcaseVideo.addEventListener('ended', () => {
      nextVideo();
    });
  }

  if (videoNextBtn) videoNextBtn.addEventListener('click', nextVideo);
  if (videoPrevBtn) videoPrevBtn.addEventListener('click', prevVideo);

  // Dot navigation
  if (videoDots) {
    videoDots.addEventListener('click', (e) => {
      const dot = e.target.closest('.dot');
      if (!dot) return;
      currentVideoIndex = parseInt(dot.dataset.index);
      loadVideo(currentVideoIndex);
    });
  }

  // ============================================
  // 10. EDIT MODE
  // ============================================
  const editToggle = document.getElementById('editToggle');

  if (editToggle) {
    editToggle.addEventListener('click', () => {
      document.body.classList.toggle('edit-mode');
      const isActive = document.body.classList.contains('edit-mode');
      editToggle.classList.toggle('active', isActive);
    });
  }

  // ============================================
  // 11. BACK TO TOP BUTTON
  // ============================================
  const backToTopBtn = document.getElementById('backToTop');

  if (backToTopBtn) {
    window.addEventListener('scroll', throttle(() => {
      backToTopBtn.classList.toggle('visible', window.scrollY > 300);
    }, 100));

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  // ============================================
  // UTILITY: Throttle
  // ============================================
  function throttle(fn, delay) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        fn.apply(this, args);
      }
    };
  }

});


