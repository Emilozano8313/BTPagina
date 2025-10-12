(function(){
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(href.length>1){
        e.preventDefault();
        const el = document.querySelector(href);
        if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
      }
    })
  })

  let cart = [];
  const cartCountEl = document.getElementById('cartCount');
  const cartPanel = document.getElementById('cartPanel');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const toast = document.getElementById('toast');

  function formatCurrency(v){ return '$' + Number(v).toFixed(2) + ' MXN'; }

  window.addToCart = function(btn){
    const card = btn.closest('.card-item');
    const name = card.dataset.name || card.querySelector('h4').innerText;
    const price = parseFloat(card.dataset.price || card.querySelector('.price').innerText.replace(/[\$\s]/g,'')) || 0;
    const existing = cart.find(i=>i.name===name);
    if(existing){ existing.qty += 1 } else { cart.push({name,price,qty:1}) }
    updateCartUI();
    cartCountEl.classList.add('pulse');
    setTimeout(()=>cartCountEl.classList.remove('pulse'),450);
    showToast(name + ' añadido');
  }

  function updateCartUI(){
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

    const total = cart.reduce((s,i)=>s + i.price * i.qty,0);
    cartTotalEl.innerText = formatCurrency(total);

    const wa = document.getElementById('checkoutWhatsapp');
    const phone = '7774467451';
    if(cart.length === 0){
      wa.classList.add('disabled'); wa.removeAttribute('href'); wa.setAttribute('aria-disabled','true'); cartPanel.classList.remove('open'); setTimeout(()=>{ if(cartPanel.style.display !== 'none') cartPanel.style.display = 'none'; }, 260);
    } else {
      wa.classList.remove('disabled'); wa.setAttribute('target','_blank'); wa.setAttribute('rel','noopener'); wa.removeAttribute('aria-disabled');
      const text = encodeURIComponent('Hola! Me gustaría pedir:\n' + cart.map(i=>`${i.qty} x ${i.name}`).join('\n') + '\nTotal: ' + formatCurrency(total));
      wa.href = `https://wa.me/${phone}?text=${text}`;
      if(cartPanel.style.display === 'none' || !cartPanel.classList.contains('open')){ cartPanel.style.display = 'flex'; requestAnimationFrame(()=> cartPanel.classList.add('open')); }
    }

    cartItemsEl.querySelectorAll('[data-idx][data-delta]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const idx = Number(btn.dataset.idx); const delta = Number(btn.dataset.delta);
        cart[idx].qty += delta; if(cart[idx].qty <= 0) cart.splice(idx,1); updateCartUI();
      })
    })
    cartItemsEl.querySelectorAll('.remove').forEach(btn=>{ btn.addEventListener('click', ()=>{ const idx = Number(btn.dataset.idx); cart.splice(idx,1); updateCartUI(); }) })
  }

  window.changeQty = function(idx, delta){ cart[idx].qty += delta; if(cart[idx].qty <= 0) cart.splice(idx,1); updateCartUI(); }
  window.removeItem = function(idx){ cart.splice(idx,1); updateCartUI(); }
  window.clearCart = function(){ cart = []; updateCartUI(); }

  function showToast(msg, timeout=1600){ toast.innerText = msg; toast.style.display='block'; toast.classList.add('show'); setTimeout(()=>{toast.classList.remove('show');setTimeout(()=>{toast.style.display='none'},260)}, timeout); }

  document.getElementById('cartToggle').addEventListener('click', ()=>{ const isOpen = cartPanel.classList.contains('open'); if(isOpen){ cartPanel.classList.remove('open'); setTimeout(()=>{ cartPanel.style.display = 'none'; }, 260); document.getElementById('cartToggle').setAttribute('aria-expanded','false'); } else { cartPanel.style.display = 'flex'; requestAnimationFrame(()=> cartPanel.classList.add('open')); document.getElementById('cartToggle').setAttribute('aria-expanded','true'); } })

  document.getElementById('closeCart').addEventListener('click', ()=>{ cartPanel.classList.remove('open'); setTimeout(()=>{ cartPanel.style.display = 'none'; }, 260); document.getElementById('cartToggle').setAttribute('aria-expanded','false'); });

  const checkoutBtn = document.getElementById('checkoutWhatsapp');
  checkoutBtn.addEventListener('click', function(e){ if(this.classList.contains('disabled') || !this.href || this.getAttribute('aria-disabled') === 'true'){ e.preventDefault(); showToast('Agrega productos al pedido antes de enviar.'); return; } e.preventDefault(); try{ window.open(this.href, '_blank'); }catch(err){ window.location.href = this.href; } });

  document.getElementById('currentYear').innerText = new Date().getFullYear();
  updateCartUI();
})();
