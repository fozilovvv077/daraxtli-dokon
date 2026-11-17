/* Daraxtli Do'kon: sahifalar, katalog, savat va animatsiyalar */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  if (reduce) root.classList.add("noanim");
  // Ochilish pardasi ochilayotganda sahifa matnlari chiqa boshlaydi
  setTimeout(function () { root.classList.add("ready"); }, reduce ? 0 : 2300);

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ---------- Ma'lumotlar (narxlar namuna, o'zingiznikiga almashtiring) ---------- */
  var PRODUCTS = [
    { id: "p1", cat: "ayol", name: "Zig'ir ko'ylak", price: 289000, shape: "dress", isNew: true, colors: ["#CFE8D6", "#F9D96B", "#5A3E2B"] },
    { id: "p2", cat: "ayol", name: "Uzun jun palto", price: 1190000, shape: "coat", isNew: true, colors: ["#2F7D45", "#5A3E2B", "#D9CCF7"] },
    { id: "p3", cat: "ayol", name: "Keng shim", price: 359000, shape: "trousers", isNew: false, colors: ["#EADFC7", "#2F7D45", "#2B1D14"] },
    { id: "p4", cat: "erkak", name: "Paxtali xudi", price: 429000, shape: "hoodie", isNew: true, colors: ["#5A3E2B", "#F9D96B", "#CFE8D6"] },
    { id: "p5", cat: "erkak", name: "Oversayz futbolka", price: 169000, shape: "tee", isNew: false, colors: ["#F9D96B", "#BFDDF2", "#2F7D45"] },
    { id: "p6", cat: "erkak", name: "Yengil kurtka", price: 749000, shape: "coat", isNew: false, colors: ["#17402A", "#EADFC7", "#5A3E2B"] },
    { id: "p7", cat: "erkak", name: "Trikotaj shim", price: 339000, shape: "trousers", isNew: false, colors: ["#2B1D14", "#CFE8D6", "#F7CDB0"] },
    { id: "p8", cat: "bolalar", name: "Bolalar xudisi", price: 259000, shape: "hoodie", isNew: true, colors: ["#F7CDB0", "#CFE8D6", "#F9D96B"] },
    { id: "p9", cat: "bolalar", name: "Bolalar futbolkasi", price: 119000, shape: "tee", isNew: false, colors: ["#BFDDF2", "#F9D96B", "#CFE8D6"] },
    { id: "p10", cat: "aks", name: "Kundalik sumka", price: 219000, shape: "bag", isNew: false, colors: ["#D9CCF7", "#5A3E2B", "#F9D96B"] },
    { id: "p11", cat: "aks", name: "Jun shapka", price: 99000, shape: "beanie", isNew: true, colors: ["#2F7D45", "#F9D96B", "#EADFC7"] },
    { id: "p12", cat: "ayol", name: "Gulli sarafan", price: 249000, shape: "dress", isNew: false, colors: ["#F7CDB0", "#D9CCF7", "#CFE8D6"] }
  ];

  var TITLES = { bosh: "Bosh sahifa", katalog: "Katalog", kolleksiya: "Kolleksiyalar", biz: "Biz haqimizda", aksiya: "Aksiya", aloqa: "Aloqa" };
  var VIEWS = Object.keys(TITLES);

  /* ---------- Yordamchi funksiyalar ---------- */
  function money(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
  }
  function norm(s) { return String(s).toLowerCase().replace(/['’ʻ`]/g, ""); }
  function inkFor(hex) {
    var h = hex.replace("#", "");
    var r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? "#2B1D14" : "#FBF7E8";
  }
  function byId(id) { for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i]; return null; }
  function garment(shape) { return '<svg class="g" viewBox="0 0 100 100" aria-hidden="true"><use href="#g-' + shape + '"></use></svg>'; }

  function cardHTML(p, i) {
    var c = p.colors[0];
    var sw = p.colors.map(function (col, k) {
      return '<button class="sw' + (k === 0 ? " on" : "") + '" type="button" data-sw="' + col + '" aria-label="' + p.name + ", " + (k + 1) + '-rang" style="background:' + col + '"></button>';
    }).join("");
    return '<article class="card" data-id="' + p.id + '" style="--i:' + i + '">' +
      '<div class="tile" style="background:' + c + ";color:" + inkFor(c) + '">' + (p.isNew ? '<span class="tag">Yangi</span>' : "") + garment(p.shape) + "</div>" +
      '<div class="card-row"><h3>' + p.name + '</h3><span class="price">' + money(p.price) + "</span></div>" +
      '<div class="card-foot"><div class="swatches">' + sw + '</div><button class="btn btn-ghost btn-sm" type="button" data-add="' + p.id + '">Savatga</button></div>' +
      "</article>";
  }

  /* ---------- Bosh sahifadagi tanlanganlar ---------- */
  var featured = $("#featured-grid");
  if (featured) {
    featured.innerHTML = PRODUCTS.filter(function (p) { return p.isNew; }).slice(0, 4).map(cardHTML).join("");
  }

  /* ---------- Katalog: toifa, qidiruv, saralash ---------- */
  var state = { cat: "all", q: "", sort: "def" };
  var grid = $("#catalog-grid");
  var countEl = $("#catalog-count");
  var emptyEl = $("#catalog-empty");

  function renderCatalog() {
    if (!grid) return;
    var list = PRODUCTS.filter(function (p) {
      return (state.cat === "all" || p.cat === state.cat) && (!state.q || norm(p.name).indexOf(state.q) > -1);
    });
    if (state.sort === "asc") list.sort(function (a, b) { return a.price - b.price; });
    if (state.sort === "desc") list.sort(function (a, b) { return b.price - a.price; });
    grid.innerHTML = list.map(cardHTML).join("");
    countEl.textContent = list.length + " ta mahsulot";
    emptyEl.hidden = list.length > 0;
  }
  renderCatalog();

  var search = $("#search");
  if (search) search.addEventListener("input", function () { state.q = norm(search.value.trim()); renderCatalog(); });
  var sort = $("#sort");
  if (sort) sort.addEventListener("change", function () { state.sort = sort.value; renderCatalog(); });

  /* ---------- Savat ---------- */
  var cart = {};
  var cartEl = $("#cart"), overlay = $("#overlay"), cartList = $("#cart-list");
  var countBadge = $("#cart-count"), totalEl = $("#cart-total"), cartBtn = $("#cart-btn"), toastEl = $("#toast");
  var lastFocus = null, toastTimer = null;

  function cartTotals() {
    var n = 0, sum = 0;
    Object.keys(cart).forEach(function (id) { var p = byId(id); if (p) { n += cart[id]; sum += cart[id] * p.price; } });
    return { n: n, sum: sum };
  }
  function renderCart() {
    var ids = Object.keys(cart);
    if (!ids.length) {
      cartList.innerHTML = '<div class="cart-empty"><svg viewBox="0 0 100 100" width="64" height="64" style="color:#2F7D45"><use href="#leaf"></use></svg><p>Savat hozircha bo\'sh.</p></div>';
    } else {
      cartList.innerHTML = ids.map(function (id) {
        var p = byId(id), c = p.colors[0];
        return '<div class="cart-item"><div class="cart-thumb" style="background:' + c + ";color:" + inkFor(c) + '">' + garment(p.shape) + "</div>" +
          '<div><div class="cart-name">' + p.name + '</div><div class="cart-price">' + money(p.price) + "</div></div>" +
          '<div class="qty"><button type="button" data-qty="' + id + ':-1" aria-label="Kamaytirish">-</button><span>' + cart[id] + '</span><button type="button" data-qty="' + id + ':1" aria-label="Ko\'paytirish">+</button></div></div>';
      }).join("");
    }
    var t = cartTotals();
    countBadge.textContent = t.n;
    totalEl.textContent = money(t.sum);
  }
  function bumpBadge() {
    countBadge.classList.remove("bump");
    void countBadge.offsetWidth;
    countBadge.classList.add("bump");
  }
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }
  function fly(from) {
    if (reduce || !from.animate) return;
    var a = from.getBoundingClientRect(), b = cartBtn.getBoundingClientRect();
    var d = document.createElement("span");
    d.className = "fly";
    d.style.left = a.left + a.width / 2 - 9 + "px";
    d.style.top = a.top + a.height / 2 - 9 + "px";
    document.body.appendChild(d);
    var dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    var an = d.animate([
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: "translate(" + dx * 0.5 + "px," + (dy * 0.5 - 70) + "px) scale(1.25)", opacity: 1, offset: 0.5 },
      { transform: "translate(" + dx + "px," + dy + "px) scale(.3)", opacity: 0.5 }
    ], { duration: 760, easing: "cubic-bezier(.5,0,.3,1)" });
    an.onfinish = function () { d.remove(); bumpBadge(); };
  }
  function addToCart(id, btn) {
    var p = byId(id);
    if (!p) return;
    cart[id] = (cart[id] || 0) + 1;
    renderCart();
    toast(p.name + " savatga qo'shildi");
    if (btn) fly(btn); else bumpBadge();
  }
  function changeQty(id, delta) {
    cart[id] = (cart[id] || 0) + delta;
    if (cart[id] <= 0) delete cart[id];
    renderCart();
  }
  function openCart() {
    lastFocus = document.activeElement;
    cartEl.classList.add("open");
    overlay.classList.add("open");
    cartEl.setAttribute("aria-hidden", "false");
    var close = $("#cart-close");
    if (close) setTimeout(function () { close.focus(); }, 50);
  }
  function closeCart() {
    cartEl.classList.remove("open");
    overlay.classList.remove("open");
    cartEl.setAttribute("aria-hidden", "true");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  renderCart();

  /* ---------- Sahifalar (hash orqali) va o'tish animatsiyasi ---------- */
  var current = null, busy = false, pending = null;
  var wipe = $(".wipe");
  var io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  }
  function setupReveals(view) {
    $$(".stagger", view).forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) { c.classList.add("reveal"); c.style.setProperty("--i", i); });
    });
    $$(".reveal", view).forEach(function (el) {
      el.classList.remove("in");
      if (io) io.observe(el); else el.classList.add("in");
    });
  }
  function hashName() {
    var h = (location.hash || "").replace("#", "");
    return VIEWS.indexOf(h) > -1 ? h : "bosh";
  }
  function activate(name) {
    VIEWS.forEach(function (v) {
      var el = document.getElementById("view-" + v);
      if (el) el.classList.toggle("active", v === name);
    });
    $$("[data-nav]").forEach(function (a) {
      var on = a.getAttribute("data-nav") === name;
      a.classList.toggle("current", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    document.title = name === "bosh" ? "Daraxtli Do'kon" : TITLES[name] + " | Daraxtli Do'kon";
    window.scrollTo(0, 0);
    current = name;
    setupReveals(document.getElementById("view-" + name));
  }
  function go(name) {
    if (name === current) return;
    if (reduce || !wipe || !wipe.animate || current === null) { activate(name); return; }
    if (busy) { pending = name; return; }
    busy = true;
    var ease = "cubic-bezier(.7,0,.2,1)";
    var a = wipe.animate([{ transform: "translateY(101%)" }, { transform: "translateY(0)" }], { duration: 520, easing: ease, fill: "forwards" });
    a.onfinish = function () {
      activate(name);
      var b = wipe.animate([{ transform: "translateY(0)" }, { transform: "translateY(-101%)" }], { duration: 640, easing: ease, fill: "forwards" });
      b.onfinish = function () {
        a.cancel(); b.cancel();
        busy = false;
        if (pending && pending !== current) { var n = pending; pending = null; go(n); } else { pending = null; }
      };
    };
  }
  window.addEventListener("hashchange", function () { closeMenu(); go(hashName()); });
  activate(hashName());

  /* ---------- Menyu (telefon) va sarlavha ---------- */
  var header = $("#site-header"), burger = $("#burger");
  function closeMenu() {
    header.classList.remove("nav-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Menyuni ochish");
  }
  burger.addEventListener("click", function () {
    var open = header.classList.toggle("nav-open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Menyuni yopish" : "Menyuni ochish");
  });
  window.addEventListener("scroll", function () { header.classList.toggle("scrolled", window.scrollY > 24); }, { passive: true });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeCart(); closeMenu(); }
  });

  /* ---------- Bosilishlar (hammasi bir joyda) ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.nodeType === 1 ? e.target : e.target.parentElement;
    if (!t || !t.closest) return;

    var add = t.closest("[data-add]");
    if (add) { addToCart(add.getAttribute("data-add"), add); return; }

    var sw = t.closest(".sw");
    if (sw) {
      var card = sw.closest(".card"), tile = card && card.querySelector(".tile");
      var col = sw.getAttribute("data-sw");
      if (tile) { tile.style.background = col; tile.style.color = inkFor(col); }
      $$(".sw", card).forEach(function (s) { s.classList.toggle("on", s === sw); });
      return;
    }

    var cat = t.closest("[data-cat]");
    if (cat) {
      state.cat = cat.getAttribute("data-cat");
      $$("[data-cat]").forEach(function (c) { c.classList.toggle("active", c === cat); });
      renderCatalog();
      return;
    }

    var q = t.closest("[data-qty]");
    if (q) { var parts = q.getAttribute("data-qty").split(":"); changeQty(parts[0], parseInt(parts[1], 10)); return; }

    if (t.closest("#cart-btn")) { openCart(); return; }
    if (t.closest("[data-close-cart]")) { closeCart(); return; }
  });

  /* ---------- Kolleksiya panellari ---------- */
  var panels = $$(".panel");
  function setPanel(p) {
    panels.forEach(function (x) { x.classList.toggle("active", x === p); });
  }
  panels.forEach(function (p) {
    p.addEventListener("click", function () { setPanel(p); });
    p.addEventListener("focus", function () { setPanel(p); });
    p.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && e.target === p) { e.preventDefault(); setPanel(p); }
    });
    p.addEventListener("mouseenter", function () {
      if (window.matchMedia && window.matchMedia("(hover: hover)").matches) setPanel(p);
    });
  });

  /* ---------- Bosh blok: sichqoncha bilan parallaks ---------- */
  var hero = $(".hero");
  var art = $(".hero-art");
  if (hero && art && !reduce) {
    hero.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      var r = hero.getBoundingClientRect();
      art.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      art.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
    hero.addEventListener("pointerleave", function () {
      art.style.setProperty("--mx", 0); art.style.setProperty("--my", 0);
    });
  }

  /* ---------- Kartochka egilishi (3D) ---------- */
  var tiltEl = null;
  function resetTilt() {
    if (tiltEl) { tiltEl.style.setProperty("--rx", "0deg"); tiltEl.style.setProperty("--ry", "0deg"); tiltEl = null; }
  }
  document.addEventListener("pointermove", function (e) {
    if (reduce || e.pointerType === "touch") return;
    var t = e.target.closest ? e.target.closest(".tile") : null;
    if (tiltEl && tiltEl !== t) resetTilt();
    if (!t) return;
    tiltEl = t;
    var r = t.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    t.style.setProperty("--ry", (x * 10).toFixed(2) + "deg");
    t.style.setProperty("--rx", (-y * 10).toFixed(2) + "deg");
  });

  /* ---------- Aloqa formasi ---------- */
  var form = $("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#f-name"), phone = $("#f-phone");
      var ok = true;
      function mark(input, errId, msg) {
        var field = input.closest(".field");
        $("#" + errId).textContent = msg;
        field.classList.toggle("bad", !!msg);
        if (msg) ok = false;
      }
      mark(name, "e-name", name.value.trim().length < 2 ? "Ismingizni yozing." : "");
      mark(phone, "e-phone", phone.value.replace(/\D/g, "").length < 7 ? "Telefon raqamini to'liq yozing." : "");
      if (ok) toast("Forma to'g'ri to'ldirildi (namuna: hali yuborilmaydi)");
    });
  }
})();
