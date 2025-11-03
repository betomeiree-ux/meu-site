// Dados de produtos (pode expandir / carregar via API depois)
const PRODUCTS = [
  { id: 'p1', name: 'Conjunto Feminino', price: 179.90, img: 'https://images.unsplash.com/photo-1600180758890-6e8cf1e34b7d?w=800' },
  { id: 'p2', name: 'Shorts Masculino', price: 129.90, img: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?w=800' },
  { id: 'p3', name: 'Top Esportivo', price: 99.90, img: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=800' },
  { id: 'p4', name: 'Legging Cintura Alta', price: 149.90, img: 'https://images.unsplash.com/photo-1541292693676-4f7b2d3d3d8a?w=800' },
  { id: 'p5', name: 'Camiseta Dry-Fit', price: 79.90, img: 'https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=800' },
];

// Utils
const formatBRL = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Estado do carrinho (persistido)
const CART_KEY = 'fitstyle_cart';
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '{}'); // object { productId: qty }

const els = {
  grid: document.getElementById('grid-produtos'),
  cartCount: document.getElementById('cart-count'),
  btnOpenCart: document.getElementById('btn-open-cart'),
  btnCloseCart: document.getElementById('btn-close-cart'),
  cartDrawer: document.getElementById('cart-drawer'),
  overlay: document.getElementById('overlay'),
  cartItems: document.getElementById('cart-items'),
  cartTotal: document.getElementById('cart-total'),
  btnCheckout: document.getElementById('btn-checkout'),
  checkoutModal: document.getElementById('checkout-modal'),
  checkoutForm: document.getElementById('checkout-form'),
  closeModal: document.getElementById('close-modal'),
  checkoutMessage: document.getElementById('checkout-message'),
  btnScrollProd: document.getElementById('btn-scroll-prod')
};

// Render produtos na grid
function renderProducts() {
  els.grid.innerHTML = '';
  PRODUCTS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'produto';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div class="meta">
        <div>
          <h3>${p.name}</h3>
          <p>${formatBRL(p.price)}</p>
        </div>
        <div class="actions">
          <button class="small" data-id="${p.id}" data-action="add">Adicionar</button>
          <button class="small" data-id="${p.id}" data-action="fav">❤</button>
        </div>
      </div>
    `;
    els.grid.appendChild(card);
  });
}

// Atualiza display do carrinho
function updateCartDisplay() {
  // quantidade total
  const totalCount = Object.values(cart).reduce((s, q) => s + q, 0);
  els.cartCount.textContent = totalCount;

  // itens
  els.cartItems.innerHTML = '';
  const ids = Object.keys(cart);
  if (ids.length === 0) {
    els.cartItems.innerHTML = `<p style="color:#aaa">Seu carrinho está vazio.</p>`;
    els.cartTotal.textContent = formatBRL(0);
    return;
  }

  let total = 0;
  ids.forEach(id => {
    const qty = cart[id];
    const prod = PRODUCTS.find(p => p.id === id);
    if (!prod) return;
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
      <img src="${prod.img}" alt="${prod.name}">
      <div class="info">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${prod.name}</strong>
          <span>${formatBRL(prod.price * qty)}</span>
        </div>
        <div class="qty">
          <button data-id="${id}" data-action="dec">−</button>
          <div>${qty}</div>
          <button data-id="${id}" data-action="inc">+</button>
          <button style="margin-left:auto;background:transparent;border:none;color:#ff6b6b;cursor:pointer" data-id="${id}" data-action="rem">Remover</button>
        </div>
      </div>
    `;
    els.cartItems.appendChild(item);
    total += prod.price * qty;
  });

  els.cartTotal.textContent = formatBRL(total);
}

// Salvando e ações do carrinho
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartDisplay();
}

function addToCart(id, qty = 1) {
  cart[id] = (cart[id] || 0) + qty;
  saveCart();
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
}

function removeItem(id) {
  delete cart[id];
  saveCart();
}

// Eventos (delegation)
document.body.addEventListener('click', (e) => {
  const action = e.target.dataset?.action;
  const id = e.target.dataset?.id;
  if (action === 'add' && id) {
    addToCart(id, 1);
    // abrir carrinho automaticamente para feedback leve
    openCart();
  } else if ((action === 'inc' || action === 'dec' || action === 'rem') && id) {
    if (action === 'inc') changeQty(id, 1);
    if (action === 'dec') changeQty(id, -1);
    if (action === 'rem') removeItem(id);
  } else if (e.target.id === 'btn-open-cart') {
    openCart();
  } else if (e.target.id === 'btn-close-cart') {
    closeCart();
  } else if (e.target.id === 'btn-scroll-prod') {
    document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
  }
});

// Cart open/close
function openCart() {
  els.cartDrawer.classList.add('open');
  els.overlay.hidden = false;
  els.overlay.style.display = 'block';
  els.cartDrawer.setAttribute('aria-hidden', 'false');
}
function closeCart() {
  els.cartDrawer.classList.remove('open');
  els.overlay.hidden = true;
  els.overlay.style.display = 'none';
  els.cartDrawer.setAttribute('aria-hidden', 'true');
}
els.btnOpenCart.addEventListener('click', openCart);
els.btnCloseCart.addEventListener('click', closeCart);
els.overlay.addEventListener('click', () => {
  closeCart();
  closeModal();
});

// Checkout flow (simulado)
els.btnCheckout.addEventListener('click', () => {
  // Se vazio, feedback
  if (Object.keys(cart).length === 0) {
    alert('Seu carrinho está vazio.');
    return;
  }
  openModal();
});

function openModal() {
  els.checkoutModal.classList.add('show');
  els.checkoutModal.setAttribute('aria-hidden', 'false');
  els.overlay.hidden = false;
  els.overlay.style.display = 'block';
}
function closeModal() {
  els.checkoutModal.classList.remove('show');
  els.checkoutModal.setAttribute('aria-hidden', 'true');
  els.checkoutMessage.hidden = true;
  els.overlay.hidden = true;
  els.overlay.style.display = 'none';
}
els.closeModal.addEventListener('click', closeModal);

// Simulação de processamento de pagamento
els.checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(els.checkoutForm);
  const name = form.get('nome');
  const email = form.get('email');

  // Simula "processamento"
  els.checkoutMessage.hidden = false;
  els.checkoutMessage.textContent = 'Processando pagamento...';
  setTimeout(() => {
    // sucesso simulado
    els.checkoutMessage.textContent = `Pagamento aprovado! Obrigado, ${name}. Confirmação enviada para ${email}.`;
    // limpar carrinho
    cart = {};
    saveCart();
    // feche o modal depois de 2.2s
    setTimeout(() => {
      closeModal();
      closeCart();
      alert('Compra concluída (simulada). Obrigado pela preferência! 🚀');
    }, 1400);
  }, 1500);
});

// contato (simulado)
document.querySelector('.form-contato').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Mensagem enviada! Responderemos por e-mail em breve.');
  e.target.reset();
});

// Inicialização
renderProducts();
saveCart();
updateCartDisplay();


