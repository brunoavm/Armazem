(function () {
  "use strict";

  /* ============================================
     Ano no rodapé
     ============================================ */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================
     Menu mobile
     ============================================ */
  var menuToggle = document.getElementById("menuToggle");
  var mainNav = document.getElementById("mainNav");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ============================================
     Navegação ativa conforme a seção visível
     ============================================ */
  var navLinks = document.querySelectorAll("[data-nav]");
  var sections = [];
  navLinks.forEach(function (link) {
    var id = link.getAttribute("href");
    if (id && id.charAt(0) === "#") {
      var section = document.querySelector(id);
      if (section) sections.push({ link: link, section: section });
    }
  });

  if ("IntersectionObserver" in window && sections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var match = sections.find(function (s) { return s.section === entry.target; });
          if (!match) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove("is-active"); });
            match.link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { observer.observe(s.section); });
  }

  /* ============================================
     Filtro de equipamentos
     ============================================ */
  var filterButtons = document.querySelectorAll(".filter-btn");
  var equipCards = document.querySelectorAll(".equip-card");

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = btn.getAttribute("data-filter");

      filterButtons.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");

      equipCards.forEach(function (card) {
        var category = card.getAttribute("data-category");
        var show = target === "todos" || category === target;
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* ============================================
     Modal de detalhes do equipamento
     ============================================ */
  var modal = document.getElementById("equipModal");
  var modalIcon = document.getElementById("modalIcon");
  var modalTag = document.getElementById("modalTag");
  var modalTitle = document.getElementById("modalTitle");
  var modalDetail = document.getElementById("modalDetail");
  var modalCta = document.getElementById("modalCta");
  var lastFocused = null;

  function openModal(data) {
    modalTag.textContent = data.tag;
    modalTitle.textContent = data.name;
    modalDetail.textContent = data.detail;
    modalIcon.innerHTML = data.iconHTML || "";
    modalIcon.classList.toggle("modal-icon--photo", !!data.isPhoto);
    modalCta.href = "https://wa.me/5581999999999?text=" + encodeURIComponent("Olá! Gostaria de orçar a locação de: " + data.name);

    lastFocused = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-close").focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll(".equip-more").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".equip-card");
      var visual = card ? card.querySelector(".equip-icon, .equip-photo") : null;
      var iconHTML = visual ? visual.innerHTML : "";
      var isPhoto = !!(visual && visual.classList.contains("equip-photo"));
      openModal({
        name: btn.getAttribute("data-name"),
        tag: btn.getAttribute("data-tag"),
        detail: btn.getAttribute("data-detail"),
        iconHTML: iconHTML,
        isPhoto: isPhoto
      });
    });
  });

  if (modal) {
    modal.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });
  }

  /* ============================================
     Seletor interativo de unidades
     ============================================ */
  var locTabs = document.querySelectorAll(".loc-tab");
  var locPins = document.querySelectorAll(".loc-pin");
  var locPanels = document.querySelectorAll(".loc-panel");

  function setActiveLocation(key) {
    locTabs.forEach(function (tab) {
      var active = tab.getAttribute("data-loc") === key;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    locPins.forEach(function (pin) {
      pin.classList.toggle("is-active", pin.getAttribute("data-loc") === key);
    });

    locPanels.forEach(function (panel) {
      var match = panel.getAttribute("data-loc") === key;
      panel.hidden = !match;
      if (match) {
        panel.classList.remove("is-entering");
        // força reflow para reiniciar a animação
        void panel.offsetWidth;
        panel.classList.add("is-entering");
      }
    });
  }

  locTabs.forEach(function (tab) {
    tab.addEventListener("click", function () { setActiveLocation(tab.getAttribute("data-loc")); });
  });
  locPins.forEach(function (pin) {
    pin.addEventListener("click", function () { setActiveLocation(pin.getAttribute("data-loc")); });
  });

  /* ============================================
     Busca rápida do hero: liga filtro + unidade
     ============================================ */
  var finderForm = document.getElementById("finderForm");
  if (finderForm) {
    finderForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var category = document.getElementById("finderCategory").value;
      var unit = document.getElementById("finderUnit").value;

      var targetFilter = document.querySelector('.filter-btn[data-filter="' + category + '"]');
      if (targetFilter) targetFilter.click();

      setActiveLocation(unit);

      var equipSection = document.getElementById("equipamentos");
      if (equipSection) equipSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ============================================
     Formulário de contato -> WhatsApp
     ============================================ */
  var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("contactName").value.trim();
      var phone = document.getElementById("contactPhone").value.trim();
      var unit = document.getElementById("contactUnit").value;
      var message = document.getElementById("contactMessage").value.trim();

      var text = "Olá! Meu nome é " + name + " (tel: " + phone + ").";
      text += " Unidade preferida: " + unit + ".";
      if (message) text += " " + message;

      window.open("https://wa.me/5581999999999?text=" + encodeURIComponent(text), "_blank", "noopener");
    });
  }

  var siteHeader = document.getElementById("siteHeader");
  if (siteHeader) {
    window.addEventListener("scroll", function () {
      siteHeader.classList.toggle("is-scrolled", window.scrollY > 40);
    });
  }

})();