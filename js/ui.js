(function(){
  const cartCountEl = document.getElementById('cartCount');
  const cartPanel = document.getElementById('cartPanel');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const toast = document.getElementById('toast');

  function formatCurrency(v){ return '$' + Number(v).toFixed(2) + ' MXN'; }

  window.renderCart = function(){
    const cart = Cart.get();
    const count = cart.reduce((s,i)=>s + i.qty,0);
    cartCountEl.innerText = count;
    cartItemsEl.innerHTML = '';
    cart.forEach((it,idx)=>{
      const div = document.createElement('div'); div.className='cart-item';
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

    cartItemsEl.querySelectorAll('[data-idx][data-delta]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const idx = Number(btn.dataset.idx); const delta = Number(btn.dataset.delta);
        Cart.changeQty(idx, delta); renderCart();
      })
    })
    cartItemsEl.querySelectorAll('.remove').forEach(btn=>{ btn.addEventListener('click', ()=>{ const idx = Number(btn.dataset.idx); Cart.removeItem(idx); renderCart(); }) })

    const wa = document.getElementById('checkoutWhatsapp');
    if(Cart.get().length === 0){ wa.classList.add('disabled'); wa.removeAttribute('href'); wa.setAttribute('aria-disabled','true'); cartPanel.classList.remove('open'); setTimeout(()=>{ if(cartPanel.style.display !== 'none') cartPanel.style.display = 'none'; }, 260);
    } else { wa.classList.remove('disabled'); wa.setAttribute('target','_blank'); wa.setAttribute('rel','noopener'); wa.removeAttribute('aria-disabled'); const text = encodeURIComponent('Hola! Me gustaría pedir:\n' + Cart.get().map(i=>`${i.qty} x ${i.name}`).join('\n') + '\nTotal: ' + formatCurrency(Cart.total())); wa.href = `https://wa.me/7774467451?text=${text}`; if(cartPanel.style.display === 'none' || !cartPanel.classList.contains('open')){ cartPanel.style.display = 'flex'; requestAnimationFrame(()=> cartPanel.classList.add('open')); } }
  }

  window.showToast = function(msg, timeout=1400){ toast.innerText = msg; toast.style.display='block'; toast.classList.add('show'); setTimeout(()=>{toast.classList.remove('show');setTimeout(()=>{toast.style.display='none'},260)}, timeout); }

  document.getElementById('cartToggle').addEventListener('click', ()=>{ const isOpen = cartPanel.classList.contains('open'); if(isOpen){ cartPanel.classList.remove('open'); setTimeout(()=>{ cartPanel.style.display = 'none'; }, 260); document.getElementById('cartToggle').setAttribute('aria-expanded','false'); } else { cartPanel.style.display = 'flex'; requestAnimationFrame(()=> cartPanel.classList.add('open')); document.getElementById('cartToggle').setAttribute('aria-expanded','true'); } })

  document.getElementById('closeCart').addEventListener('click', ()=>{ cartPanel.classList.remove('open'); setTimeout(()=>{ cartPanel.style.display = 'none'; }, 260); document.getElementById('cartToggle').setAttribute('aria-expanded','false'); });

  document.getElementById('checkoutWhatsapp').addEventListener('click', function(e){ if(this.classList.contains('disabled') || !this.href || this.getAttribute('aria-disabled') === 'true'){ e.preventDefault(); showToast('Agrega productos al pedido antes de enviar.'); return; } e.preventDefault(); try{ window.open(this.href, '_blank'); }catch(err){ window.location.href = this.href; } });

  document.getElementById('currentYear').innerText = new Date().getFullYear();
  renderCart();
})();

