/**
 * File purpose: Frontend form UX helpers for validation hints and messages.
 */
/* KGL Form UX Helper
   Adds per-field hints and inline validation messages for better form guidance. */
(function (global) {
  function isControl(el) {
    return ["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName) && el.type !== "hidden";
  }

  function getControls(form) {
    return Array.from(form.elements).filter(isControl);
  }

  function inferHint(el) {
    if (el.dataset.hint) return el.dataset.hint;
    if (el.placeholder) return `Example: ${el.placeholder}`;
    if (el.type === "datetime-local") return "Select both date and time.";
    if (el.type === "number" && el.min) return `Minimum allowed is ${el.min}.`;
    if (el.minLength && el.minLength > 0) return `Enter at least ${el.minLength} characters.`;
    if (el.required) return "This field is required.";
    return "";
  }

  function ensureHint(el) {
    const hintText = inferHint(el);
    if (!hintText) return;
    const siblings = Array.from(el.parentElement.children);
    const existing = siblings.find((node) => node.classList && node.classList.contains("field-hint"));
    if (existing) {
      existing.textContent = hintText;
      return;
    }
    const hint = document.createElement("small");
    hint.className = "field-hint";
    hint.textContent = hintText;
    const next = el.nextElementSibling;
    if (next && next.classList && next.classList.contains("password-toggle")) {
      next.insertAdjacentElement("afterend", hint);
      return;
    }
    el.insertAdjacentElement("afterend", hint);
  }

  function ensureErrorSlot(el) {
    const siblings = Array.from(el.parentElement.children);
    const existing = siblings.find((node) => node.classList && node.classList.contains("field-error"));
    if (existing) return existing;
    const error = document.createElement("small");
    error.className = "field-error";
    error.setAttribute("aria-live", "polite");
    el.parentElement.appendChild(error);
    return error;
  }

  function getMessage(el) {
    const v = el.validity;
    if (v.valueMissing) return `${el.labels?.[0]?.textContent || "This field"} is required.`;
    if (v.typeMismatch) return "Enter a valid value.";
    if (v.patternMismatch) return el.dataset.patternMessage || "Please follow the required format.";
    if (v.tooShort) return `Use at least ${el.minLength} characters.`;
    if (v.rangeUnderflow) return `Minimum value is ${el.min}.`;
    if (v.rangeOverflow) return `Maximum value is ${el.max}.`;
    if (v.badInput) return "Enter a valid number.";
    return "";
  }

  function setFieldError(el, message) {
    const slot = ensureErrorSlot(el);
    slot.textContent = message || "";
  }

  function bindControl(el) {
    ensureHint(el);
    ensureErrorSlot(el);
    el.addEventListener("blur", () => {
      setFieldError(el, el.validity.valid ? "" : getMessage(el));
    });
    el.addEventListener("input", () => {
      if (el.validity.valid) setFieldError(el, "");
    });
    el.addEventListener("change", () => {
      if (el.validity.valid) setFieldError(el, "");
    });
  }

  function enhanceForm(form) {
    if (!form) return;
    const controls = getControls(form);
    controls.forEach(bindControl);

    /* Intercepts submit to display all failing fields inline at once. */
    form.addEventListener("submit", (event) => {
      let firstInvalid = null;
      controls.forEach((el) => {
        const msg = el.validity.valid ? "" : getMessage(el);
        setFieldError(el, msg);
        if (msg && !firstInvalid) firstInvalid = el;
      });
      if (firstInvalid) {
        event.preventDefault();
        firstInvalid.focus();
      }
    });
  }

  function enhanceForms(formIds) {
    formIds.forEach((id) => enhanceForm(document.getElementById(id)));
  }

  global.FORM_UX = { enhanceForm, enhanceForms };
})(window);

