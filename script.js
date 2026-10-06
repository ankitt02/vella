const products = [
  { id: 1, name: "L'Amour", type: 'EAU DE PARFUM', price: '$128.00', file: 'obsessed', photo: 'render-3.jpeg', color: '#e48baa', group: 'soft', category: 'Floral Bouquets' },
  { id: 2, name: 'Rose Noir', type: 'EXTRAIT DE PARFUM', price: '$158.00', file: 'midnight-mood', photo: 'render-2.jpeg', color: '#a61c23', group: 'afterdark', category: 'Warm & Sensual' },
  { id: 3, name: 'Eau de Lumière', type: 'EAU DE PARFUM', price: '$128.00', file: 'daydreamer', photo: 'render-5.jpeg', color: '#73b8e4', group: 'soft', category: 'Fresh & Radiant' },
  { id: 4, name: 'Jardin Secrète', type: 'EAU DE PARFUM', price: '$118.00', file: 'soft-chaos', photo: 'render-4.jpeg', color: '#d8c7a9', group: 'soft', category: 'Floral Bouquets' },
  { id: 5, name: 'Veloura Intense', type: 'EXTRAIT DE PARFUM', price: '$168.00', file: 'dark-desire', photo: 'render-1.jpeg', color: '#12382a', group: 'afterdark', category: 'Exclusive Collection' },
  { id: 6, name: 'Main Character', type: 'EAU DE PARFUM', price: '$135.00', file: 'main-character', photo: 'render-6.jpeg', color: '#df6b22', group: 'bold', category: 'Fresh & Radiant' },
  { id: 7, name: 'Gold Rush', type: 'EXTRAIT DE PARFUM', price: '$175.00', file: 'gold-rush', photo: 'render-6.jpeg', color: '#e49a16', group: 'bold', category: 'Exclusive Collection' },
  { id: 8, name: 'Night Story', type: 'EAU DE PARFUM', price: '$145.00', file: 'night-story', photo: 'render-2.jpeg', color: '#10284a', group: 'afterdark', category: 'Warm & Sensual' },
  { id: 9, name: 'Delulu', type: 'EAU DE PARFUM', price: '$125.00', file: 'delulu', photo: 'render-3.jpeg', color: '#aa80c1', group: 'soft', category: 'Floral Bouquets' },
  { id: 10, name: '2 AM', type: 'EXTRAIT DE PARFUM', price: '$160.00', file: '2am', photo: 'render-1.jpeg', color: '#25252b', group: 'afterdark', category: 'Warm & Sensual' }
];

const grid = document.querySelector('#product-grid');
let cart = [];
let wishlist = new Set();
let toastTimer;

function render(list = products) {
  if (!grid) return;
  grid.innerHTML = list
    .map(
      (p, i) => `
    <article class="product-card" style="animation-delay:${i * 0.035}s">
      <button class="wishlist-btn ${wishlist.has(p.id) ? 'active' : ''}" data-id="${p.id}" aria-label="Add to wishlist">
        ${wishlist.has(p.id) ? '♥' : '♡'}
      </button>
      <div class="product-visual photo-${p.photo.split('.')[0]}">
        <div class="photo-stage">
          <img class="product-photo" src="assets/${p.photo}" alt="Veloura Parfums ${p.name} perfume">
          <div class="native-label-mask"></div>
          <img class="perfume-label" src="assets/${p.file}.png" alt="${p.name} fragrance label">
        </div>
      </div>
      <div class="product-info">
        <h3 class="product-name">${p.name}</h3>
        <span class="product-type">${p.type}</span>
        <span class="product-price">${p.price}</span>
        <button class="quick-add dark-pill-btn" data-id="${p.file}">ADD TO CART</button>
      </div>
    </article>`
    )
    .join('');
}

const productScrollSection = document.querySelector('.product-scroll-section');
const productScrollSlides = document.querySelector('.product-scroll-slides');
const productScrollDots = document.querySelector('.product-scroll-dots');
const productScrollCard = document.querySelector('.product-scroll-card');
const productScrollAdd = document.querySelector('.product-scroll-add');
const productScrollImage = document.querySelector('.product-scroll-image');
const productScrollPrevious = document.querySelector('.product-scroll-prev');
const productScrollNext = document.querySelector('.product-scroll-next');
let productScrollFrame = 0;
let productScrollIndex = -1;

function productScrollDescription(product) {
  return product.category === 'Warm & Sensual'
    ? 'A velvety blend of depth, warmth, and quiet seduction.'
    : product.category === 'Fresh & Radiant'
      ? 'A bright, polished fragrance with a radiant clean finish.'
      : 'A luminous fragrance with a soft, unforgettable trail.';
}

