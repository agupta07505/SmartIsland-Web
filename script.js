/**
 * Smart Island Web - Dynamic Functionality, GitHub API & 3D Coverflow Carousel
 */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initActiveNavObserver();
  initCoverflowCarousel();
  initLightbox();
  fetchGitHubDownloads();
  initSimulator();
});

/* ==========================================================================
   1. Dynamic GitHub Downloads Fetch & Counter Animation
   ========================================================================== */
async function fetchGitHubDownloads() {
  const downloadEl = document.getElementById("stat-downloads-count");
  const badgeEl = document.getElementById("hero-downloads-badge");

  const FALLBACK_COUNT = 15648;

  try {
    const response = await fetch("https://api.github.com/repos/agupta07505/SmartIsland/releases");
    
    if (!response.ok) {
      throw new Error(`GitHub API error status: ${response.status}`);
    }

    const releases = await response.json();
    let totalDownloads = 0;

    if (Array.isArray(releases)) {
      releases.forEach((release) => {
        if (release.assets && Array.isArray(release.assets)) {
          release.assets.forEach((asset) => {
            if (typeof asset.download_count === "number") {
              totalDownloads += asset.download_count;
            }
          });
        }
      });
    }

    const countToDisplay = totalDownloads > 0 ? totalDownloads : FALLBACK_COUNT;

    // Animate stat number counter
    if (downloadEl) {
      animateCounter(downloadEl, 0, countToDisplay, 1600);
    }

    // Update hero badge
    if (badgeEl) {
      const formattedK = (countToDisplay / 1000).toFixed(1) + "K+ Downloads";
      badgeEl.textContent = formattedK;
    }
  } catch (error) {
    console.warn("Could not fetch live GitHub download stats, using static fallback:", error);
    if (downloadEl) {
      animateCounter(downloadEl, 0, FALLBACK_COUNT, 1600);
    }
    if (badgeEl) {
      badgeEl.textContent = "15.6K+ Downloads";
    }
  }
}

function animateCounter(element, start, end, duration) {
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const currentCount = Math.floor(easeProgress * (end - start) + start);
    
    element.textContent = currentCount.toLocaleString() + "+";

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = end.toLocaleString() + "+";
    }
  }

  window.requestAnimationFrame(step);
}

/* ==========================================================================
   2. Mobile Navigation Toggle & Body Scroll Lock
   ========================================================================== */
