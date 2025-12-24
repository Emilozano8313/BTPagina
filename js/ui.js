/* --- Data Configuration --- */
const MENU_ITEMS = [
  { name: "Tapioca Chocolate", price: 88.00, img: "img/Chocolate.jpg", desc: "Batido cremoso con intenso chocolate y perlas suaves." },
  { name: "Tapioca Mazapán", price: 88.00, img: "img/Mazapan.jpg", desc: "Toque a mazapán para un sabor reconfortante." },
  { name: "Tapioca Mora Azul", price: 88.00, img: "img/MoraAzul.jpg", desc: "Refrescante y frutal, notas ácidas y dulces." },
  { name: "Tapioca Taro", price: 88.00, img: "img/Taro.jpg", desc: "Sabor suave y aterciopelado, favorito de la casa." },
  { name: "Tapioca Matcha", price: 88.00, img: "img/Matcha.jpg", desc: "Matcha balanceado con leche cremosa y perlas." },
  { name: "Tapioca Especial", price: 88.00, img: "img/Chocolate.jpg", desc: "Selección premium con toppings exclusivos." }
];

const FAQ_ITEMS = [
  { q: "¿Cuáles son los horarios de atención?", a: "Abrimos de Martes a Domingo de 02:00 pm a 09:00 pm." },
  { q: "¿Tienen servicio a domicilio?", a: "Sí, puedes pedir a través de WhatsApp y coordinamos la entrega, o puedes encontrarnos en las apps de delivery (Didi food y Rappi)." },
  { q: "¿Aceptan pagos con tarjeta?", a: "Sí, actualmente aceptamos tarjeta de débito y crédito, efectivo y transferencias bancarias." },
  { q: "¿Los productos contienen lácteos?", a: "No, todos nuestros productos son lácteos libres. " }
];

