(() => {
  const header = document.querySelector("[data-header]");
  const menu = document.querySelector("[data-mobile-menu]");
  const openBtn = document.querySelector("[data-menu-open]");
  const closeBtn = document.querySelector("[data-menu-close]");

  const prefersReducedMotion = () => {
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
      const pref = localStorage.getItem("empyre-motion-preference");
      if (pref === "reduce" || pref === "reduced") return true;
    } catch (_) {}
    return false;
  };

  const reduced = prefersReducedMotion();
  if (reduced) {
    document.documentElement.setAttribute("data-motion", "reduced");
  } else {
    document.documentElement.classList.add("js-motion");
  }

  const revealOnce = () => {
    const nodes = document.querySelectorAll(".motion-reveal");
    if (!nodes.length) return;
    if (reduced || !("IntersectionObserver" in window)) {
      nodes.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.14 });
    nodes.forEach((el) => io.observe(el));
  };
  revealOnce();

  const bindTilt = () => {
    if (reduced) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      const max = 2;
      const reset = () => {
        el.style.transform = "";
      };
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        const rotY = Math.max(-max, Math.min(max, x * max));
        const rotX = Math.max(-max, Math.min(max, -y * max));
        el.style.transform = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-4px) scale(1.01)`;
      });
      el.addEventListener("pointerleave", reset);
      el.addEventListener("blur", reset);
    });
  };
  bindTilt();

  document.querySelectorAll(".empyre-callout").forEach((el) => {
    el.addEventListener("click", () => {
      const open = el.classList.contains("is-open");
      document.querySelectorAll(".empyre-callout.is-open").forEach((n) => n.classList.remove("is-open"));
      if (!open) el.classList.add("is-open");
    });
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        el.click();
      }
    });
  });

  const live = document.querySelector("[data-soar-status]");
  const announce = (msg) => {
    if (!live) return;
    live.textContent = "";
    window.requestAnimationFrame(() => {
      live.textContent = msg;
    });
  };

  const setHeader = () => {
    if (!header) return;
    const isHome = document.body.classList.contains("is-home");
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const threshold = mobile ? 64 : 96;
    const floating = !isHome || window.scrollY > threshold;
    header.classList.toggle("site-header--floating", floating);
    header.classList.toggle("site-header--hero", !floating);
    header.classList.toggle("is-scrolled", floating);
  };
  setHeader();
  window.addEventListener("scroll", setHeader, { passive: true });
  window.addEventListener("resize", setHeader);

  const meaningStage = document.querySelector("[data-meaning-stage]");
  if (meaningStage) {
    const stories = [
      { id: "duality", number: "01", title: "Duality", copy: "Two separate mirrored E forms appear in silence.", x: 15, y: 32, lineX: 34, lineY: 42 },
      { id: "balance", number: "02", title: "Balance", copy: "The forms align across a precise central axis.", x: 50, y: 12, lineX: 50, lineY: 30 },
      { id: "potential", number: "03", title: "Potential", copy: "Fine construction lines reveal the possible path between them.", x: 20, y: 68, lineX: 38, lineY: 59 },
      { id: "clarity", number: "04", title: "Clarity", copy: "The central curve begins to emerge from the negative space.", x: 43, y: 78, lineX: 48, lineY: 61 },
      { id: "direction", number: "05", title: "Direction", copy: "The S-curve rises, creating movement and intention.", x: 77, y: 22, lineX: 61, lineY: 40 },
      { id: "form", number: "06", title: "Form", copy: "The separate elements become a cohesive sculptural emblem.", x: 86, y: 53, lineX: 67, lineY: 52 },
      { id: "elevation", number: "07", title: "Elevation", copy: "Depth, shadow, and materiality give the symbol presence.", x: 76, y: 78, lineX: 61, lineY: 65 },
      { id: "identity-elevated", number: "08", title: "Identity elevated", copy: "The complete EMPYRÉ STUDIO mark resolves with precision.", x: 50, y: 91, lineX: 50, lineY: 72 }
    ];
    const nodesRoot = meaningStage.querySelector(".empyre-stage__nodes");
    const numEl = meaningStage.querySelector("[data-meaning-number]");
    const titleEl = meaningStage.querySelector("[data-meaning-title]");
    const copyEl = meaningStage.querySelector("[data-meaning-copy]");
    const panel = meaningStage.querySelector("[data-meaning-panel]");
    let active = 0;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    stories.forEach((story, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "empyre-node";
      btn.style.left = story.x + "%";
      btn.style.top = story.y + "%";
      btn.id = "tab-" + story.id;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-controls", "panel-" + story.id);
      btn.setAttribute("aria-label", story.number + ": " + story.title);
      btn.innerHTML = '<span class="empyre-node__index">' + story.number + "</span>";
      btn.addEventListener("click", () => select(index));
      if (fine) btn.addEventListener("mouseenter", () => select(index));
      nodesRoot.appendChild(btn);
    });

    const select = (index) => {
      active = (index + stories.length) % stories.length;
      const story = stories[active];
      nodesRoot.querySelectorAll(".empyre-node").forEach((btn, i) => {
        const on = i === active;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-selected", String(on));
        btn.tabIndex = on ? 0 : -1;
      });
      if (numEl) numEl.textContent = story.number;
      if (titleEl) titleEl.textContent = story.title;
      if (copyEl) copyEl.textContent = story.copy;
      if (panel) {
        panel.id = "panel-" + story.id;
        panel.setAttribute("aria-labelledby", "tab-" + story.id);
      }
    };

    meaningStage.querySelector("[data-meaning-prev]")?.addEventListener("click", () => select(active - 1));
    meaningStage.querySelector("[data-meaning-next]")?.addEventListener("click", () => select(active + 1));
    meaningStage.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        select(active + 1);
        nodesRoot.querySelector(".is-active")?.focus();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        select(active - 1);
        nodesRoot.querySelector(".is-active")?.focus();
      }
    });
    select(0);
  }
  window.addEventListener("resize", setHeader);

  const setMenu = (open) => {
    if (!menu || !openBtn) return;
    menu.hidden = !open;
    openBtn.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
    if (open) {
      const focusables = [...menu.querySelectorAll("a, button")].filter((el) => !el.hasAttribute("disabled"));
      (closeBtn || focusables[0])?.focus();
    } else {
      openBtn.focus();
    }
  };
  openBtn?.addEventListener("click", () => setMenu(true));
  closeBtn?.addEventListener("click", () => setMenu(false));
  menu?.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (!menu || menu.hidden) return;
    if (e.key === "Escape") {
      setMenu(false);
      return;
    }
    if (e.key !== "Tab") return;
    const focusables = [...menu.querySelectorAll("a, button")].filter((el) => !el.hasAttribute("disabled"));
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  const form = document.querySelector("[data-inquiry-form]");
  if (form) {
    const step1 = form.querySelector("[data-step='1']");
    const step2 = form.querySelector("[data-step='2']");
    const nextBtn = form.querySelector("[data-next-step]");
    const backBtn = form.querySelector("[data-back-step]");
    const status = form.querySelector("[data-form-status]");
    const summary = form.querySelector("[data-form-summary]");
    const submitBtn = form.querySelector("button[type='submit']");
    const params = new URLSearchParams(window.location.search);
    const service = params.get("service");
    if (service) {
      const select = form.querySelector("[name='service']");
      if (select) select.value = service;
    }

    const requiredIn = (root) =>
      [...root.querySelectorAll("[required]")].filter((el) => !el.closest(".hp"));

    const showStatus = (msg, isError = true) => {
      if (!status) return;
      status.hidden = !msg;
      status.textContent = msg || "";
      status.classList.toggle("is-success", Boolean(msg) && !isError);
      status.setAttribute("role", isError ? "alert" : "status");
      if (summary) summary.textContent = msg || "";
    };

    const validate = (root) => {
      for (const el of requiredIn(root)) {
        if (!el.checkValidity()) {
          el.reportValidity();
          el.focus();
          return false;
        }
      }
      return true;
    };

    nextBtn?.addEventListener("click", () => {
      if (!validate(step1)) {
        showStatus("Complete the first step before continuing.");
        return;
      }
      showStatus("");
      step1.hidden = true;
      step2.hidden = false;
      step2.querySelector("input, select, textarea")?.focus();
    });

    backBtn?.addEventListener("click", () => {
      step2.hidden = true;
      step1.hidden = false;
      showStatus("");
      step1.querySelector("input")?.focus();
    });

    const setTrackingFields = () => {
      const values = {
        "landing-page-url": window.location.href,
        referrer: document.referrer,
        "utm-source": params.get("utm_source") || "",
        "utm-medium": params.get("utm_medium") || "",
        "utm-campaign": params.get("utm_campaign") || "",
        "utm-term": params.get("utm_term") || "",
        "utm-content": params.get("utm_content") || "",
      };
      Object.entries(values).forEach(([name, value]) => {
        const field = form.elements.namedItem(name);
        if (field) field.value = value;
      });
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validate(form)) {
        showStatus("Review the highlighted fields and confirm privacy consent.");
        summary?.focus();
        return;
      }
      if (!submitBtn || submitBtn.disabled) return;
      setTrackingFields();
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-busy", "true");
      showStatus("Sending your inquiry…", false);
      try {
        const result = await fetch(form.action, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });
        const data = await result.json().catch(() => ({}));
        if (!result.ok || !data.ok) throw new Error("Inquiry submission failed");
        showStatus("Thank you. Your inquiry has been received. Empyré Studio will be in touch shortly.", false);
        summary?.focus();
      } catch (_) {
        showStatus("Your inquiry could not be sent right now. Please try again shortly.");
        summary?.focus();
      } finally {
        submitBtn.disabled = false;
        submitBtn.removeAttribute("aria-busy");
      }
    });
  }

  const ATMOSPHERE_HTML = `
    <div class="atmosphere" aria-hidden="true">
      <div class="atmosphere__far"></div>
      <div class="atmosphere__mid"></div>
      <div class="atmosphere__near"></div>
      <div class="atmosphere__spot"></div>
      <div class="atmosphere__grain"></div>
    </div>
    <div class="atmosphere__sheen" aria-hidden="true"></div>
    <img class="atmosphere__mark" src="/assets/img/logo/lockup-200.png" width="200" height="156" alt="" decoding="async">
  `;

  const LOADER_HTML = `
    <div class="loader-rise">
      <div class="loader-rise__sky"></div>
      <div class="loader-rise__cloud loader-rise__cloud--far"></div>
      <div class="loader-rise__cloud loader-rise__cloud--mid"></div>
      <div class="loader-rise__emblem-wrap">
        <img class="loader-rise__emblem" src="/assets/img/emblem-3d/empyre-gold-cloud.png" width="1800" height="1800" alt="" decoding="async">
      </div>
      <div class="loader-rise__cloud loader-rise__cloud--near"></div>
      <div class="loader-rise__mist" aria-hidden="true"></div>
      <p class="loader-rise__quote">“We say it Em-Py-Rei—a name that rises as it is spoken.”</p>
    </div>
  `;

  const mountOverlay = (mode) => {
    const existing = document.querySelector("[data-cinematic-overlay]");
    if (existing) existing.remove();
    const el = document.createElement("div");
    el.className = "cinematic-overlay" + (mode === "load" ? " cinematic-overlay--rise" : "");
    el.setAttribute("data-cinematic-overlay", "");
    el.setAttribute("data-mode", mode);
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = mode === "load" ? LOADER_HTML : ATMOSPHERE_HTML;
    const img = el.querySelector(".atmosphere__mark");
    if (img) {
      img.addEventListener("error", () => {
        const fallback = document.createElement("p");
        fallback.className = "atmosphere__mark";
        fallback.style.cssText = "margin:0;font-size:clamp(1.4rem,4vw,2.4rem);letter-spacing:.28em;text-transform:uppercase;font-weight:300;color:#ece9e4;text-align:center;animation:mark-load 1.15s cubic-bezier(.22,.61,.36,1) .28s both";
        fallback.innerHTML = "Empyré<br>Studio";
        img.replaceWith(fallback);
      });
    }
    document.body.appendChild(el);
    document.body.classList.add("empyre-cinematic");
    return el;
  };

  const unmountOverlay = (el) => {
    if (!el) {
      document.body.classList.remove("empyre-cinematic");
      document.documentElement.classList.remove("empyre-loading");
      return;
    }
    el.classList.add("is-leaving");
    window.setTimeout(() => {
      el.remove();
      document.body.classList.remove("empyre-cinematic");
      document.documentElement.classList.remove("empyre-loading");
    }, reduced ? 0 : 420);
  };

  /* ——— Cinematic loader: GIF on Home, skippable, not session-gated ——— */
  const runLoader = () => {
    const finishGate = () => {
      document.documentElement.classList.remove("empyre-loading");
    };

    const existing = document.querySelector("[data-cinematic-overlay][data-mode='load']");
    const isHome = document.body.classList.contains("is-home") || !!existing;

    if (reduced || !isHome) {
      existing?.remove();
      finishGate();
      return;
    }

    let overlay = existing;
    let done = false;
    const MAX = 9310;
    const HARD = 9800;
    const timers = [];

    const complete = () => {
      if (done) return;
      done = true;
      timers.forEach((id) => window.clearTimeout(id));
      unmountOverlay(overlay);
      finishGate();
    };

    try {
      if (!overlay) overlay = mountOverlay("load");
      overlay.addEventListener("click", complete);
    } catch (_) {
      complete();
      return;
    }

    timers.push(window.setTimeout(complete, MAX));
    timers.push(window.setTimeout(complete, HARD));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") complete();
    }, { once: true });
  };

  try {
    runLoader();
  } catch (_) {
    document.documentElement.classList.remove("empyre-loading");
  }

  /* ——— SOAR ——— */
  const soarBtn = document.querySelector("[data-soar]");
  if (soarBtn) {
    let soarState = "idle";
    const timers = [];
    const clearTimers = () => {
      timers.splice(0).forEach((id) => window.clearTimeout(id));
    };

    const hero = document.getElementById("hero");
    const updateVisibility = () => {
      if (soarState !== "idle") return;
      const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : window.innerHeight;
      const threshold = heroBottom + window.innerHeight * 0.8;
      const show = window.scrollY >= threshold;
      soarBtn.hidden = !show;
    };
    soarBtn.hidden = true;
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    const focusHero = () => {
      const title = document.getElementById("hero-title");
      if (!title) return;
      if (!title.hasAttribute("tabindex")) title.tabIndex = -1;
      try {
        title.focus({ preventScroll: true });
      } catch (_) {
        title.focus();
      }
    };

    const scrollTopInstant = () => {
      window.scrollTo({ top: 0, behavior: "auto" });
    };

    const completeSoar = () => {
      if (soarState === "idle") return;
      soarState = "idle";
      clearTimers();
      scrollTopInstant();
      const overlay = document.querySelector("[data-cinematic-overlay]");
      unmountOverlay(overlay);
      document.body.classList.remove("empyre-cinematic");
      document.documentElement.classList.remove("empyre-loading");
      window.setTimeout(() => {
        focusHero();
        announce("Returned to the top of the page.");
        updateVisibility();
      }, overlay && !reduced ? 400 : 0);
    };

    const startSoar = () => {
      if (soarState !== "idle") return;
      announce("Returning to the beginning.");

      if (reduced) {
        scrollTopInstant();
        focusHero();
        announce("Returned to the top of the page.");
        return;
      }

      soarState = "entering";
      let overlay;
      try {
        overlay = mountOverlay("soar");
      } catch (_) {
        scrollTopInstant();
        focusHero();
        announce("Returned to the top of the page.");
        soarState = "idle";
        return;
      }

      const onEscape = (e) => {
        if (e.key === "Escape") completeSoar();
      };
      document.addEventListener("keydown", onEscape);
      overlay.addEventListener("click", completeSoar);

      const cleanup = () => document.removeEventListener("keydown", onEscape);
      const finish = () => {
        cleanup();
        completeSoar();
      };

      timers.push(window.setTimeout(() => {
        soarState = "returning";
        scrollTopInstant();
      }, 1000));

      timers.push(window.setTimeout(() => {
        soarState = "leaving";
      }, 1250));

      timers.push(window.setTimeout(finish, 1700));
      timers.push(window.setTimeout(finish, 2200));
    };

    soarBtn.addEventListener("click", (e) => {
      e.preventDefault();
      try {
        startSoar();
      } catch (_) {
        scrollTopInstant();
        focusHero();
        announce("Returned to the top of the page.");
        soarState = "idle";
      }
    });
  }
})();
