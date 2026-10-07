/* Acme Garage Doors — site interactions + LeadrVision form handling */
(function () {
  "use strict";

  var ENDPOINT = "https://vision.leadrai.com/api/forms/dcf724550aef31763cba367f68ee8736";

  function setPageFields() {
    var page = window.location.href;
    document.querySelectorAll('input[name="_page"]').forEach(function (input) {
      input.value = page;
    });
  }

  function markSubmitted(form) {
    var success = form.querySelector(".form-success");
    var error = form.querySelector(".form-error");
    if (error) error.hidden = true;
    if (success) {
      success.hidden = false;
      success.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function showError(form) {
    var error = form.querySelector(".form-error");
    if (error) error.hidden = false;
  }

  function handleSubmit(event) {
    var form = event.currentTarget;

    // Honeypot: silently stop bots without sending.
    var gotcha = form.querySelector('input[name="_gotcha"]');
    if (gotcha && gotcha.value) {
      event.preventDefault();
      return;
    }

    if (!window.fetch || !window.FormData) return; // let the plain HTML POST happen

    event.preventDefault();

    var submitBtn = form.querySelector('button[type="submit"]');
    var originalLabel = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = "Sending\u2026";
    }

    var data = new FormData(form);
    data.set("_page", window.location.href);

    fetch(form.action || ENDPOINT, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" }
    })
      .then(function (response) {
        return response
          .json()
          .catch(function () {
            return { ok: response.ok };
          })
          .then(function (body) {
            if (!response.ok || body.ok === false) {
              throw new Error("Submission failed");
            }
            return body;
          });
      })
      .then(function () {
        form.reset();
        setPageFields();
        markSubmitted(form);
      })
      .catch(function () {
        showError(form);
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalLabel;
        }
      });
  }

  function initMobileNav() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.getElementById("mobileNav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      nav.setAttribute("aria-hidden", open ? "false" : "true");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        nav.setAttribute("aria-hidden", "true");
      });
    });
  }

  function initForms() {
    var forms = document.querySelectorAll("form");
    forms.forEach(function (form) {
      // Keep pointing every form at LeadrVision.
      if (!form.getAttribute("action")) form.setAttribute("action", ENDPOINT);
      form.addEventListener("submit", handleSubmit);
    });
  }

  function initSubmittedParam() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("submitted") === "1") {
      var target = document.getElementById("quoteForm") || document.querySelector("form");
      if (target) markSubmitted(target);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    setPageFields();
    initMobileNav();
    initForms();
    initSubmittedParam();

    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  });
})();