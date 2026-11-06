const sections = document.querySelectorAll("[data-reveal]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reducedMotion) {
  sections.forEach((section) => section.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
        entry.target.classList.toggle("is-hidden", !entry.isIntersecting);
      });
    },
    { threshold: 0.16 }
  );

  sections.forEach((section) => observer.observe(section));
}