function updateProductScroll(progress, forcedIndex) {
  if (!productScrollSection || !productScrollSlides || !productScrollCard) return;
  const featured = products.slice(0, 5);
  const index = forcedIndex === undefined
    ? Math.min(Math.floor(progress * featured.length), featured.length - 1)
    : Math.max(0, Math.min(forcedIndex, featured.length - 1));
  const product = featured[index];
  if (index === productScrollIndex && forcedIndex === undefined) return;
  productScrollIndex = index;
  productScrollSlides.style.setProperty('--active-index', index);
  productScrollSlides.querySelectorAll('.product-scroll-slide').forEach((slide, slideIndex) => {
    const offset = slideIndex - index;
    slide.className = `product-scroll-slide position-${Math.max(-2, Math.min(2, offset))}`;
    slide.dataset.index = slideIndex;
  });
  productScrollCard.style.setProperty('--card-color', product.color);
  productScrollCard.querySelector('.product-scroll-count').textContent = `${String(index + 1).padStart(2, '0')} / 05`;
  productScrollCard.querySelector('.product-scroll-name').textContent = product.name;
  productScrollCard.querySelector('.product-scroll-type').textContent = product.type;
  productScrollCard.querySelector('.product-scroll-copy').textContent = productScrollDescription(product);
  productScrollCard.querySelector('.product-scroll-price').textContent = product.price;
  productScrollAdd.dataset.id = product.file;
  productScrollPrevious.disabled = index === 0;
  productScrollNext.disabled = index === featured.length - 1;
  productScrollDots.querySelectorAll('button').forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
}

function initProductScroll() {
  if (!productScrollSection || !productScrollSlides || !productScrollDots) return;
  const featured = products.slice(0, 5);
  productScrollSlides.innerHTML = featured.map((product) => `
    <button class="product-scroll-slide" type="button" data-index="${featured.indexOf(product)}" aria-label="Show ${product.name}">
      <img src="assets/${product.photo}" alt="${product.name} perfume">
      <span class="product-scroll-slide-label">${product.name}</span>
    </button>`).join('');
  productScrollDots.innerHTML = featured.map((product, index) => `<button type="button" aria-label="Show ${product.name}" data-index="${index}"></button>`).join('');
  const update = () => {
    productScrollFrame = 0;
    const rect = productScrollSection.getBoundingClientRect();
    const travel = Math.max(productScrollSection.offsetHeight - window.innerHeight, 1);
    updateProductScroll(Math.min(Math.max(-rect.top / travel, 0), 1));
  };
  window.addEventListener('scroll', () => {
    if (!productScrollFrame) productScrollFrame = requestAnimationFrame(update);
  }, { passive: true });
  function goToProduct(index) {
    const top = productScrollSection.offsetTop + (productScrollSection.offsetHeight - window.innerHeight) * (index / (featured.length - 1));
    window.scrollTo({ top, behavior: 'smooth' });
  }
  productScrollDots.addEventListener('click', (event) => {
    const dot = event.target.closest('button');
    if (!dot) return;
    goToProduct(Number(dot.dataset.index));
  });
  productScrollSlides.addEventListener('click', (event) => {
    const slide = event.target.closest('.product-scroll-slide');
    if (slide) goToProduct(Number(slide.dataset.index));
  });
  productScrollPrevious.addEventListener('click', () => goToProduct(productScrollIndex - 1));
  productScrollNext.addEventListener('click', () => goToProduct(productScrollIndex + 1));
  productScrollImage.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToProduct(productScrollIndex - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToProduct(productScrollIndex + 1);
    }
  });
  update();
}

function updateCart() {
  document.querySelectorAll('.bag-count').forEach((x) => (x.textContent = cart.length));
  const items = document.querySelector('.cart-items');
  const content = document.querySelector('.cart-content');
  const totalEl = document.querySelector('.cart-total');

  if (!cart.length) {
    items.innerHTML = '';
    content.hidden = false;
    if (totalEl) totalEl.innerHTML = '';
    return;
  }
  content.hidden = true;

  const totalSum = cart.reduce((sum, item) => sum + parseFloat(item.price.replace('$', '')), 0);

  items.innerHTML = cart
    .map(
      (p, i) => `
    <div class="cart-item">
      <img src="assets/${p.file}.png" alt="${p.name}">
      <div class="cart-item-copy">
        <strong>${p.name}</strong>
        <span>${p.type}</span>
        <span class="cart-item-price">${p.price}</span>
      </div>
      <button class="remove-item" data-index="${i}">×</button>
    </div>`
    )
    .join('');

  if (totalEl) {
    totalEl.innerHTML = `
      <span>Subtotal:</span>
      <strong>$${totalSum.toFixed(2)}</strong>
    `;
  }
}