(function () {
  const cartCountEl = document.getElementById('cartCount');
  const cartPanel = document.getElementById('cartPanel');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const toast = document.getElementById('toast');

  function formatCurrency(v) { return '$' + Number(v).toFixed(2) + ' MXN'; }

  /* --- Menu Rendering --- */
  window.renderMenu = function () {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;
    grid.innerHTML = '';
    MENU_ITEMS.forEach(item => {
      const article = document.createElement('article');
      article.className = 'card-item';
      article.dataset.name = item.name;
      article.dataset.price = item.price.toFixed(2);
      article.innerHTML = `
        <img src="${item.img}" alt="${item.name}">
        <h4>${item.name}</h4>
        <p class="small">${item.desc}</p>
        <div class="card-footer">
          <span class="price">${formatCurrency(item.price)}</span>
          <button class="btn btn-gold-outline" onclick="handleAddToCart(this)"><i class="fas fa-shopping-cart"></i> Agregar al carrito</button>
        </div>
      `;
      grid.appendChild(article);
    });
  };

  /* --- FAQ Rendering --- */
  window.renderFAQ = function () {
    const container = document.getElementById('faqAccordion');
    if (!container) return;
    container.innerHTML = '';
    FAQ_ITEMS.forEach(item => {
      const div = document.createElement('div');
      div.className = 'faq-item';
      div.innerHTML = `
        <div class="faq-header">
          <span>${item.q}</span>
          <i class="fas fa-chevron-down faq-icon"></i>
        </div>
        <div class="faq-content">
          <p>${item.a}</p>
        </div>
      `;
      div.querySelector('.faq-header').addEventListener('click', () => {
        div.classList.toggle('active');
      });
      container.appendChild(div);
    });
  };

  window.renderCart = function () {
    const cart = Cart.get();
    const count = cart.reduce((s, i) => s + i.qty, 0);
    cartCountEl.innerText = count;
    cartItemsEl.innerHTML = '';
    cart.forEach((it, idx) => {
      const div = document.createElement('div'); div.className = 'cart-item';
      div.innerHTML = `
        <div style="flex:1;display:flex;flex-direction:column;gap:6px">
          <div style="color:var(--white);font-weight:600">${it.name}</div>
          <div style="color:var(--muted);font-size:13px">${formatCurrency(it.price)} x ${it.qty}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:center">
          <div class="qty-controls">
            <button class="btn-plain" data-idx="${idx}" data-delta="-1">-</button>
            <div style="min-width:22px;text-align:center">${it.qty}</div>
            <button class="btn-plain" data-idx="${idx}" data-delta="1">+</button>
          </div>
          <button class="btn-plain remove" data-idx="${idx}" style="font-size:12px">Quitar</button>
        </div>
      `;
      cartItemsEl.appendChild(div);
    })
    cartTotalEl.innerText = formatCurrency(Cart.total());

    cartItemsEl.querySelectorAll('[data-idx][data-delta]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.idx); const delta = Number(btn.dataset.delta);
        Cart.changeQty(idx, delta); renderCart();
      })
    })
    cartItemsEl.querySelectorAll('.remove').forEach(btn => { btn.addEventListener('click', () => { const idx = Number(btn.dataset.idx); Cart.removeItem(idx); renderCart(); }) })

    const wa = document.getElementById('checkoutWhatsapp');
    if (Cart.get().length === 0) {
      wa.classList.add('disabled'); wa.removeAttribute('href'); wa.setAttribute('aria-disabled', 'true'); cartPanel.classList.remove('open'); setTimeout(() => { if (cartPanel.style.display !== 'none') cartPanel.style.display = 'none'; }, 260);
    } else { wa.classList.remove('disabled'); wa.setAttribute('target', '_blank'); wa.setAttribute('rel', 'noopener'); wa.removeAttribute('aria-disabled'); const text = encodeURIComponent('Hola! Me gustaría pedir:\n' + Cart.get().map(i => `${i.qty} x ${i.name}`).join('\n') + '\nTotal: ' + formatCurrency(Cart.total())); wa.href = `https://wa.me/7774467451?text=${text}`; if (cartPanel.style.display === 'none' || !cartPanel.classList.contains('open')) { cartPanel.style.display = 'flex'; requestAnimationFrame(() => cartPanel.classList.add('open')); } }
  }

  window.showToast = function (msg, timeout = 1400) { toast.innerText = msg; toast.style.display = 'block'; toast.classList.add('show'); setTimeout(() => { toast.classList.remove('show'); setTimeout(() => { toast.style.display = 'none' }, 260) }, timeout); }

  document.getElementById('cartToggle').addEventListener('click', () => { const isOpen = cartPanel.classList.contains('open'); if (isOpen) { cartPanel.classList.remove('open'); setTimeout(() => { cartPanel.style.display = 'none'; }, 260); document.getElementById('cartToggle').setAttribute('aria-expanded', 'false'); } else { cartPanel.style.display = 'flex'; requestAnimationFrame(() => cartPanel.classList.add('open')); document.getElementById('cartToggle').setAttribute('aria-expanded', 'true'); } })

  document.getElementById('closeCart').addEventListener('click', () => { cartPanel.classList.remove('open'); setTimeout(() => { cartPanel.style.display = 'none'; }, 260); document.getElementById('cartToggle').setAttribute('aria-expanded', 'false'); });

  document.getElementById('checkoutWhatsapp').addEventListener('click', function (e) { if (this.classList.contains('disabled') || !this.href || this.getAttribute('aria-disabled') === 'true') { e.preventDefault(); showToast('Agrega productos al pedido antes de enviar.'); return; } e.preventDefault(); try { window.open(this.href, '_blank'); } catch (err) { window.location.href = this.href; } });

  document.getElementById('currentYear').innerText = new Date().getFullYear();
  renderMenu(); // Initialize Menu
  renderFAQ();  // Initialize FAQ
  renderCart();
})();

