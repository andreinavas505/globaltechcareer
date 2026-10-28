(() => {
  const toggle = document.getElementById("language-toggle");
  const menuButton = document.getElementById("menu");
  const nav = document.getElementById("nav");
  const year = document.getElementById("year");
  let language = "en";
  const titles = {
    en: "International Tech Career Course | Global Tech Career",
    es: "Curso de Carrera Tech Internacional | Global Tech Career"
  };
  const descriptions = {
    en: "Build a focused international tech job search with an online course covering career strategy, resumes, LinkedIn, interviews, and AI-powered opportunity assessment.",
    es: "Organiza tu búsqueda laboral tech internacional con un curso online de estrategia, CV, LinkedIn, entrevistas y evaluación de oportunidades con IA."
  };
  function setLanguage(next) {
    language = next;
    document.documentElement.lang = language;
    document.querySelectorAll("[data-en][data-es]").forEach((el) => {
      if (el.dataset[language] !== undefined) el.innerHTML = el.dataset[language];
    });
    if (toggle) {
      toggle.textContent = language === "en" ? "ES ↗" : "EN ↗";
      toggle.setAttribute("aria-label", language === "en" ? "Switch language to Spanish" : "Cambiar idioma a inglés");
    }
    document.title = titles[language];
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = descriptions[language];
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogTitle) ogTitle.content = language === "en" ? "The International Tech Career Playbook | Global Tech Career" : "The International Tech Career Playbook | Global Tech Career";
    if (ogDescription) ogDescription.content = descriptions[language];
  }
  toggle?.addEventListener("click", () => setLanguage(language === "en" ? "es" : "en"));
  menuButton?.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  }));
  if (year) year.textContent = new Date().getFullYear();
})();