function initMobileNav() {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  const navLinks = document.querySelectorAll(".nav a");

  if (!navToggle || !nav) return;

  const toggleMenu = (open) => {
    const isOpen = open !== undefined ? open : !nav.classList.contains("open");
    nav.classList.toggle("open", isOpen);
    document.body.classList.toggle("nav-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  };

  navToggle.addEventListener("click", () => toggleMenu());

  navLinks.forEach((link) => {
    link.addEventListener("click", () => toggleMenu(false));
  });

  document.addEventListener("click", (e) => {
    if (nav.classList.contains("open") && !nav.contains(e.target) && !navToggle.contains(e.target)) {
      toggleMenu(false);
    }
  });
}

/* ==========================================================================
   3. Active Section Scroll Observer
   ========================================================================== */
function initActiveNavObserver() {
  const navLinks = [...document.querySelectorAll(".nav a")];
  const sections = navLinks
    .map((link) => {
      const href = link.getAttribute("href");
      return href && href.startsWith("#") ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleEntry) return;

      navLinks.forEach((link) => {
        const isMatch = link.getAttribute("href") === `#${visibleEntry.target.id}`;
        link.classList.toggle("active", isMatch);
      });
    },
    { rootMargin: "-20% 0px -40% 0px", threshold: [0.1, 0.3, 0.6] }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ==========================================================================
   4. 3D Coverflow Carousel Engine (Defaulting to Music Screenshot)
   ========================================================================== */
function initCoverflowCarousel() {
  const allCards = Array.from(document.querySelectorAll(".coverflow-card"));
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");
  const dotsContainer = document.getElementById("carousel-dots");
  const filterTabs = document.querySelectorAll(".filter-tab");
  const stage = document.querySelector(".coverflow-stage");

  const captionTag = document.getElementById("carousel-tag");
  const captionTitle = document.getElementById("carousel-title");
  const captionDesc = document.getElementById("carousel-desc");

  if (!allCards.length) return;

  let activeFilter = "all";
  let visibleCards = [...allCards];
  let activeIndex = 0; // Default active centered screenshot: Wavy Music Player

  function getVisibleCards() {
    return allCards.filter((card) => {
      const cat = card.getAttribute("data-category");
      return activeFilter === "all" || cat === activeFilter;
    });
  }

  function updateCoverflow() {
    visibleCards = getVisibleCards();

    if (!visibleCards.length) return;
    if (activeIndex >= visibleCards.length) activeIndex = visibleCards.length - 1;
    if (activeIndex < 0) activeIndex = 0;

    // Apply 3D classes to all cards
    allCards.forEach((card) => {
      card.className = "coverflow-card lightbox-trigger hidden";
    });

    const N = visibleCards.length;
    const half = Math.floor(N / 2);

    visibleCards.forEach((card, idx) => {
      let diff = idx - activeIndex;
      
      // Wrap around logic for circular carousel
      if (N > 4) {
        if (diff > half) {
          diff -= N;
        } else if (diff < -half) {
          diff += N;
        }
      }

      card.classList.remove("hidden");

      if (diff === 0) {
        card.classList.add("active");
      } else if (diff === -1) {
        card.classList.add("prev-1");
      } else if (diff === 1) {
        card.classList.add("next-1");
      } else if (diff === -2) {
        card.classList.add("prev-2");
      } else if (diff === 2) {
        card.classList.add("next-2");
      } else {
        card.classList.add("hidden");
      }
    });

    // Update Caption Box
    const activeCard = visibleCards[activeIndex];
    if (activeCard) {
      const tagText = activeCard.getAttribute("data-tag") || "";
      const tagClass = activeCard.getAttribute("data-tag-class") || "";
      const titleText = activeCard.getAttribute("data-title") || "";
      const descText = activeCard.getAttribute("data-desc") || "";

      if (captionTag) {
        captionTag.textContent = tagText;
        captionTag.className = `phone-tag ${tagClass}`.trim();
      }
      if (captionTitle) captionTitle.textContent = titleText;
      if (captionDesc) captionDesc.textContent = descText;
    }

    // Render Pagination Dots
    if (dotsContainer) {
      dotsContainer.innerHTML = "";
      visibleCards.forEach((_, idx) => {
        const dot = document.createElement("div");
        dot.className = `carousel-dot ${idx === activeIndex ? "active" : ""}`;
        dot.addEventListener("click", () => {
          activeIndex = idx;
          updateCoverflow();
        });
        dotsContainer.appendChild(dot);
      });
    }
  }

  // Navigation handlers
  prevBtn?.addEventListener("click", () => {
    activeIndex = activeIndex > 0 ? activeIndex - 1 : visibleCards.length - 1;
    updateCoverflow();
  });

  nextBtn?.addEventListener("click", () => {
    activeIndex = activeIndex < visibleCards.length - 1 ? activeIndex + 1 : 0;
    updateCoverflow();
  });

  // Card click handler
  allCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      const cardIndexInVisible = visibleCards.indexOf(card);
      if (cardIndexInVisible !== -1 && cardIndexInVisible !== activeIndex) {
        e.stopPropagation();
        activeIndex = cardIndexInVisible;
        updateCoverflow();
      }
    });
  });

  // Filter Tabs Handler
  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      filterTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      activeFilter = tab.getAttribute("data-filter") || "all";
      activeIndex = 0;
      updateCoverflow();
    });
  });

  // Touch Swipe Gesture Support
  let touchStartX = 0;
  let touchEndX = 0;

  stage?.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  stage?.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const swipeDistance = touchEndX - touchStartX;

    if (Math.abs(swipeDistance) > 40) {
      if (swipeDistance < 0) {
        activeIndex = activeIndex < visibleCards.length - 1 ? activeIndex + 1 : 0;
      } else {
        activeIndex = activeIndex > 0 ? activeIndex - 1 : visibleCards.length - 1;
      }
      updateCoverflow();
    }
  }, { passive: true });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    const screenshotsSection = document.getElementById("screenshots");
    if (!screenshotsSection) return;

    const rect = screenshotsSection.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;

    if (inView) {
      if (e.key === "ArrowLeft") {
        activeIndex = activeIndex > 0 ? activeIndex - 1 : visibleCards.length - 1;
        updateCoverflow();
      } else if (e.key === "ArrowRight") {
        activeIndex = activeIndex < visibleCards.length - 1 ? activeIndex + 1 : 0;
        updateCoverflow();
      }
    }
  });

  // Auto-play loop
  let autoplayInterval;

  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(() => {
      activeIndex = activeIndex < visibleCards.length - 1 ? activeIndex + 1 : 0;
      updateCoverflow();
    }, 3500);
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
    }
  }

  stage?.addEventListener("mouseenter", stopAutoplay);
  stage?.addEventListener("mouseleave", startAutoplay);
  stage?.addEventListener("touchstart", stopAutoplay, { passive: true });
  stage?.addEventListener("touchend", startAutoplay, { passive: true });

  // Initial call
  updateCoverflow();
  startAutoplay();
}

