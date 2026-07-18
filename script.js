const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const navLinks = [...document.querySelectorAll(".nav a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

navToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("open");
  document.body.classList.toggle("nav-open", Boolean(isOpen));
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav?.classList.remove("open");
    document.body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  { rootMargin: "-30% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] }
);

sections.forEach((section) => observer.observe(section));

// Lightbox Modal Handling for Screenshots Zoom
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxTriggers = document.querySelectorAll(".lightbox-trigger");

lightboxTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const imgSrc = trigger.getAttribute("data-img") || trigger.querySelector("img")?.src;
    const captionText = trigger.querySelector("figcaption")?.textContent || "";
    if (lightboxImg && lightbox) {
      lightboxImg.src = imgSrc;
      if (lightboxCaption) lightboxCaption.textContent = captionText;
      lightbox.classList.add("active");
      lightbox.setAttribute("aria-hidden", "false");
    }
  });
});

lightboxClose?.addEventListener("click", () => {
  lightbox?.classList.remove("active");
  lightbox?.setAttribute("aria-hidden", "true");
});

lightbox?.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightbox?.classList.contains("active")) {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
  }
});
