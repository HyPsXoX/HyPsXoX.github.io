const sections = document.querySelectorAll("[data-reveal]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const matrixCharacters = "アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const glitchSessions = new WeakMap();

document.querySelectorAll(".waveform-shape").forEach((shape) => {
  shape.style.setProperty("--pulse-duration", `${2.4 + Math.random() * 2.8}s`);
  shape.style.setProperty("--pulse-delay", `${Math.random() * 2.5}s`);
});

function prepareGlitchText(element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node;

  while ((node = walker.nextNode())) {
    if (node.textContent.trim()) textNodes.push(node);
  }

  textNodes.forEach((textNode) => {
    const fragment = document.createDocumentFragment();
    [...textNode.textContent].forEach((character) => {
      const span = document.createElement("span");
      span.className = "glitch-char";
      span.dataset.original = character;
      span.textContent = character;
      fragment.appendChild(span);
    });
    textNode.replaceWith(fragment);
  });
}

function restoreGlitches(element) {
  element.querySelectorAll(".glitch-char").forEach((character) => {
    character.textContent = character.dataset.original;
    character.classList.remove("is-glitching");
  });
}

function glitchCharacter(character, session) {
  const duration = 100 + Math.random() * 200;

  character.classList.add("is-glitching");
  character.textContent =
    matrixCharacters[Math.floor(Math.random() * matrixCharacters.length)];

  const restoreTimeout = window.setTimeout(() => {
    character.textContent = character.dataset.original;
    character.classList.remove("is-glitching");
  }, duration);
  session.timeouts.push(restoreTimeout);
}

function startTypingGlitch(element, session) {
  const characters = [...element.querySelectorAll(".glitch-char")];
  const step = 1000 / Math.max(characters.length, 1);

  characters.forEach((character, index) => {
    if (character.dataset.original.trim()) {
      character.classList.add("is-glitching");
      character.textContent =
        matrixCharacters[Math.floor(Math.random() * matrixCharacters.length)];
    }

    const revealTimeout = window.setTimeout(() => {
      if (!character.dataset.original.trim()) return;

      character.classList.add("is-glitching");
      character.textContent =
        matrixCharacters[Math.floor(Math.random() * matrixCharacters.length)];

      const restoreTimeout = window.setTimeout(() => {
        character.textContent = character.dataset.original;
        character.classList.remove("is-glitching");
      }, Math.min(120, step * 0.8));

      session.timeouts.push(restoreTimeout);
    }, index * step);

    session.timeouts.push(revealTimeout);
  });
}

function scheduleParagraphGlitch(element, session) {
  const idleTimeout = window.setTimeout(() => {
    if (glitchSessions.get(session.element) !== session) return;

    const characters = [...element.querySelectorAll(".glitch-char")].filter(
      (character) => character.dataset.original.trim()
    );
    const count = Math.min(
      characters.length,
      3 + Math.floor(Math.random() * 3)
    );
    characters
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .forEach((character) => glitchCharacter(character, session));
    scheduleParagraphGlitch(element, session);
  }, 2000 + Math.random() * 3000);
  session.timeouts.push(idleTimeout);
}

function stopGlitchSession(element) {
  const session = glitchSessions.get(element);
  if (!session) return;

  window.clearInterval(session.interval);
  window.clearTimeout(session.timeout);
  session.timeouts.forEach((timeout) => window.clearTimeout(timeout));
  glitchSessions.delete(element);
  restoreGlitches(element);
}

function startGlitchSession(element) {
  if (reducedMotion) return;

  stopGlitchSession(element);
  restoreGlitches(element);
  const session = {
    element,
    interval: null,
    timeout: null,
    timeouts: [],
  };
  glitchSessions.set(element, session);
  startTypingGlitch(element, session);
  const timeout = window.setTimeout(() => {
    restoreGlitches(element);
    scheduleParagraphGlitch(element, session);
  }, 1000);
  session.timeout = timeout;
}

if (reducedMotion) {
  sections.forEach((section) => section.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
        entry.target.classList.toggle("is-hidden", !entry.isIntersecting);
        if (entry.isIntersecting) {
          entry.target.querySelectorAll("[data-glitch]").forEach(startGlitchSession);
        } else {
          entry.target.querySelectorAll("[data-glitch]").forEach(stopGlitchSession);
        }
      });
    },
    { threshold: 0.16 }
  );

  sections.forEach((section) => observer.observe(section));
  document.querySelectorAll("[data-glitch]").forEach(prepareGlitchText);
  document.querySelectorAll("[data-glitch]").forEach((element) => {
    element.addEventListener("click", () => startGlitchSession(element));
  });

}
