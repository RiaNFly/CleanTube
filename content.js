(() => {
  "use strict";

  const api = typeof browser !== "undefined" ? browser : chrome;
  const DEFECTO = { shorts: true, juegos: true, noticias: true, premium: true, miembros: true, temas: true };
  const cfg = { ...DEFECTO };
  const html = document.documentElement;

  // Los interruptores se reflejan como atributos en <html>; el CSS decide qué ocultar.
  function aplicarAtributos() {
    for (const k of Object.keys(DEFECTO)) {
      if (cfg[k]) html.setAttribute("data-nsp-" + k, "");
      else html.removeAttribute("data-nsp-" + k);
    }
  }
  aplicarAtributos();

  function marcar(el, categoria) {
    if (el.getAttribute("data-nsp-hidden") !== categoria) {
      el.setAttribute("data-nsp-hidden", categoria);
    }
  }

  // Busca selector dentro de una base (incluida la propia base)
  function buscar(base, selector) {
    const r = [];
    if (base.nodeType === 1 && base.matches(selector)) r.push(base);
    for (const e of base.querySelectorAll(selector)) r.push(e);
    return r;
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

  function marcarEnlaces(base, selector, categoria, contenedores) {
    for (const a of buscar(base, selector)) {
      for (const sel of contenedores) {
        const c = a.closest(sel);
        if (c) {
          marcar(c, categoria);
          break;
        }
      }
    }
  }

  function marcarShortsYJuegos(base) {
    marcarEnlaces(base, 'a[href^="/shorts"]', "shorts", CONTENEDORES);
    marcarEnlaces(base, 'a[href^="/playables"]', "juegos", CONTENEDORES);
  }

  // 3) Sección "Últimas noticias" (y variantes) por el título de la balda
  const SEL_BALDAS = "ytd-rich-shelf-renderer, ytd-shelf-renderer";
  const TITULO_NOTICIAS =
    /[úu]ltimas noticias|noticias de [úu]ltima hora|noticias destacadas|noticias principales|[úu]ltimes not[íi]cies|not[íi]cies destacades|breaking news|latest news|top news|top stories/i;
  const NOMBRE_MENU_NOTICIAS = /^(noticias|not[íi]cies|news)$/i;

  function marcarNoticias(base) {
    for (const s of buscar(base, SEL_BALDAS)) {
      if (s.hasAttribute("data-nsp-hidden")) continue;
      const t = s.querySelector("#title, #title-text, h2");
      if (t && TITULO_NOTICIAS.test(t.textContent)) {
        marcar(s.closest("ytd-rich-section-renderer") || s, "noticias");
      }
    }
    for (const e of buscar(base, "ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer")) {
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

  function marcarPremium(base) {
    if (location.pathname.startsWith("/premium")) return;
    for (const a of buscar(base, 'a[href*="premium"]')) {
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

  // 5) Contenido de miembros: vídeos "solo miembros", baldas, botón "Unirse" y banners
  const TEXTO_INSIGNIA_MIEMBROS =
    /^(members only|members first|solo para miembros|exclusivo para miembros|miembros primero|només per a membres)$/i;
  const CLASE_INSIGNIA_MIEMBROS = /members-only|membership/i;
  const TITULO_BALDA_MIEMBROS =
    /members only|members-only|solo para miembros|contenido para miembros|contenido exclusivo para miembros|només per a membres/i;
  const TEXTO_BOTON_UNIRSE =
    /^(join( this channel)?|unirse( a este canal)?|hazte miembro|fes-te membre|unir-te)$/i;
  const CONTENEDORES_VIDEO = [
    "ytd-rich-item-renderer",
    "ytd-video-renderer",
    "ytd-grid-video-renderer",
    "ytd-compact-video-renderer",
    "yt-lockup-view-model",
  ];

  function marcarMiembros(base) {
    for (const b of buscar(base, "ytd-badge-supported-renderer, badge-shape, yt-badge-shape")) {
      const texto = (b.getAttribute("aria-label") || b.textContent || "").trim();
      if (
        !TEXTO_INSIGNIA_MIEMBROS.test(texto) &&
        !CLASE_INSIGNIA_MIEMBROS.test(String(b.className || ""))
      ) {
        continue;
      }
      for (const sel of CONTENEDORES_VIDEO) {
        const c = b.closest(sel);
        if (c) {
          marcar(c, "miembros");
          break;
        }
      }
    }
    for (const s of buscar(base, SEL_BALDAS)) {
      if (s.hasAttribute("data-nsp-hidden")) continue;
      const t = s.querySelector("#title, #title-text, h2");
      if (t && TITULO_BALDA_MIEMBROS.test(t.textContent)) {
        marcar(s.closest("ytd-rich-section-renderer") || s, "miembros");
      }
    }
    for (const e of buscar(base, "yt-button-view-model, button-view-model, ytd-button-renderer")) {
      const texto = (e.textContent || "").replace(/\s+/g, " ").trim();
      if (texto.length < 40 && TEXTO_BOTON_UNIRSE.test(texto)) {
        marcar(e, "miembros");
      }
    }
  }

  // 6) Banners y secciones que se reconocen por su etiqueta de texto
  const CONT_SECCION = [
    "ytd-rich-section-renderer",
    "ytd-shelf-renderer",
    "ytd-rich-shelf-renderer",
  ];
  const REGLAS_ETIQUETA = [
    {
      // Promos propias de YouTube
      re: /^(destacado de youtube|featured by youtube|destacat per youtube|promoted by youtube)$/i,
      cat: "premium",
      cont: [
        "ytd-statement-banner-renderer",
        "ytd-banner-promo-renderer",
        "ytd-primetime-promo-renderer",
        "ytd-brand-video-singleton-renderer",
        "ytd-ad-slot-renderer",
        "ytd-in-feed-ad-layout-renderer",
        "ytd-rich-section-renderer",
      ],
    },
    {
      // "Descubre más temas" / "Explorar más temas"
      re: /^(descubre m[aá]s temas|descubrir m[aá]s temas|explora m[aá]s temas|explorar m[aá]s temas|explore more topics|discover more topics|more topics|descobreix m[eé]s temes|explora m[eé]s temes)$/i,
      cat: "temas",
      cont: CONT_SECCION,
    },
  ];
  const revisados = new WeakSet();

  function marcarPorEtiqueta(base) {
    for (const el of buscar(base, "yt-formatted-string, span, div, p, h2, h3")) {
      if (el.children.length > 0 || revisados.has(el)) continue;
      const texto = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (texto.length === 0) continue; // aún sin texto: se revisará más tarde
      revisados.add(el);
      if (texto.length > 40) continue;

      for (const regla of REGLAS_ETIQUETA) {
        if (!regla.re.test(texto)) continue;
        let objetivo = null;
        for (const sel of regla.cont) {
          objetivo = el.closest(sel);
          if (objetivo) break;
        }
        if (!objetivo) {
          // Si no es un contenedor conocido: subir hasta el elemento que cuelga directamente de #contents
          let n = el;
          for (let i = 0; i < 20 && n && n.parentElement; i++) {
            if (n.parentElement.id === "contents") {
              objetivo = n;
              break;
            }
            n = n.parentElement;
          }
        }
        if (objetivo) marcar(objetivo, regla.cat);
        break;
      }
    }
  }

  // 7) Ejecución ligera: solo se revisan los elementos nuevos, y como mucho cada 250 ms
  const AMPLIO = [
    "ytd-rich-section-renderer",
    "ytd-rich-item-renderer",
    "ytd-rich-shelf-renderer",
    "ytd-shelf-renderer",
    "ytd-video-renderer",
    "ytd-compact-video-renderer",
    "ytd-grid-video-renderer",
    "ytd-guide-entry-renderer",
    "yt-lockup-view-model",
    "ytd-button-renderer",
    "yt-button-view-model",
  ].join(",");

  const nuevos = new Set();
  let completo = false;
  let temporizador = null;

  function programar(nodo) {
    if (nodo === null) completo = true;
    else if (nodo) nuevos.add(nodo);
    if (temporizador) return;
    temporizador = setTimeout(() => {
      temporizador = null;
      pasada();
    }, 250);
  }

  function pasada() {
    if (document.hidden) {
      // Pestaña en segundo plano: no se gasta CPU; se revisa todo al volver
      completo = true;
      nuevos.clear();
      return;
    }
    if (redirigir()) return;
    const bases = completo || nuevos.size > 60 ? [document] : Array.from(nuevos);
    completo = false;
    nuevos.clear();
    for (const b of bases) {
      marcarShortsYJuegos(b);
      marcarNoticias(b);
      marcarPremium(b);
      marcarMiembros(b);
      marcarPorEtiqueta(b);
    }
  }

  function alCambiarElDom(mutaciones) {
    for (const m of mutaciones) {
      if (m.type === "attributes") {
        if (m.target.nodeType === 1) nuevos.add(m.target.closest(AMPLIO) || m.target);
        continue;
      }
      for (const n of m.addedNodes) {
        if (n.nodeType === 1) nuevos.add(n.closest(AMPLIO) || n);
        else if (n.nodeType === 3 && n.parentElement) {
          nuevos.add(n.parentElement.closest(AMPLIO) || n.parentElement);
        }
      }
    }
    programar();
  }

  function iniciar() {
    if (redirigir()) return;
    const alNavegar = () => {
      if (!redirigir()) programar(null);
    };
    document.addEventListener("yt-navigate-start", alNavegar, true);
    document.addEventListener("yt-navigate-finish", alNavegar, true);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) programar(null);
    });
    new MutationObserver(alCambiarElDom).observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["href"],
    });
    // Revisión completa ocasional por si algo se escapó
    setInterval(() => {
      if (!document.hidden) programar(null);
    }, 5000);
    programar(null);
  }

  // Cambios hechos desde el menú: se aplican al instante, sin recargar
  api.storage.onChanged.addListener((cambios, area) => {
    if (area !== "local") return;
    for (const k of Object.keys(DEFECTO)) {
      if (cambios[k]) cfg[k] = !!cambios[k].newValue;
    }
    aplicarAtributos();
    programar(null);
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
