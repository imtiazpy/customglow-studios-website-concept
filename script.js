/* ==========================================================
   CustomGlow Studios: interactions
   ========================================================== */

/* ---- 1. CONFIG: edit these before launch ---- */
const CONFIG = {
  // Option A (recommended): a form service URL, e.g. Formspree "https://formspree.io/f/xxxxxxx"
  FORM_ENDPOINT: "",
  // Option B (fallback): opens the visitor's email app. Use Christopher's verified inbox.
  EMAIL: "REPLACE-WITH-VERIFIED-EMAIL@example.com",
  // Christopher's Facebook page or Messenger link. Leave empty to hide the button.
  FACEBOOK_URL: ""
};

/* ---- 2. Content for the detail dialog ---- */
const ITEMS = {
  light: {
    kicker: "Light-up keepsake",
    title: "The Glow Letter",
    text: "A personalized clear resin letter with preserved flowers, metallic accents and optional built-in lighting. A shelf, desk or bedside becomes the focal point.",
    image: "customglow-lit-letter.jpg",
    points: ["Any letter or initial", "Choose your flowers and palette", "Optional lights", "Great as a gift"],
    piece: "Light-up letter",
    prefill: "I'm interested in a personalized illuminated resin letter."
  },
  board: {
    kicker: "Color in motion",
    title: "The Swirl Board",
    text: "A marbled resin board with flowing pigment and feathered color. The pattern is created in the pour, so no two are the same.",
    image: "customglow-resin-board.jpg",
    points: ["Custom colors and finish", "Sizes on request", "Display or serving ideas", "Truly one of one"],
    piece: "Marbled board or tray",
    prefill: "I'm interested in a marbled resin board like the Swirl Board."
  },
  heart: {
    kicker: "Your people, preserved",
    title: "The Memory Heart",
    text: "A heart-shaped resin keepsake built around your photos, a name in resin letters and pressed flowers, finished with soft lights. Made for anniversaries, family gifts and memorials.",
    image: "customglow-photo-heart.jpg",
    points: ["Your photos and a name or word", "Pressed flowers and greenery", "Choose your color", "Send photos with your request"],
    piece: "Photo keepsake (like the Memory Heart)",
    prefill: "I'd like a photo keepsake like the Memory Heart. I can send photos and a name."
  },
  dish: {
    kicker: "Small and sparkly",
    title: "The Glitter Dish",
    text: "A faceted resin dish packed with holographic glitter and deep color, ready for rings, keys, candles or a desk. Small matching accents can be made too.",
    image: "customglow-glitter-dish.jpg",
    points: ["Choose your glitter and colors", "Faceted, gem-like finish", "Matching accent pieces", "Easy gift size"],
    piece: "Dish or small trinket piece",
    prefill: "I'm interested in a glitter resin dish like the Glitter Dish."
  },
  custom: {
    kicker: "Fully custom",
    title: "Your idea, poured.",
    text: "Bring a color palette, a name, a memory or a gift idea. Share it and the studio will discuss what is possible.",
    image: "customglow-resin-board.jpg",
    points: ["Designed with the artist", "Estimate before any work", "Personal from start to finish"],
    piece: "I'm open to ideas",
    prefill: "I have an idea for a custom resin piece I'd like to discuss."
  }
};

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

document.documentElement.classList.remove("no-js");

/* Light analytics hook: swap for GA4 / Plausible later */
function track(name, data = {}) {
  if (window.gtag) window.gtag("event", name, data);
  if (window.plausible) window.plausible(name, { props: data });
}
$$("[data-track]").forEach(el => el.addEventListener("click", () => track("cta_click", { id: el.dataset.track })));

/* ---- Toast ---- */
const toast = $("#toast");
let toastTimer;
function notify(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3800);
}

/* ---- Image fallback: if a file is missing, the gradient behind it shows ---- */
$$("img").forEach(img => img.addEventListener("error", () => { img.hidden = true; }));

/* ---- Mobile nav ---- */
const menuBtn = $(".menu-toggle"), nav = $("#nav");
menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});
$$("#nav a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
}));

/* ---- Lights on / off ---- */
const stage = $("#stage"), lightsBtn = $("#lightsToggle");
lightsBtn.addEventListener("click", () => {
  const on = lightsBtn.getAttribute("aria-pressed") !== "true";
  lightsBtn.setAttribute("aria-pressed", String(on));
  stage.dataset.lit = String(on);
  $(".lights-label").textContent = on ? "Lights on" : "Lights off";
  track("lights_toggle", { on });
});

/* ---- Form helpers ---- */
const form = $("#requestForm");
function goToQuote() {
  $("#quote").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => form.querySelector(".panel.active input, .panel.active textarea, .panel.active select")?.focus({ preventScroll: true }), 700);
}
function prefill({ piece, text, interest }) {
  if (piece) {
    const sel = form.elements.piece;
    const match = [...sel.options].find(o => o.textContent === piece);
    if (match) sel.value = match.value || match.textContent;
  }
  if (interest) {
    const r = form.querySelector(`input[name="interest"][value="${interest}"]`);
    if (r) r.checked = true;
  }
  if (text) form.elements.details.value = text;
}