/* ==========================================================================
   5. Lightbox Modal Preview
   ========================================================================== */
function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.getElementById("lightbox-close");

  if (!lightbox) return;

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest(".lightbox-trigger.active");
    if (trigger) {
      const imgSrc = trigger.getAttribute("data-img") || trigger.querySelector("img")?.src;
      const title = trigger.getAttribute("data-title") || "";
      const subtitle = trigger.getAttribute("data-desc") || "";
      const fullCaption = title ? `${title} — ${subtitle}` : "";

      if (lightboxImg && imgSrc) {
        lightboxImg.src = imgSrc;
        if (lightboxCaption) lightboxCaption.textContent = fullCaption;
        lightbox.classList.add("active");
        lightbox.setAttribute("aria-hidden", "false");
      }
    }
  });

  const closeLightbox = () => {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
  };

  lightboxClose?.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("active")) {
      closeLightbox();
    }
  });
}

/* ==========================================================================
   6. Interactive Island Simulator (v7.0.0 Dual-Tier In-Pill & Expanded)
   ========================================================================== */
function initSimulator() {
  const island = document.getElementById("sim-island");
  const pills = document.querySelectorAll(".sim-pill");
  if (!island) return;

  const modes = {
    music: {
      collapsed: `
        <div class="sim-collapsed-inner">
          <div class="sim-left">
            <div class="sim-icon-circle" style="color: #FF7043;">🎵</div>
            <span>Blinding Lights</span>
          </div>
          <div class="sim-right">
            <div class="sim-bars">
              <span class="sim-bar"></span>
              <span class="sim-bar"></span>
              <span class="sim-bar"></span>
              <span class="sim-bar"></span>
            </div>
          </div>
        </div>
      `,
      expanded: `
        <div class="sim-expanded-inner">
          <div class="sim-card-header">
            <div class="sim-art" style="color: #FF7043;">🎵</div>
            <div class="sim-meta">
              <div class="sim-title">Blinding Lights</div>
              <div class="sim-subtitle">The Weeknd • After Hours</div>
            </div>
            <span class="tier-badge" style="margin:0; font-size: 0.7rem; padding: 2px 8px;">Spotify</span>
          </div>
          <div class="sim-progress-bar">
            <div class="sim-progress-fill" style="width: 58%;"></div>
          </div>
          <div class="sim-controls">
            <button class="sim-control-btn" title="Previous Track" aria-label="Previous">⏮</button>
            <button class="sim-control-btn" style="font-size: 1.3rem; color: #FF7043;" title="Pause" aria-label="Pause">⏸</button>
            <button class="sim-control-btn" title="Next Track" aria-label="Next">⏭</button>
          </div>
        </div>
      `
    },
    nav: {
      collapsed: `
        <div class="sim-collapsed-inner">
          <div class="sim-left">
            <div class="sim-icon-circle" style="color: #4CAF50;">↗️</div>
            <span>Turn Right 200m</span>
          </div>
          <div class="sim-right">
            <span style="color: #4CAF50; font-size: 0.8rem; font-weight: 700;">12 min</span>
          </div>
        </div>
      `,
      expanded: `
        <div class="sim-expanded-inner">
          <div class="sim-card-header">
            <div class="sim-art" style="color: #4CAF50;">🧭</div>
            <div class="sim-meta">
              <div class="sim-title">Turn Right on Grand Ave</div>
              <div class="sim-subtitle">In 200 meters • Then keep left</div>
            </div>
            <span class="tier-badge font-sys" style="margin:0; font-size: 0.7rem; padding: 2px 8px;">Maps</span>
          </div>
          <div class="sim-progress-bar">
            <div class="sim-progress-fill" style="width: 72%; background: linear-gradient(135deg, #2e7d32, #4caf50);"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
            <span>ETA: <strong>5:42 PM</strong></span>
            <span>Distance: <strong>4.2 km</strong></span>
          </div>
        </div>
      `
    },
    timer: {
      collapsed: `
        <div class="sim-collapsed-inner">
          <div class="sim-left">
            <div class="sim-icon-circle" style="color: #FF9800;">⏱️</div>
            <span>Pasta Timer</span>
          </div>
          <div class="sim-right">
            <span style="color: #FFB74D; font-variant-numeric: tabular-nums; font-weight: 700;">04:28</span>
          </div>
        </div>
      `,
      expanded: `
        <div class="sim-expanded-inner">
          <div class="sim-card-header">
            <div class="sim-art" style="color: #FF9800;">⏳</div>
            <div class="sim-meta">
              <div class="sim-title">Pasta Boiling Timer</div>
              <div class="sim-subtitle">Target: 8:00 • 3:32 elapsed</div>
            </div>
            <span style="font-family: monospace; font-size: 1.1rem; font-weight: 800; color: #FFB74D;">04:28.2</span>
          </div>
          <div class="sim-progress-bar">
            <div class="sim-progress-fill" style="width: 55%; background: linear-gradient(135deg, #e65100, #ff9800);"></div>
          </div>
          <div class="sim-action-row">
            <button class="sim-btn-accept" style="background: rgba(255,255,255,0.1); color: #fff;">+1 Min</button>
            <button class="sim-btn-decline" style="background: #e65100; color: #fff;">Pause</button>
          </div>
        </div>
      `
    },
    call: {
      collapsed: `
        <div class="sim-collapsed-inner">
          <div class="sim-left">
            <div class="sim-icon-circle" style="color: #4CAF50;">📞</div>
            <span>Sarah Jenkins</span>
          </div>
          <div class="sim-right">
            <span style="color: #81C784; font-size: 0.8rem; font-weight: 700;">Incoming</span>
          </div>
        </div>
      `,
      expanded: `
        <div class="sim-expanded-inner">
          <div class="sim-card-header">
            <div class="sim-art" style="color: #81C784;">👤</div>
            <div class="sim-meta">
              <div class="sim-title">Sarah Jenkins</div>
              <div class="sim-subtitle">Mobile +1 (555) 349-2091</div>
            </div>
            <span class="tier-badge" style="margin:0; font-size: 0.7rem; padding: 2px 8px; color: #81C784; border-color: rgba(129,199,132,0.3); background: rgba(129,199,132,0.1);">Call</span>
          </div>
          <div class="sim-action-row">
            <button class="sim-btn-decline">Decline</button>
            <button class="sim-btn-accept">Accept</button>
          </div>
        </div>
      `
    },
    battery: {
      collapsed: `
        <div class="sim-collapsed-inner">
          <div class="sim-left">
            <div class="sim-icon-circle" style="color: #FFD54F;">⚡</div>
            <span>Fast Charging</span>
          </div>
          <div class="sim-right">
            <span style="color: #81C784; font-weight: 700;">85%</span>
          </div>
        </div>
      `,
      expanded: `
        <div class="sim-expanded-inner">
          <div class="sim-card-header">
            <div class="sim-art" style="color: #FFD54F;">🔋</div>
            <div class="sim-meta">
              <div class="sim-title">Super Fast Charging 2.0</div>
              <div class="sim-subtitle">Connected to 65W USB-PD Adapter</div>
            </div>
            <span style="font-size: 1.1rem; font-weight: 800; color: #81C784;">85%</span>
          </div>
          <div class="sim-progress-bar">
            <div class="sim-progress-fill" style="width: 85%; background: linear-gradient(135deg, #388e3c, #81c784);"></div>
          </div>
          <div style="font-size: 0.78rem; color: var(--text-muted); text-align: center;">
            Approximately <strong>22 minutes</strong> until full
          </div>
        </div>
      `
    },
    reply: {
      collapsed: `
        <div class="sim-collapsed-inner">
          <div class="sim-left">
            <div class="sim-icon-circle" style="color: #25D366;">💬</div>
            <span>Alex: On my way!</span>
          </div>
          <div class="sim-right">
            <span style="color: #25D366; font-size: 0.78rem; font-weight: 700;">Reply ↵</span>
          </div>
        </div>
      `,
      expanded: `
        <div class="sim-expanded-inner">
          <div class="sim-card-header">
            <div class="sim-art" style="color: #25D366;">💬</div>
            <div class="sim-meta">
              <div class="sim-title">Alex Rivera (WhatsApp)</div>
              <div class="sim-subtitle">Hey, are we still meeting at 5pm?</div>
            </div>
            <span class="tier-badge" style="margin:0; font-size: 0.7rem; padding: 2px 8px; color: #25D366; border-color: rgba(37,211,102,0.3); background: rgba(37,211,102,0.1);">WhatsApp</span>
          </div>
          <div class="sim-input-row">
            <input type="text" placeholder="Type inline reply..." value="Yes, see you there!" />
            <button title="Send Reply">➤</button>
          </div>
        </div>
      `
    }
  };

  let currentMode = "music";

  function renderMode(modeKey) {
    if (!modes[modeKey]) return;
    currentMode = modeKey;
    island.innerHTML = modes[modeKey].collapsed + modes[modeKey].expanded;

    pills.forEach((p) => {
      p.classList.toggle("active", p.getAttribute("data-mode") === modeKey);
    });
  }

  // Mode button click
  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const mode = pill.getAttribute("data-mode");
      if (mode) renderMode(mode);
    });
  });

  // Toggle island expansion on click
  island.addEventListener("click", (e) => {
    if (e.target.closest("button") || e.target.closest("input")) {
      return;
    }
    island.classList.toggle("expanded");
  });

  // In-Pill Swipe Left/Right Gesture
  let touchStartX = 0;
  island.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  island.addEventListener("touchend", (e) => {
    const swipeDistance = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(swipeDistance) > 30) {
      const modeKeys = Object.keys(modes);
      const curIdx = modeKeys.indexOf(currentMode);
      if (swipeDistance < 0) {
        const nextIdx = (curIdx + 1) % modeKeys.length;
        renderMode(modeKeys[nextIdx]);
      } else {
        const prevIdx = (curIdx - 1 + modeKeys.length) % modeKeys.length;
        renderMode(modeKeys[prevIdx]);
      }
    }
  }, { passive: true });

  // Initial render
  renderMode("music");
}