/* --- Search: typeahead + suggestions renderer --- */
(function () {
  const searchInput = document.getElementById('searchInput') || document.querySelector('.search-input');
  const typeahead = document.getElementById('typeahead');
  const SUG_KEY = 'bt_suggestions_v1';
  if (!searchInput || !typeahead) return;

  function readSuggestions() { try { return JSON.parse(localStorage.getItem(SUG_KEY) || '[]') } catch (e) { return [] } }
  function writeSuggestions(list) { localStorage.setItem(SUG_KEY, JSON.stringify(list)) }

  function addSuggestion(term) { const list = readSuggestions(); if (!list.includes(term)) { list.push(term); writeSuggestions(list); renderSuggestions(); } }
  function removeSuggestion(term) { const list = readSuggestions().filter(t => t !== term); writeSuggestions(list); renderSuggestions(); }

  function renderSuggestions() { const container = document.getElementById('suggestionsContainer'); if (!container) return; container.innerHTML = ''; const list = readSuggestions(); if (list.length === 0) { container.innerHTML = ''; return; } list.slice().reverse().forEach(s => { const el = document.createElement('div'); el.className = 'suggestion-chip'; el.innerHTML = `<span style="flex:1">${s}</span><div style="display:flex;gap:8px"><button class="btn-plain open-suggestion">Ir</button><button class="btn-plain remove-suggestion" title="Eliminar">✕</button></div>`; el.querySelector('.open-suggestion').addEventListener('click', () => { findAndScroll(s); }); el.querySelector('.remove-suggestion').addEventListener('click', () => { removeSuggestion(s); }); container.appendChild(el); }) }

  function showNotFoundModal(term) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed'; modal.style.inset = '0'; modal.style.display = 'flex'; modal.style.alignItems = 'center'; modal.style.justifyContent = 'center'; modal.style.zIndex = 120;
    modal.innerHTML = `
      <div style="background:#0b0b0b;padding:18px;border-radius:10px;border:1px solid rgba(255,255,255,0.04);max-width:420px;color:var(--muted)">
        <h4 style="color:var(--gold);margin:0 0 8px">No encontrado</h4>
        <p>El sabor "${term}" no se encuentra disponible. ¿Quieres enviarlo como sugerencia?</p>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">
          <button class="btn-plain" id="modalCancel">Cancelar</button>
          <button class="btn-gold" id="modalOk">Enviar sugerencia</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#modalCancel').addEventListener('click', () => { modal.remove(); });
    modal.querySelector('#modalOk').addEventListener('click', () => { addSuggestion(term); modal.remove(); window.location.hash = '#social-proof'; showToast('Gracias! sugerencia enviada.'); });
  }

  function openManualSuggestionModal() {
    const modal = document.createElement('div');
    modal.style.position = 'fixed'; modal.style.inset = '0'; modal.style.display = 'flex'; modal.style.alignItems = 'center'; modal.style.justifyContent = 'center'; modal.style.zIndex = 120;
    modal.style.background = 'rgba(0,0,0,0.8)';
    modal.innerHTML = `
      <div style="background:#0b0b0b;padding:22px;border-radius:12px;border:1px solid rgba(255,215,0,0.2);max-width:420px;width:90%;color:var(--muted);box-shadow:0 20px 50px rgba(0,0,0,0.5)">
        <h3 style="color:var(--gold);margin:0 0 12px;text-align:center">¡Tu idea, nuestro próximo sabor!</h3>
        <p style="text-align:center;margin-bottom:16px">Escribe el sabor que te gustaría probar:</p>
        <input type="text" id="manualFlavorInput" placeholder="Ej. Tapioca de Churro..." style="width:100%;padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#fff;margin-bottom:18px;outline:none">
        <div style="display:flex;gap:12px;justify-content:center">
          <button class="btn btn-gold-outline" id="manualCancel" style="flex:1">Cancelar</button>
          <button class="btn btn-primary" id="manualSend" style="flex:1"> <i class="fab fa-whatsapp"></i> Enviar a WhatsApp</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    const input = modal.querySelector('#manualFlavorInput');
    input.focus();

    modal.querySelector('#manualCancel').addEventListener('click', () => { modal.remove(); });
    modal.querySelector('#manualSend').addEventListener('click', () => {
      const flavor = input.value.trim();
      if (!flavor) { showToast('Por favor escribe un sabor'); return; }
      const text = encodeURIComponent(`Hola, me gustaría sugerir este sabor: ${flavor}`);
      window.open(`https://wa.me/7774467451?text=${text}`, '_blank');
      modal.remove();
      showToast('¡Redirigiendo a WhatsApp!');
    });
  }

  // Bind the new button
  const btnSuggest = document.getElementById('btnSuggestFlavor');
  if (btnSuggest) btnSuggest.addEventListener('click', openManualSuggestionModal);


  function findAndScroll(term) {
    const items = Array.from(document.querySelectorAll('.card-item'));
    const found = items.find(it => it.dataset.name && it.dataset.name.toLowerCase().includes(term.toLowerCase()));
    if (found) { found.scrollIntoView({ behavior: 'smooth', block: 'center' }); found.classList.add('highlight'); setTimeout(() => found.classList.remove('highlight'), 1200); return true; }
    return false;
  }

  // Typeahead rendering and keyboard navigation
  let activeIndex = -1; let currentMatches = [];
  function renderTypeahead(matches) { typeahead.innerHTML = ''; if (!matches || matches.length === 0) { typeahead.classList.remove('active'); currentMatches = []; return; } matches.forEach((m, i) => { const d = document.createElement('div'); d.className = 'typeahead-item'; d.setAttribute('role', 'option'); d.setAttribute('data-idx', i); d.innerText = m; d.addEventListener('click', () => { selectMatch(i); }); typeahead.appendChild(d); }); typeahead.classList.add('active'); currentMatches = matches; activeIndex = -1; updateAria(); }
  function updateAria() { Array.from(typeahead.children).forEach((ch, i) => { ch.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false'); }); }
  function clearTypeahead() { typeahead.innerHTML = ''; typeahead.classList.remove('active'); currentMatches = []; activeIndex = -1; }
  function selectMatch(i) { const v = currentMatches[i]; if (!v) return; searchInput.value = v; clearTypeahead(); findAndScroll(v); }

  searchInput.addEventListener('input', (e) => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) { clearTypeahead(); return; }
    // CHANGE: Use global MENU_ITEMS if available, otherwise fallback to DOM scraping (simpler to just search DOM for visual match or MENU_ITEMS for data match, but stick to DOM scraping for scrolling behavior)
    // Actually, since we render menu items dynamically, we can just search MENU_ITEMS or wait for render.
    // The original logic scraped DOM nodes. Since renderMenu() runs immediately, the DOM nodes will exist.
    // So distinct logic change isn't strictly necessary, but let's ensure we wait for render if needed.
    const items = Array.from(document.querySelectorAll('.card-item')).map(it => it.dataset.name).filter(Boolean);
    const matches = items.filter(n => n.toLowerCase().includes(q)).slice(0, 8);
    renderTypeahead(matches);
  });

  searchInput.addEventListener('keydown', (e) => {
    const key = e.key;
    if (key === 'ArrowDown') { e.preventDefault(); if (currentMatches.length === 0) return; activeIndex = Math.min(currentMatches.length - 1, activeIndex + 1); updateAria(); scrollActiveIntoView(); }
    else if (key === 'ArrowUp') { e.preventDefault(); if (currentMatches.length === 0) return; activeIndex = Math.max(0, activeIndex - 1); updateAria(); scrollActiveIntoView(); }
    else if (key === 'Enter') {
      e.preventDefault(); if (activeIndex >= 0 && currentMatches[activeIndex]) { selectMatch(activeIndex); return; }
      const term = searchInput.value.trim(); if (!term) return; const ok = findAndScroll(term); if (!ok) showNotFoundModal(term);
    } else if (key === 'Escape') { clearTypeahead(); }
  });

  function scrollActiveIntoView() { const el = typeahead.children[activeIndex]; if (el) el.scrollIntoView({ block: 'nearest' }); }

  // click outside closes
  document.addEventListener('click', (e) => { if (!e.composedPath().includes(typeahead) && !e.composedPath().includes(searchInput)) { clearTypeahead(); } });

  // initial render of suggestions area
  renderSuggestions();

})();

/* --- Public helper for add to cart --- */
function handleAddToCart(btn) {
  const card = btn.closest('.card-item');
  const name = card.dataset.name || card.querySelector('h4').innerText;
  const price = parseFloat(card.dataset.price) || 0;
  Cart.addItem(name, price);
  renderCart();
  showToast(name + ' añadido');
}