/* ---- Detail dialog ---- */
const dialog = $("#detailDialog");
let currentItem = null;
function openItem(key) {
  const item = ITEMS[key];
  if (!item) return;
  currentItem = key;
  const img = $("#detailImg");
  img.hidden = false;
  img.src = item.image;
  img.alt = item.title + ", CustomGlow work example";
  $("#detailKicker").textContent = item.kicker;
  $("#detailTitle").textContent = item.title;
  $("#detailText").textContent = item.text;
  $("#detailList").innerHTML = item.points.map(p => `<li>${p}</li>`).join("");
  dialog.showModal();
  track("view_piece", { piece: key });
}
function askAbout(key) {
  const item = ITEMS[key];
  if (!item) return;
  setStep(1);
  prefill({ piece: item.piece, text: item.prefill, interest: key === "custom" ? "Custom order" : "Available piece" });
  track("ask_piece", { piece: key });
  goToQuote();
}
$$("[data-open]").forEach(b => b.addEventListener("click", () => openItem(b.dataset.open)));
$$("[data-ask]").forEach(b => b.addEventListener("click", () => askAbout(b.dataset.ask)));
$(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });
$("#detailAsk").addEventListener("click", () => { const k = currentItem; dialog.close(); askAbout(k); });

/* ---- Occasion chips ---- */
$$("[data-occasion]").forEach(chip => chip.addEventListener("click", () => {
  setStep(1);
  prefill({ interest: "Gift", text: `I'm looking for a custom piece for ${chip.dataset.occasion}.` });
  track("occasion", { occasion: chip.dataset.occasion });
  goToQuote();
}));

/* ---- Multi-step form ---- */
const panels = $$(".panel", form), bar = $("#bar");
const stepNames = ["The idea", "The vibe", "Contact"];
let step = 1;
function setStep(n) {
  step = n;
  panels.forEach(p => p.classList.toggle("active", Number(p.dataset.step) === n));
  bar.style.width = (n / panels.length * 100) + "%";
  $("#stepNow").textContent = `Step ${n} of ${panels.length}`;
  $("#stepName").textContent = stepNames[n - 1];
}
$$("[data-next]", form).forEach(b => b.addEventListener("click", () => { if (step < panels.length) { setStep(step + 1); track("form_step", { step: step }); } }));
$$("[data-back]", form).forEach(b => b.addEventListener("click", () => step > 1 && setStep(step - 1)));

function validate() {
  let ok = true;
  const name = form.elements.name, email = form.elements.email;
  const set = (el, msg) => {
    const field = el.closest(".field");
    field.classList.toggle("invalid", !!msg);
    field.querySelector(".err").textContent = msg || "";
    if (msg) ok = false;
  };
  set(name, name.value.trim().length < 2 ? "Please add your name." : "");
  set(email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()) ? "" : "Please enter a valid email.");
  return ok;
}

const success = $("#success");
form.addEventListener("submit", async e => {
  e.preventDefault();
  if (!validate()) return;
  const d = Object.fromEntries(new FormData(form));
  const btn = $("#submitBtn");
  btn.disabled = true;
  btn.textContent = "Sending...";

  const summary = `I'm interested in: ${d.interest}
Piece: ${d.piece}
Budget: ${d.budget}
Needed by: ${d.deadline || "Flexible"}
Name: ${d.name}
Email: ${d.email}
Phone: ${d.phone || "Not provided"}

Details:
${d.details || "I'd like to discuss the possibilities."}`;

  try {
    if (CONFIG.FORM_ENDPOINT) {
      const res = await fetch(CONFIG.FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ ...d, _subject: "New CustomGlow enquiry from " + d.name })
      });
      if (!res.ok) throw new Error("Request failed");
      showSuccess("Thanks " + d.name.split(" ")[0] + ". Christopher will reply to " + d.email + " soon.");
    } else {
      const subject = encodeURIComponent("CustomGlow enquiry: " + d.interest);
      const body = encodeURIComponent("Hi CustomGlow Studios,\n\n" + summary + "\n\nThank you!");
      window.location.href = `mailto:${CONFIG.EMAIL}?subject=${subject}&body=${body}`;
      showSuccess("Your email app should open with everything filled in. Just press send.");
    }
    track("lead_submit", { interest: d.interest, budget: d.budget });
  } catch (err) {
    notify("Something went wrong. Please try again or message us on Facebook.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Send my request <span aria-hidden="true">&rarr;</span>';
  }
});
function showSuccess(msg) {
  panels.forEach(p => p.classList.remove("active"));
  $(".progress", form).hidden = true;
  $(".step-label", form).hidden = true;
  $("#successText").textContent = msg;
  success.hidden = false;
}
$("#resetForm").addEventListener("click", () => {
  form.reset();
  success.hidden = true;
  $(".progress", form).hidden = false;
  $(".step-label", form).hidden = false;
  setStep(1);
});

/* ---- Facebook button ---- */
const fb = $("#fbLink");
if (CONFIG.FACEBOOK_URL) fb.href = CONFIG.FACEBOOK_URL; else fb.closest(".alt-contact").hidden = true;

/* ---- Sticky mobile CTA: hide near the form and the hero ---- */
const sticky = $("#stickyCta");
const heroEl = $(".hero"), quoteEl = $("#quote");
let heroOut = false, quoteIn = false;
const updateSticky = () => sticky.classList.toggle("show", heroOut && !quoteIn);
if ("IntersectionObserver" in window) {
  new IntersectionObserver(([e]) => { heroOut = !e.isIntersecting; updateSticky(); }).observe(heroEl);
  new IntersectionObserver(([e]) => { quoteIn = e.isIntersecting; updateSticky(); }, { threshold: .15 }).observe(quoteEl);
}

/* ---- Reveal on scroll ---- */
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
  }), { threshold: .12 });
  $$(".reveal").forEach(el => io.observe(el));
} else {
  $$(".reveal").forEach(el => el.classList.add("visible"));
}

$("#year").textContent = new Date().getFullYear();