if (grid) {
  grid.addEventListener('click', (e) => {
    const wishBtn = e.target.closest('.wishlist-btn');
    if (wishBtn) {
      const id = Number(wishBtn.dataset.id);
      if (wishlist.has(id)) {
        wishlist.delete(id);
      } else {
        wishlist.add(id);
      }
      render();
      return;
    }

    const b = e.target.closest('.quick-add');
    if (!b) return;
    const p = products.find((x) => x.file === b.dataset.id);
    if (p) {
      cart.push(p);
      updateCart();
      const t = document.querySelector('.toast');
      if (t) {
        t.textContent = `${p.name} added to your bag ✨`;
        t.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove('show'), 2100);
      }
    }
  });
}

if (productScrollAdd) {
  productScrollAdd.addEventListener('click', () => {
    const product = products.find((item) => item.file === productScrollAdd.dataset.id);
    if (!product) return;
    cart.push(product);
    updateCart();
    const toast = document.querySelector('.toast');
    if (toast) {
      toast.textContent = `${product.name} added to your bag`;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 2100);
    }
  });
}

const cartItems = document.querySelector('.cart-items');
if (cartItems) {
  cartItems.addEventListener('click', (e) => {
    const b = e.target.closest('.remove-item');
    if (!b) return;
    cart.splice(Number(b.dataset.index), 1);
    updateCart();
  });
}

document.querySelectorAll('.filter').forEach((b) =>
  b.addEventListener('click', () => {
    const active = document.querySelector('.filter.active');
    if (active) active.classList.remove('active');
    b.classList.add('active');
    const f = b.dataset.filter;
    render(f === 'all' ? products : products.filter((p) => p.group === f || p.category.toLowerCase().includes(f)));
  })
);

const overlay = document.querySelector('#overlay');
const drawer = document.querySelector('.cart-drawer');

function openBag() {
  if (overlay) overlay.classList.add('open');
  if (drawer) drawer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBag() {
  if (overlay) overlay.classList.remove('open');
  if (drawer) drawer.classList.remove('open');
  document.body.style.overflow = '';
}

const bagBtn = document.querySelector('.bag-btn');
if (bagBtn) bagBtn.addEventListener('click', openBag);

const closeDrawer = document.querySelector('.close-drawer');
if (closeDrawer) closeDrawer.addEventListener('click', closeBag);

if (overlay) overlay.addEventListener('click', closeBag);

const continueBtn = document.querySelector('.continue');
if (continueBtn) continueBtn.addEventListener('click', closeBag);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeBag();
});

const signupForm = document.querySelector('.signup');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.querySelector('.signup-message');
    if (msg) msg.textContent = 'Thank you for subscribing to Veloura Parfums. ✨';
    e.currentTarget.reset();
  });
}

const searchOpen = document.querySelector('.search-open');
if (searchOpen) {
  searchOpen.addEventListener('click', () => {
    const row = document.querySelector('.search-row');
    if (row) {
      row.hidden = false;
      document.querySelector('#collection')?.scrollIntoView({ behavior: 'smooth' });
      document.querySelector('#scent-search')?.focus();
    }
  });
}

const scentSearch = document.querySelector('#scent-search');
if (scentSearch) {
  scentSearch.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    render(products.filter((p) => (p.name + ' ' + p.group + ' ' + p.category).toLowerCase().includes(q)));
  });
}

const searchClear = document.querySelector('.search-clear');
if (searchClear) {
  searchClear.addEventListener('click', () => {
    if (scentSearch) {
      scentSearch.value = '';
      render();
      scentSearch.focus();
    }
  });
}

render();
initProductScroll();

const reviewsGrid = document.querySelector('.testimonials-grid');
const reviewsPrevious = document.querySelector('.reviews-prev');
const reviewsNext = document.querySelector('.reviews-next');
if (reviewsGrid && reviewsPrevious && reviewsNext) {
  const moveReviews = (direction) => reviewsGrid.scrollBy({ left: direction * reviewsGrid.clientWidth * 0.82, behavior: 'smooth' });
  reviewsPrevious.addEventListener('click', () => moveReviews(-1));
  reviewsNext.addEventListener('click', () => moveReviews(1));
}
