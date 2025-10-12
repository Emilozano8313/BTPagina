(function(exports){
  let cart = [];
  function formatCurrency(v){ return '$' + Number(v).toFixed(2) + ' MXN'; }
  function getTotal(){ return cart.reduce((s,i)=>s + i.price * i.qty,0); }

  exports.addItem = function(name, price){
    const existing = cart.find(i=>i.name===name);
    if(existing) existing.qty += 1; else cart.push({name,price,qty:1});
    return cart;
  }
  exports.changeQty = function(idx, delta){ cart[idx].qty += delta; if(cart[idx].qty<=0) cart.splice(idx,1); return cart; }
  exports.removeItem = function(idx){ cart.splice(idx,1); return cart; }
  exports.clear = function(){ cart = []; return cart; }
  exports.get = function(){ return cart.slice(); }
  exports.total = function(){ return getTotal(); }
})(window.Cart = window.Cart || {});
