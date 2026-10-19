/**
 * Smart Island Web - Minimal, Fast & Interactive Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initActiveNavObserver();
  initShowcase();
  initLightbox();
  initSimulator();
});

/* ==========================================================================
   1. Mobile Navigation
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
   2. Active Section Scroll Observer
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
   3. App Screenshots Showcase Slider
   ========================================================================== */
function initShowcase() {
  const track = document.getElementById("showcase-track");
  const cards = Array.from(document.querySelectorAll(".showcase-card"));
  const prevBtn = document.getElementById("slider-prev");
  const nextBtn = document.getElementById("slider-next");
  const dotsContainer = document.getElementById("showcase-dots");
  const titleEl = document.getElementById("showcase-title");
  const descEl = document.getElementById("showcase-desc");

  if (!track || !cards.length) return;

  let currentIndex = 0;

  function updateSlider() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    cards.forEach((card, idx) => {
      card.classList.toggle("active", idx === currentIndex);
    });

    const activeCard = cards[currentIndex];
    if (activeCard) {
      if (titleEl) titleEl.textContent = activeCard.getAttribute("data-title") || "";
      if (descEl) descEl.textContent = activeCard.getAttribute("data-desc") || "";
    }

    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll(".showcase-dot");
      dots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === currentIndex);
      });
    }
  }

  // Render dots
  if (dotsContainer) {
    dotsContainer.innerHTML = "";
    cards.forEach((_, idx) => {
      const dot = document.createElement("div");
      dot.className = `showcase-dot ${idx === 0 ? "active" : ""}`;
      dot.setAttribute("role", "button");
      dot.setAttribute("aria-label", `Slide ${idx + 1}`);
      dot.addEventListener("click", () => {
        currentIndex = idx;
        updateSlider();
      });
      dotsContainer.appendChild(dot);
    });
  }

  // Controls
  prevBtn?.addEventListener("click", () => {
    currentIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
    updateSlider();
  });

  nextBtn?.addEventListener("click", () => {
    currentIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
    updateSlider();
  });

  // Keyboard navigation when in view
  document.addEventListener("keydown", (e) => {
    const showcaseSection = document.getElementById("showcase");
    if (!showcaseSection) return;
    const rect = showcaseSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      if (e.key === "ArrowLeft") {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
        updateSlider();
      } else if (e.key === "ArrowRight") {
        currentIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
        updateSlider();
      }
    }
  });

  // Touch Swipe Support
  let touchStartX = 0;
  track.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener("touchend", (e) => {
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        currentIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
      } else {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
      }
      updateSlider();
    }
  }, { passive: true });

  updateSlider();
}

/* ==========================================================================
   4. Lightbox Modal Preview
   ========================================================================== */
function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.getElementById("lightbox-close");

  if (!lightbox) return;

  document.addEventListener("click", (e) => {
    const card = e.target.closest(".showcase-card");
    if (card) {
      const imgSrc = card.getAttribute("data-img") || card.querySelector("img")?.src;
      const title = card.getAttribute("data-title") || "";
      const desc = card.getAttribute("data-desc") || "";

      if (lightboxImg && imgSrc) {
        lightboxImg.src = imgSrc;
        if (lightboxCaption) lightboxCaption.textContent = title ? `${title} — ${desc}` : "";
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
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("active")) {
      closeLightbox();
    }
  });
}