/* --- Search: typeahead + suggestions renderer --- */
(function(){
  const searchInput = document.getElementById('searchInput') || document.querySelector('.search-input');
  const typeahead = document.getElementById('typeahead');
  const SUG_KEY = 'bt_suggestions_v1';
  if(!searchInput || !typeahead) return;

  function readSuggestions(){ try{ return JSON.parse(localStorage.getItem(SUG_KEY) || '[]') }catch(e){ return [] } }
  function writeSuggestions(list){ localStorage.setItem(SUG_KEY, JSON.stringify(list)) }

  function addSuggestion(term){ const list = readSuggestions(); if(!list.includes(term)) { list.push(term); writeSuggestions(list); renderSuggestions(); } }
  function removeSuggestion(term){ const list = readSuggestions().filter(t=>t!==term); writeSuggestions(list); renderSuggestions(); }

  function renderSuggestions(){ const container = document.getElementById('suggestionsContainer'); if(!container) return; container.innerHTML = ''; const list = readSuggestions(); if(list.length === 0){ container.innerHTML = '<div style="color:var(--muted)">Aún no hay sugerencias — ¡pide tu sabor!</div>'; return; } list.slice().reverse().forEach(s=>{ const el = document.createElement('div'); el.className='suggestion-chip'; el.innerHTML = `<span style="flex:1">${s}</span><div style="display:flex;gap:8px"><button class="btn-plain open-suggestion">Ir</button><button class="btn-plain remove-suggestion" title="Eliminar">✕</button></div>`; el.querySelector('.open-suggestion').addEventListener('click', ()=>{ findAndScroll(s); }); el.querySelector('.remove-suggestion').addEventListener('click', ()=>{ removeSuggestion(s); }); container.appendChild(el); }) }

  function showNotFoundModal(term){
    const modal = document.createElement('div');
    modal.style.position = 'fixed';modal.style.inset='0';modal.style.display='flex';modal.style.alignItems='center';modal.style.justifyContent='center';modal.style.zIndex=120;
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
    modal.querySelector('#modalCancel').addEventListener('click', ()=>{ modal.remove(); });
    modal.querySelector('#modalOk').addEventListener('click', ()=>{ addSuggestion(term); modal.remove(); window.location.hash = '#social-proof'; showToast('Gracias! sugerencia enviada.'); });
  }

  function findAndScroll(term){
    const items = Array.from(document.querySelectorAll('.card-item'));
    const found = items.find(it => it.dataset.name && it.dataset.name.toLowerCase().includes(term.toLowerCase()));
    if(found){ found.scrollIntoView({behavior:'smooth',block:'center'}); found.classList.add('highlight'); setTimeout(()=>found.classList.remove('highlight'),1200); return true; }
    return false;
  }

  // Typeahead rendering and keyboard navigation
  let activeIndex = -1; let currentMatches = [];
  function renderTypeahead(matches){ typeahead.innerHTML = ''; if(!matches || matches.length === 0){ typeahead.classList.remove('active'); currentMatches = []; return; } matches.forEach((m, i)=>{ const d = document.createElement('div'); d.className='typeahead-item'; d.setAttribute('role','option'); d.setAttribute('data-idx', i); d.innerText = m; d.addEventListener('click', ()=>{ selectMatch(i); }); typeahead.appendChild(d); }); typeahead.classList.add('active'); currentMatches = matches; activeIndex = -1; updateAria(); }
  function updateAria(){ Array.from(typeahead.children).forEach((ch, i)=>{ ch.setAttribute('aria-selected', i===activeIndex ? 'true' : 'false'); }); }
  function clearTypeahead(){ typeahead.innerHTML=''; typeahead.classList.remove('active'); currentMatches=[]; activeIndex=-1; }
  function selectMatch(i){ const v = currentMatches[i]; if(!v) return; searchInput.value = v; clearTypeahead(); findAndScroll(v); }

  searchInput.addEventListener('input', (e)=>{
    const q = searchInput.value.trim().toLowerCase();
    if(!q){ clearTypeahead(); return; }
    const items = Array.from(document.querySelectorAll('.card-item')).map(it=>it.dataset.name).filter(Boolean);
    const matches = items.filter(n=> n.toLowerCase().includes(q)).slice(0,8);
    renderTypeahead(matches);
  });

  searchInput.addEventListener('keydown', (e)=>{
    const key = e.key;
    if(key === 'ArrowDown'){ e.preventDefault(); if(currentMatches.length===0) return; activeIndex = Math.min(currentMatches.length-1, activeIndex+1); updateAria(); scrollActiveIntoView(); }
    else if(key === 'ArrowUp'){ e.preventDefault(); if(currentMatches.length===0) return; activeIndex = Math.max(0, activeIndex-1); updateAria(); scrollActiveIntoView(); }
    else if(key === 'Enter'){
      e.preventDefault(); if(activeIndex >= 0 && currentMatches[activeIndex]){ selectMatch(activeIndex); return; }
      const term = searchInput.value.trim(); if(!term) return; const ok = findAndScroll(term); if(!ok) showNotFoundModal(term);
    } else if(key === 'Escape'){ clearTypeahead(); }
  });

  function scrollActiveIntoView(){ const el = typeahead.children[activeIndex]; if(el) el.scrollIntoView({block:'nearest'}); }

  // click outside closes
  document.addEventListener('click', (e)=>{ if(!e.composedPath().includes(typeahead) && !e.composedPath().includes(searchInput)){ clearTypeahead(); } });

  // initial render of suggestions area
  renderSuggestions();

})();

/* --- Public helper for add to cart --- */
function handleAddToCart(btn){
  const card = btn.closest('.card-item');
  const name = card.dataset.name || card.querySelector('h4').innerText;
  const price = parseFloat(card.dataset.price) || 0;
  Cart.addItem(name, price);
  renderCart();
  showToast(name + ' añadido');
}
