(() => {
  "use strict";

  const api = typeof browser !== "undefined" ? browser : chrome;
  const DEFECTO = { shorts: true, juegos: true, noticias: true, premium: true };
  const cfg = { ...DEFECTO };
  const raiz = document.documentElement;

  // Los interruptores se reflejan como atributos en <html>; el CSS decide qué ocultar.
  function aplicarAtributos() {
    for (const k of Object.keys(DEFECTO)) {
      if (cfg[k]) raiz.setAttribute("data-nsp-" + k, "");
      else raiz.removeAttribute("data-nsp-" + k);
    }
  }
  aplicarAtributos();

  function marcar(el, categoria) {
    el.setAttribute("data-nsp-hidden", categoria);
  }

  // 1) Redirigir /shorts/ID -> /watch?v=ID y /playables -> inicio (solo si está activado)
  function redirigir() {
    const p = location.pathname;
    const m = p.match(/^\/shorts\/([\w-]+)/);
    if (m && cfg.shorts) {
      location.replace(`/watch?v=${m[1]}`);
      return true;
    }
    if (p.startsWith("/playables") && cfg.juegos) {
      location.replace("/");
      return true;
    }
    return false;
  }

  // 2) Shorts y Playables: elementos que enlazan a /shorts o /playables
  const CONTENEDORES = [
    "ytd-rich-section-renderer",
    "ytd-rich-item-renderer",
    "ytd-reel-shelf-renderer",
    "ytd-video-renderer",
    "ytd-grid-video-renderer",
    "ytd-compact-video-renderer",
    "ytd-guide-entry-renderer",
    "ytd-mini-guide-entry-renderer",
    "yt-tab-shape",
    "yt-lockup-view-model",
    "ytm-shorts-lockup-view-model",
  ];

  function marcarEnlaces(selector, categoria, contenedores) {
    for (const a of document.querySelectorAll(selector)) {
      for (const sel of contenedores) {
        const c = a.closest(sel);
        if (c) {
          marcar(c, categoria);
          break;
        }
      }
    }
  }

  function marcarShortsYJuegos() {
    marcarEnlaces('a[href^="/shorts"]', "shorts", CONTENEDORES);
    marcarEnlaces('a[href^="/playables"]', "juegos", CONTENEDORES);
  }

  // 3) Sección "Últimas noticias" (y variantes) por el título de la balda
  const TITULO_NOTICIAS =
    /[úu]ltimas noticias|noticias de [úu]ltima hora|noticias destacadas|noticias principales|[úu]ltimes not[íi]cies|not[íi]cies destacades|breaking news|latest news|top news|top stories/i;
  const NOMBRE_MENU_NOTICIAS = /^(noticias|not[íi]cies|news)$/i;

  function marcarNoticias() {
    for (const s of document.querySelectorAll(
      "ytd-rich-shelf-renderer, ytd-shelf-renderer"
    )) {
      if (s.hasAttribute("data-nsp-hidden")) continue;
      const t = s.querySelector("#title, #title-text, h2");
      if (t && TITULO_NOTICIAS.test(t.textContent)) {
        marcar(s.closest("ytd-rich-section-renderer") || s, "noticias");
      }
    }
    for (const e of document.querySelectorAll(
      "ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer"
    )) {
      const a = e.querySelector("a");
      const nombre = (
        (a && a.getAttribute("title")) ||
        e.getAttribute("aria-label") ||
        ""
      ).trim();
      if (NOMBRE_MENU_NOTICIAS.test(nombre)) marcar(e, "noticias");
    }
  }

  // 4) Promociones de YouTube Premium (botones, menús, banners)
  const ENLACE_PREMIUM =
    /^(https?:\/\/(www\.)?youtube\.com)?\/premium(\/|\?|#|$)/i;
  const CONTENEDORES_PREMIUM = [
    "ytd-banner-promo-renderer",
    "ytd-statement-banner-renderer",
    "ytd-mealbar-promo-renderer",
    "yt-mealbar-promo-renderer",
    "ytd-guide-entry-renderer",
    "ytd-mini-guide-entry-renderer",
    "ytd-compact-link-renderer",
    "yt-button-view-model",
    "ytd-button-renderer",
  ];

  function marcarPremium() {
    if (location.pathname.startsWith("/premium")) return;
    for (const a of document.querySelectorAll('a[href*="premium"]')) {
      if (!ENLACE_PREMIUM.test(a.getAttribute("href") || "")) continue;
      for (const sel of CONTENEDORES_PREMIUM) {
        const c = a.closest(sel);
        if (c) {
          marcar(c, "premium");
          break;
        }
      }
    }
  }

  // 5) Ejecutar al cargar, al navegar (YouTube es una SPA) y al cambiar el DOM
  let pendiente = false;
  function pasada() {
    pendiente = false;
    if (redirigir()) return;
    marcarShortsYJuegos();
    marcarNoticias();
    marcarPremium();
  }
  function programar() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(pasada);
  }

  function iniciar() {
    if (redirigir()) return;
    document.addEventListener("yt-navigate-start", programar, true);
    document.addEventListener("yt-navigate-finish", programar, true);
    new MutationObserver(programar).observe(document, {
      childList: true,
      subtree: true,
    });
    programar();
  }

  // Cambios hechos desde el menú: se aplican al instante, sin recargar
  api.storage.onChanged.addListener((cambios, area) => {
    if (area !== "local") return;
    for (const k of Object.keys(DEFECTO)) {
      if (cambios[k]) cfg[k] = !!cambios[k].newValue;
    }
    aplicarAtributos();
    programar();
  });

  // Cargar los ajustes guardados y arrancar
  let arrancado = false;
  function arrancarUnaVez() {
    if (arrancado) return;
    arrancado = true;
    aplicarAtributos();
    iniciar();
  }
  try {
    api.storage.local
      .get(DEFECTO)
      .then((v) => {
        for (const k of Object.keys(DEFECTO)) cfg[k] = !!v[k];
        arrancarUnaVez();
      })
      .catch(arrancarUnaVez);
  } catch (e) {
    arrancarUnaVez();
  }
})();
