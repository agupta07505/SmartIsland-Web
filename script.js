/**
 * Smart Island Web - Minimal, Fast & Uncluttered Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initActiveNavObserver();
  initShowcase();
  initLightbox();
});

/* ==========================================================================
   1. Mobile Navigation Toggle & Scroll Lock
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
  const tabs = document.querySelectorAll(".showcase-tab");
  const titleEl = document.getElementById("showcase-title");
  const descEl = document.getElementById("showcase-desc");

  if (!track || !cards.length) return;

  let currentIndex = 0;

  function updateSlider() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    cards.forEach((card, idx) => {
      card.classList.toggle("active", idx === currentIndex);
    });

    // Update active tab button
    tabs.forEach((tab) => {
      const tabIdx = parseInt(tab.getAttribute("data-index"), 10);
      tab.classList.toggle("active", tabIdx === currentIndex);
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

  // Render pagination dots
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

  // Tab buttons click
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const idx = parseInt(tab.getAttribute("data-index"), 10);
      if (!isNaN(idx) && idx >= 0 && idx < cards.length) {
        currentIndex = idx;
        updateSlider();
      }
    });
  });

  // Prev / Next button controls
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