/* ==========================================================================
   5. Interactive Island Simulator
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
            <span class="sim-icon-circle" style="color: #FF7043;">🎵</span>
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
              <div class="sim-subtitle">The Weeknd &bull; After Hours</div>
            </div>
            <span style="font-size: 0.7rem; padding: 2px 8px; border-radius: 9999px; background: rgba(255,255,255,0.08); color: #fff;">Spotify</span>
          </div>
          <div class="sim-progress-bar">
            <div class="sim-progress-fill" style="width: 58%;"></div>
          </div>
          <div class="sim-controls">
            <button class="sim-control-btn" title="Previous Track" aria-label="Previous">⏮</button>
            <button class="sim-control-btn" style="font-size: 1.25rem; color: #FF7043;" title="Pause" aria-label="Pause">⏸</button>
            <button class="sim-control-btn" title="Next Track" aria-label="Next">⏭</button>
          </div>
        </div>
      `
    },
    idle: {
      collapsed: `
        <div class="sim-collapsed-inner">
          <div class="sim-left">
            <span class="sim-icon-circle" style="color: #64B5F6;">⛅</span>
            <span>24°C Sunny</span>
          </div>
          <div class="sim-right">
            <span style="color: #e2e8f0; font-family: monospace; font-weight: 700;">10:42</span>
          </div>
        </div>
      `,
      expanded: `
        <div class="sim-expanded-inner">
          <div class="sim-card-header">
            <div class="sim-art" style="color: #64B5F6;">⛅</div>
            <div class="sim-meta">
              <div class="sim-title">Sunny &bull; 24°C (H: 27° L: 18°)</div>
              <div class="sim-subtitle">Next: Team Sync at 11:00 AM</div>
            </div>
            <span style="font-size: 0.7rem; padding: 2px 8px; border-radius: 9999px; background: rgba(100,181,246,0.15); color: #64B5F6;">Idle Widget</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 12px 0 4px 0; font-size: 0.75rem; text-align: center;">
            <div style="background: rgba(255,255,255,0.05); padding: 6px; border-radius: 8px;">
              <div style="color: var(--text-dim); font-size: 0.7rem;">Rain Chance</div>
              <div style="font-weight: 700; color: #fff; margin-top: 2px;">10%</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 6px; border-radius: 8px;">
              <div style="color: var(--text-dim); font-size: 0.7rem;">Net Speed</div>
              <div style="font-weight: 700; color: #81C784; margin-top: 2px;">1.4 MB/s</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 6px; border-radius: 8px;">
              <div style="color: var(--text-dim); font-size: 0.7rem;">Next Alarm</div>
              <div style="font-weight: 700; color: #FFB74D; margin-top: 2px;">07:00 AM</div>
            </div>
          </div>
        </div>
      `
    },
    nav: {
      collapsed: `
        <div class="sim-collapsed-inner">
          <div class="sim-left">
            <span class="sim-icon-circle" style="color: #4CAF50;">↗️</span>
            <span>Turn Right 200m</span>
          </div>
          <div class="sim-right">
            <span style="color: #4CAF50; font-weight: 700;">12 min</span>
          </div>
        </div>
      `,
      expanded: `
        <div class="sim-expanded-inner">
          <div class="sim-card-header">
            <div class="sim-art" style="color: #4CAF50;">🧭</div>
            <div class="sim-meta">
              <div class="sim-title">Turn Right on Grand Ave</div>
              <div class="sim-subtitle">In 200 meters &bull; Then keep left</div>
            </div>
            <span style="font-size: 0.7rem; padding: 2px 8px; border-radius: 9999px; background: rgba(76,175,80,0.15); color: #81C784;">Maps</span>
          </div>
          <div class="sim-progress-bar">
            <div class="sim-progress-fill" style="width: 72%; background: #4CAF50;"></div>
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
            <span class="sim-icon-circle" style="color: #FF9800;">⏱️</span>
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
              <div class="sim-subtitle">Target: 8:00 &bull; 3:32 elapsed</div>
            </div>
            <span style="font-family: monospace; font-size: 1.05rem; font-weight: 800; color: #FFB74D;">04:28</span>
          </div>
          <div class="sim-progress-bar">
            <div class="sim-progress-fill" style="width: 55%; background: #FF9800;"></div>
          </div>
          <div class="sim-action-row">
            <button class="sim-btn-accept" style="background: rgba(255,255,255,0.08); color: #fff;">+1 Min</button>
            <button class="sim-btn-decline" style="background: #e65100; color: #fff;">Pause</button>
          </div>
        </div>
      `
    },
    call: {
      collapsed: `
        <div class="sim-collapsed-inner">
          <div class="sim-left">
            <span class="sim-icon-circle" style="color: #4CAF50;">📞</span>
            <span>Sarah Jenkins</span>
          </div>
          <div class="sim-right">
            <span style="color: #81C784; font-weight: 700;">Incoming</span>
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
            <span style="font-size: 0.7rem; padding: 2px 8px; border-radius: 9999px; background: rgba(129,199,132,0.15); color: #81C784;">Call</span>
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
            <span class="sim-icon-circle" style="color: #FFD54F;">⚡</span>
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
            <div class="sim-progress-fill" style="width: 85%; background: #388e3c;"></div>
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
            <span class="sim-icon-circle" style="color: #25D366;">💬</span>
            <span>Alex: On my way!</span>
          </div>
          <div class="sim-right">
            <span style="color: #25D366; font-weight: 700;">Reply ↵</span>
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
            <span style="font-size: 0.7rem; padding: 2px 8px; border-radius: 9999px; background: rgba(37,211,102,0.15); color: #25D366;">WhatsApp</span>
          </div>
          <div class="sim-input-row">
            <input type="text" placeholder="Type inline reply..." value="Yes, see you there!" />
            <button title="Send Reply">Send</button>
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

  // Pill click
  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const mode = pill.getAttribute("data-mode");
      if (mode) renderMode(mode);
    });
  });

  // Island click to expand/collapse
  island.addEventListener("click", (e) => {
    if (e.target.closest("button") || e.target.closest("input")) return;
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
