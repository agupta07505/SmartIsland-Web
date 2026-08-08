/**
 * Smart Island Web - Dynamic Functionality, GitHub API & 3D Coverflow Carousel
 */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initActiveNavObserver();
  initCoverflowCarousel();
  initLightbox();
  fetchGitHubDownloads();
});

/* ==========================================================================
   1. Dynamic GitHub Downloads Fetch & Counter Animation
   ========================================================================== */
async function fetchGitHubDownloads() {
  const downloadEl = document.getElementById("stat-downloads-count");
  const badgeEl = document.getElementById("hero-downloads-badge");

  const FALLBACK_COUNT = 2350;

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
      badgeEl.textContent = "2.3K+ Downloads";
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
