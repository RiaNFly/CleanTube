(() => {
  "use strict";
  const api = typeof browser !== "undefined" ? browser : chrome;
  const DEFECTO = { shorts: true, juegos: true, noticias: true, premium: true, miembros: true, temas: true };

  // Textos traducidos (inglés / español según el idioma del navegador)
  document.documentElement.lang = api.i18n.getUILanguage();
  document.title = api.i18n.getMessage("extName");
  for (const el of document.querySelectorAll("[data-i18n]")) {
    el.textContent = api.i18n.getMessage(el.dataset.i18n);
  }

  const casillas = document.querySelectorAll("input[data-clave]");

  api.storage.local.get(DEFECTO).then((v) => {
    for (const c of casillas) c.checked = !!v[c.dataset.clave];
  });

  for (const c of casillas) {
    c.addEventListener("change", () => {
      api.storage.local.set({ [c.dataset.clave]: c.checked });
    });
  }
})();
