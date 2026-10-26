(() => {
  const toggle = document.getElementById("language-toggle");
  const menuButton = document.getElementById("menu");
  const nav = document.getElementById("nav");
  const year = document.getElementById("year");
  let language = "en";
  function setLanguage(next) {
    language = next;
    document.documentElement.lang = language;
    document.querySelectorAll("[data-en][data-es]").forEach((el) => {
      if (el.dataset[language] !== undefined) el.innerHTML = el.dataset[language];
    });
    if (toggle) toggle.textContent = language === "en" ? "ES ↗" : "EN ↗";
    document.title = language === "en" ? "Global Tech Career — Build your next career move" : "Global Tech Career — Impulsa tu próximo paso profesional";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = language === "en"
      ? "Practical career tools for infrastructure, cloud, DevOps, SRE and platform engineering professionals."
      : "Herramientas prácticas de carrera para profesionales de infraestructura, cloud, DevOps, SRE y platform engineering.";
  }
  toggle?.addEventListener("click", () => setLanguage(language === "en" ? "es" : "en"));
  menuButton?.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => nav.classList.remove("open")));
  if (year) year.textContent = new Date().getFullYear();
})();