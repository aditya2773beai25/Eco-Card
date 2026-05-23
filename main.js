/* ── STATE ── */
let selectedRating = 0;

/* ── PRODUCT LOOKUP  (replaces data-name / data-price on HTML cards) ── */
const productInfo = {
  'card-phone':      { name: 'Eco Phone',       price: 39999  },
  'card-laptop':     { name: 'Eco Laptop',       price: 99999  },
  'card-speaker':    { name: 'Eco Speaker',      price: 9999  },
  'card-headphones': { name: 'Eco Headphones',   price: 4999  }
};

/* ── SIMPLE VALIDATORS  (replaces RegExp) ── */
function isValidEmail(email) {
  let at  = email.indexOf('@');
  let dot = email.lastIndexOf('.');
  return at > 0 && dot > at + 1 && dot < email.length - 1;
}

function isValidPhone(phone) {
  if (phone.length !== 10) return false;
  for (let i = 0; i < phone.length; i++) {
    if (phone[i] < '0' || phone[i] > '9') return false;
  }
  return true;
}

/* ── FIELD ERROR HELPERS  (replaces validateField) ── */
function markError(id) {
  const el = document.getElementById(id);
  if (el) el.closest('.form-group').classList.add('error');
}
function clearError(id) {
  const el = document.getElementById(id);
  if (el) el.closest('.form-group').classList.remove('error');
}

/* ── CART ── */
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const cart  = getCart();
  let count   = 0;
  for (let i = 0; i < cart.length; i++) count += cart[i].qty;
  badge.textContent = count;
  badge.className   = 'cart-badge' + (count === 0 ? ' zero' : '');
}

function addToCart(name, price, qty, btn) {
  const cart = getCart();
  let found  = false;
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].name === name) {
      cart[i].qty += qty;
      found = true;
      break;
    }
  }
  if (!found) cart.push({ name: name, price: price, qty: qty });
  saveCart(cart);

  btn.textContent = '✓ Added!';
  btn.classList.add('added');
  showToast('🛒 ' + name + ' added to cart!');
  setTimeout(function () {
    btn.textContent = 'Add to Cart';
    btn.classList.remove('added');
  }, 1800);

  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.classList.remove('bump');
    void badge.offsetWidth;
    badge.classList.add('bump');
  }
}

/* ── TOAST ── */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(function () { t.classList.remove('show'); }, 2800);
}

/* ── ORDER CART SUMMARY ── */
function showCartOnOrderPage() {
  const box = document.getElementById('cart-summary-box');
  if (!box) return;
  const cart = getCart();
  if (cart.length === 0) {
    box.innerHTML = '<p class="empty-cart-note">🛒 Your cart is empty. <a href="products.html" style="color:var(--green);font-weight:600;">Browse products →</a></p>';
    return;
  }
  let rows  = '';
  let total = 0;
  for (let i = 0; i < cart.length; i++) {
    const line = cart[i].price * cart[i].qty;
    total += line;
    rows += '<div class="cart-item-row">' +
            '<span class="cart-item-info">' + cart[i].name + '</span>' +
            '<span class="cart-item-controls">' +
              '<button class="cart-qty-btn" onclick="adjustCartQty(' + i + ', -1)">−</button>' +
              '<span class="cart-qty">' + cart[i].qty + '</span>' +
              '<button class="cart-qty-btn" onclick="adjustCartQty(' + i + ', 1)">+</button>' +
              '<span class="cart-item-price">₹' + line.toLocaleString('en-IN') + '</span>' +
            '</span></div>';
  }
  box.innerHTML =
    '<h3>🛒 Your Cart</h3>' + rows +
    '<div class="cart-total-row"><span>Total</span><span>₹' + total.toLocaleString('en-IN') + '</span></div>';
}

function adjustCartQty(index, change) {
  const cart = getCart();
  if (cart[index]) {
    cart[index].qty += change;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    } else {
      saveCart(cart);
    }
    saveCart(cart);
    showCartOnOrderPage();
    updateCartBadge();
  }
}

/* ── RATING ── */
function setRating(value) {
  selectedRating = value;
  const btns = document.querySelectorAll('.rating-row button');
  for (let i = 0; i < btns.length; i++) {
    if (i < value) btns[i].classList.add('selected');
    else           btns[i].classList.remove('selected');
  }
}

/* ── FEEDBACK ── */
function submitFeedback() {
  const name    = document.getElementById('feedback-name').value.trim();
  const email   = document.getElementById('feedback-email').value.trim();
  const message = document.getElementById('feedback-message').value.trim();
  let ok        = true;

  if (name.length === 0)    { markError('feedback-name');    ok = false; } else clearError('feedback-name');
  if (!isValidEmail(email)) { markError('feedback-email');   ok = false; } else clearError('feedback-email');
  if (message.length === 0) { markError('feedback-message'); ok = false; } else clearError('feedback-message');
  if (!ok) return;

  const emojis      = ['😞', '😐', '🙂', '😊', '🤩'];
  const ratingEmoji = selectedRating > 0 ? emojis[selectedRating - 1] : '';
  const feedbacks   = JSON.parse(localStorage.getItem('feedbacks') || '[]');
  feedbacks.push({ name: name, message: message, rating: ratingEmoji });
  localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

  const form    = document.getElementById('feedback-form');
  const success = document.getElementById('feedback-success');
  if (form)    form.style.display    = 'none';
  if (success) success.style.display = 'block';
  setTimeout(function () { window.location.href = 'index.html'; }, 1800);
}

function loadFeedbacksOnHome() {
  const list = document.getElementById('feedback-list');
  if (!list) return;
  const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
  if (feedbacks.length === 0) {
    list.innerHTML = '<p class="no-feedback">No feedback yet. <a href="contact.html" style="color:var(--green);font-weight:600;">Be the first!</a></p>';
    return;
  }
  let html = '';
  for (let i = feedbacks.length - 1; i >= 0; i--) {
    const fb = feedbacks[i];
    html += '<div class="feedback-item">';
    if (fb.rating) html += '<div class="fb-rating">' + fb.rating + '</div>';
    html += '<div class="fb-name">'  + escapeHtml(fb.name)    + '</div>';
    html += '<div class="fb-msg">'   + escapeHtml(fb.message) + '</div>';
    html += '</div>';
  }
  list.innerHTML = html;
}

/* ── ORDER ── */
function submitOrder() {
  const fname   = document.getElementById('order-fname').value.trim();
  const lname   = document.getElementById('order-lname').value.trim();
  const email   = document.getElementById('order-email').value.trim();
  const phone   = document.getElementById('order-phone').value.trim();
  const address = document.getElementById('order-address').value.trim();
  let ok = true;

  if (fname.length === 0)   { markError('order-fname');   ok = false; } else clearError('order-fname');
  if (lname.length === 0)   { markError('order-lname');   ok = false; } else clearError('order-lname');
  if (!isValidEmail(email)) { markError('order-email');   ok = false; } else clearError('order-email');
  if (!isValidPhone(phone)) { markError('order-phone');   ok = false; } else clearError('order-phone');
  if (address.length <= 5)  { markError('order-address'); ok = false; } else clearError('order-address');
  if (!ok) return;

  saveCart([]);
  document.getElementById('order-form-section').style.display = 'none';
  document.getElementById('order-success').style.display      = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── AUTH TABS ── */
function showAuthTab(tab, btn) {
  const sections = document.querySelectorAll('.auth-tab-section');
  const tabs     = document.querySelectorAll('.method-tab');
  for (let i = 0; i < sections.length; i++) sections[i].classList.remove('active');
  for (let i = 0; i < tabs.length; i++)     tabs[i].classList.remove('active');
  document.getElementById(tab).classList.add('active');
  btn.classList.add('active');
}
function switchToTab(tab) {
  const btn = document.querySelector('.method-tab:' + (tab === 'login' ? 'first-child' : 'last-child'));
  if (btn) showAuthTab(tab, btn);
}

/* ── PAYMENT ── */
function showPayMethod(method, tab) {
  const sections = document.querySelectorAll('.pay-section');
  const tabs     = document.querySelectorAll('.method-tab');
  for (let i = 0; i < sections.length; i++) sections[i].classList.remove('active');
  for (let i = 0; i < tabs.length; i++)     tabs[i].classList.remove('active');
  document.getElementById(method).classList.add('active');
  tab.classList.add('active');
}

/* card number: keep only digits, add space every 4 (replaces regex replace) */
function formatCard(input) {
  let digits = '';
  for (let i = 0; i < input.value.length; i++) {
    if (input.value[i] >= '0' && input.value[i] <= '9') digits += input.value[i];
    if (digits.length === 16) break;
  }
  let formatted = '';
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && i % 4 === 0) formatted += ' ';
    formatted += digits[i];
  }
  input.value = formatted;
}

/* expiry: MM / YY format (replaces regex replace) */
function formatExpiry(input) {
  let digits = '';
  for (let i = 0; i < input.value.length; i++) {
    if (input.value[i] >= '0' && input.value[i] <= '9') digits += input.value[i];
    if (digits.length === 4) break;
  }
  if (digits.length >= 3) input.value = digits.substring(0, 2) + ' / ' + digits.substring(2);
  else                    input.value = digits;
}

function confirmPayment() {
  document.getElementById('payment-form').style.display  = 'none';
  document.getElementById('success-screen').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── SIGNUP / LOGIN ── */
function submitSignup() {
  const username = document.getElementById('signup-username').value.trim();
  const password = document.getElementById('signup-password').value.trim();
  const email    = document.getElementById('signup-email').value.trim();
  const phone    = document.getElementById('signup-phone').value.trim();
  const dob      = document.getElementById('signup-dob').value;
  const errEl    = document.getElementById('signup-error');
  errEl.textContent = '';

  if (username.length < 3)  { errEl.textContent = 'Username must be at least 3 characters.';    return; }
  if (!isValidEmail(email)) { errEl.textContent = 'Please enter a valid email address.';          return; }
  if (password.length < 6)  { errEl.textContent = 'Password must be at least 6 characters.';     return; }
  if (!isValidPhone(phone)) { errEl.textContent = 'Contact number must be exactly 10 digits.';   return; }
  if (!dob)                 { errEl.textContent = 'Date of birth is required.';                   return; }

  const today = new Date();
  const birth = new Date(dob);
  let age     = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() ||
     (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  if (age < 13)  { errEl.textContent = 'You must be at least 13 years old to sign up.'; return; }
  if (age > 120) { errEl.textContent = 'Please enter a valid date of birth.';            return; }

  const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
  for (let i = 0; i < storedUsers.length; i++) {
    if (storedUsers[i].username === username) { errEl.textContent = 'Username already taken.'; return; }
  }
  storedUsers.push({ username: username, password: password, email: email, phone: phone });
  localStorage.setItem('users', JSON.stringify(storedUsers));
  errEl.style.color = 'var(--green)';
  errEl.textContent = '✅ Account created! Please log in.';
  switchToTab('login');
}

function submitLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const errEl    = document.getElementById('login-error');
  errEl.textContent = '';
  if (!username || !password) { errEl.textContent = 'Please enter both username and password.'; return; }

  const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
  for (let i = 0; i < storedUsers.length; i++) {
    if (storedUsers[i].username === username && storedUsers[i].password === password) {
      localStorage.setItem('ecoShopUser', username);
      window.location.href = 'index.html';
      return;
    }
  }
  errEl.textContent = 'Invalid username or password.';
}

function logout() {
  localStorage.removeItem('ecoShopUser');
  window.location.href = 'login.html';
}

/* ── SESSION HEADER ── */
function updateAccountHeader() {
  const btn  = document.getElementById('account-btn');
  if (!btn) return;
  const user = localStorage.getItem('ecoShopUser');
  if (user) {
    btn.textContent = '👤 ' + user;
    btn.title       = 'Click to logout';
    btn.href        = '#';
    btn.onclick     = function (e) {
      e.preventDefault();
      if (confirm('Log out of Eco Shop?')) logout();
    };
  } else {
    btn.textContent = 'Login';
    btn.href        = 'login.html';
    btn.onclick     = null;
  }
}

/* ── HEADER SEARCH ── */
function initHeaderSearch() {
  const btn   = document.getElementById('header-search-btn');
  const input = document.getElementById('header-search');
  if (!btn || !input) return;
  const page  = location.pathname.split('/').pop() || 'index.html';

  function doSearch() {
    const q = input.value.trim();
    if (!q) return;
    if (page === 'products.html') {
      const cards = document.querySelectorAll('.product-card');
      for (let i = 0; i < cards.length; i++) {
        const nameText = cards[i].querySelector('h3').textContent.toLowerCase();
        const descEl   = cards[i].querySelector('.product-desc');
        const descText = descEl ? descEl.textContent.toLowerCase() : '';
        const match    = nameText.includes(q.toLowerCase()) || descText.includes(q.toLowerCase());
        cards[i].style.display = match ? '' : 'none';
      }
    } else {
      window.location.href = 'products.html?q=' + encodeURIComponent(q);
    }
  }
  btn.addEventListener('click', doSearch);
  input.addEventListener('keypress', function (e) { if (e.key === 'Enter') doSearch(); });
}

/* ── PRODUCT PAGE  (uses id + productInfo lookup instead of data-name/data-price) ── */
function initProductPage() {
  const cards = document.querySelectorAll('.product-card');
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const info = productInfo[card.id];   /* look up by id */
    if (!info) continue;

    let qty           = 1;
    const qtyDisplay  = card.querySelector('.qty-count');
    const addBtn      = card.querySelector('.add-to-cart');

    card.querySelector('.qty-minus').addEventListener('click', function () {
      if (qty > 1) { qty--; qtyDisplay.textContent = qty; }
    });
    card.querySelector('.qty-plus').addEventListener('click', function () {
      qty++; qtyDisplay.textContent = qty;
    });

    /* IIFE keeps correct name/price/btn per card inside the loop */
    (function (n, p, b) {
      b.addEventListener('click', function () { addToCart(n, p, qty, b); });
    })(info.name, info.price, addBtn);
  }

  /* Read search param from URL without URLSearchParams (simple string split) */
  let q = null;
  const search = window.location.search;
  if (search.indexOf('q=') !== -1) {
    q = decodeURIComponent(search.split('q=')[1].split('&')[0]);
  }
  const searchInput = document.getElementById('header-search');
  if (q && searchInput) {
    searchInput.value = q;
    const allCards = document.querySelectorAll('.product-card');
    for (let i = 0; i < allCards.length; i++) {
      const name = allCards[i].querySelector('h3').textContent.toLowerCase();
      allCards[i].style.display = name.includes(q.toLowerCase()) ? '' : 'none';
    }
  }
}

/* ── RATING BUTTONS ── */
function initRatingButtons() {
  const btns = document.querySelectorAll('.rating-row button');
  for (let i = 0; i < btns.length; i++) {
    (function (index) {
      btns[index].addEventListener('click', function () { setRating(index + 1); });
    })(i);
  }
}

/* ── ACTIVE NAV LINK ── */
function setActiveNavLink() {
  const page  = location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.nav-menu a');
  for (let i = 0; i < links.length; i++) {
    links[i].classList.toggle('active', links[i].getAttribute('href') === page);
  }
}

/* ── HELPERS ── */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', function () {
  setActiveNavLink();
  updateCartBadge();
  updateAccountHeader();
  loadFeedbacksOnHome();
  showCartOnOrderPage();
  initRatingButtons();
  initHeaderSearch();
  initHamburger();
  initBackToTop();

  const page = location.pathname.split('/').pop() || 'index.html';
  if (page === 'products.html') initProductPage();
  updateLoginCartPill();
  initChatbot();
});

/* ── PASSWORD TOGGLE ── */
function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') { input.type = 'text';     btn.textContent = '🙈'; }
  else                           { input.type = 'password'; btn.textContent = '👁️'; }
}

/* ── CART QUICK-VIEW (login page) ── */
function openCartQuickview() {
  const overlay = document.getElementById('cart-overlay');
  const panel   = document.getElementById('cart-panel');
  const body    = document.getElementById('cqv-body');
  if (!overlay || !panel || !body) return;

  const cart = getCart();
  if (cart.length === 0) {
    body.innerHTML = '<div class="cqv-empty"><span>🛒</span>Your cart is empty.<br><br><a href="products.html" style="color:var(--green);font-weight:600;">Browse products →</a></div>';
  } else {
    let html  = '';
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
      const line = cart[i].price * cart[i].qty;
      total += line;
      html += '<div class="cqv-item"><span class="cqv-item-name">' +
              escapeHtml(cart[i].name) + ' ×' + cart[i].qty +
              '</span><span class="cqv-item-price">₹' + line.toLocaleString('en-IN') + '</span></div>';
    }
    html += '<div class="cqv-total"><span>Total</span><span>₹' + total.toLocaleString('en-IN') + '</span></div>';
    body.innerHTML = html;
  }
  overlay.classList.add('open');
  panel.classList.add('open');
}

function closeCartQuickview() {
  const overlay = document.getElementById('cart-overlay');
  const panel   = document.getElementById('cart-panel');
  if (overlay) overlay.classList.remove('open');
  if (panel)   panel.classList.remove('open');
}

function updateLoginCartPill() {
  const pill  = document.getElementById('auth-cart-pill');
  const count = document.getElementById('auth-cart-count');
  if (!pill || !count) return;
  const cart = getCart();
  let total  = 0;
  for (let i = 0; i < cart.length; i++) total += cart[i].qty;
  count.textContent = total;
  if (total > 0) {
    pill.querySelector('span:nth-child(2)').textContent =
      'View Cart (' + total + ' item' + (total > 1 ? 's' : '') + ')';
  }
}

/* ════════════════════════════════════════════════════════════
   CHATBOT - Open Router API Integration (GLM-4.5-Air)
   ════════════════════════════════════════════════════════════ */
let chatbotOpen      = false;
let chatbotFirstOpen = true;
let chatbotHistory   = [];

const OPENROUTER_API_KEY = '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';
const OPENROUTER_MODEL = 'google/gemini-2.0-flash-001';

function buildSystemPrompt() {
  return `You are "Eco Assistant" for Eco Shop - a sustainable electronics e-commerce store based in India. 

KEY INFO ABOUT ECO SHOP:
- Products: Eco Phone (₹39,999), Eco Laptop (₹99,999), Eco Speaker (₹39,999), Eco Headphones (₹99,999)
- All products are eco-certified and made from recycled materials
- For every order, we plant a tree in customer's name
- Payment: Credit/Debit Card, UPI, Cash on Delivery
- Shipping: 3-7 business days across India (carbon-neutral)
- Returns: 7-day return policy, refunds in 5-7 business days
- Contact: support@ecoshop.in, +91 98765 43210
- Location: Bengaluru, Karnataka, India

YOU CAN HELP USERS WITH THE FOLLOWING ACTIONS (use these commands in your response):
- To add product to cart: include "[ADD_TO_CART:product_name]" in your response (e.g., "[ADD_TO_CART:Eco Phone]" or "[ADD_TO_CART:Eco Laptop]")
- To view cart: tell user to click the cart icon or go to order page

Your personality: Friendly, helpful, eco-conscious, concise. Use bullet points for lists. Respond in English.`;
}

async function callOpenRouterAPI(userMessage) {
  chatbotHistory.push({ role: 'user', content: userMessage });

  const messages = [
    { role: 'system', content: buildSystemPrompt() },
    ...chatbotHistory.slice(-10)
  ];

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + OPENROUTER_API_KEY,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.href,
        'X-Title': 'Eco Shop Chatbot'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const assistantReply = data.choices[0].message.content;
    chatbotHistory.push({ role: 'assistant', content: assistantReply });
    return assistantReply;
  } catch (error) {
    console.error('Open Router API error:', error);
    return "I apologize, but I'm having trouble connecting right now. Please try again later or contact support@ecoshop.in for assistance.";
  }
}

function initChatbot() {
  const page = location.pathname.split('/').pop() || 'index.html';
  if (page === 'login.html') return;

  /* Build bubble */
  const bubble         = document.createElement('div');
  bubble.id            = 'chatbot-bubble';
  bubble.className     = 'chatbot-bubble';
  bubble.title         = 'Chat with Eco Assistant';
  bubble.setAttribute('aria-label', 'Open chat assistant');
  bubble.onclick       = toggleChatbot;
  bubble.innerHTML     =
    '<span class="chatbot-bubble-icon" id="chatbot-icon">🤖</span>' +
    '<span class="chatbot-unread" id="chatbot-unread">1</span>';
  document.body.appendChild(bubble);

  /* Build chat window */
  const win = document.createElement('div');
  win.id    = 'chatbot-window';
  win.className = 'chatbot-window';
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', 'Eco Assistant chat');
  win.innerHTML =
    '<div class="chatbot-header">' +
      '<div class="chatbot-avatar">🍀</div>' +
      '<div class="chatbot-info"><strong>Eco Assistant</strong>' +
        '<span class="chatbot-status">● Online</span></div>' +
      '<button class="chatbot-close" onclick="toggleChatbot()" aria-label="Close chat">✕</button>' +
    '</div>' +
    '<div class="chatbot-messages" id="chatbot-messages"></div>' +
    '<div class="chatbot-suggestions" id="chatbot-suggestions"></div>' +
    '<div class="chatbot-input-area">' +
      '<input type="text" id="chatbot-input" placeholder="Ask me anything…"' +
        ' onkeypress="handleChatKey(event)" autocomplete="off">' +
      '<button class="chatbot-send" onclick="sendChatMessage()" aria-label="Send message">➤</button>' +
    '</div>';
  document.body.appendChild(win);
}

const suggestionCommands = {
  'Our products':    'Tell me about your products',
  'Shipping info':   'Tell me about shipping',
  'Return policy':   'What is your return policy?',
  'How to order?':   'How do I place an order?',
  'Payment methods': 'What payment methods do you accept?',
  'Contact support': 'How do I contact support?'
};

function toggleChatbot() {
  chatbotOpen = !chatbotOpen;
  const win    = document.getElementById('chatbot-window');
  const bubble = document.getElementById('chatbot-bubble');
  const unread = document.getElementById('chatbot-unread');
  const icon   = document.getElementById('chatbot-icon');
  if (!win || !bubble) return;

  if (chatbotOpen) {
    win.classList.add('open');
    bubble.classList.add('open');
    if (icon)   icon.textContent         = '✕';
    if (unread) unread.style.display     = 'none';
    if (chatbotFirstOpen) {
      chatbotFirstOpen = false;
      const initialGreeting = "👋 Hi there! I'm your **Eco Assistant**. I'm here to help with products, orders, shipping, and more!\n\nWhat can I help you with today?";
      setTimeout(function () {
        appendBotMessage(initialGreeting, ['Our products', 'How to order?', 'Shipping info', 'Return policy']);
        callOpenRouterAPI("Hello");
      }, 400);
    }
    setTimeout(function () {
      const msgs = document.getElementById('chatbot-messages');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
      const input = document.getElementById('chatbot-input');
      if (input) input.focus();
    }, 350);
  } else {
    win.classList.remove('open');
    bubble.classList.remove('open');
    if (icon) icon.textContent = '🤖';
  }
}

function appendBotMessage(text, suggestions) {
  const msgs = document.getElementById('chatbot-messages');
  const sugg = document.getElementById('chatbot-suggestions');
  if (!msgs) return;

  const addToCartMatch = text.match(/\[ADD_TO_CART:([^\]]+)\]/i);
  const addToCartProduct = addToCartMatch ? addToCartMatch[1].trim() : null;
  if (addToCartProduct) {
    text = text.replace(/\[ADD_TO_CART:[^\]]+\]/gi, '').trim();
  }

  const typing     = document.createElement('div');
  typing.className = 'chat-typing';
  typing.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;

  setTimeout(function () {
    msgs.removeChild(typing);
    const msg     = document.createElement('div');
    msg.className = 'chat-msg bot';
    msg.innerHTML = escapeHtml(text)
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    msgs.appendChild(msg);
    msgs.scrollTop = msgs.scrollHeight;

if (addToCartProduct) {
        const productKey = Object.keys(productInfo).find(k => productInfo[k].name.toLowerCase().includes(addToCartProduct.toLowerCase()));
        if (productKey) {
          const pInfo = productInfo[productKey];
          const cart = getCart();
          let found = false;
          for (let i = 0; i < cart.length; i++) {
            if (cart[i].name === pInfo.name) { cart[i].qty += 1; found = true; break; }
          }
          if (!found) cart.push({ name: pInfo.name, price: pInfo.price, qty: 1 });
          saveCart(cart);
          showToast('🛒 ' + pInfo.name + ' added to cart!');
          const cartBtn = document.createElement('button');
          cartBtn.className = 'chat-action-btn';
          cartBtn.textContent = '✓ Added to Cart! View Cart →';
          cartBtn.onclick = function() { window.location.href = 'order.html'; };
          msgs.appendChild(cartBtn);
        }
      }

    if (sugg) {
      sugg.innerHTML = '';
      if (suggestions && suggestions.length > 0) {
        for (let i = 0; i < suggestions.length; i++) {
          const btn     = document.createElement('button');
          btn.className = 'chat-suggestion';
          btn.textContent = suggestions[i];
          (function (s) {
            btn.onclick = function () { sendChatSuggestion(s); };
          })(suggestions[i]);
          sugg.appendChild(btn);
        }
      }
    }
  }, 700);
}

function appendUserMessage(text) {
  const msgs = document.getElementById('chatbot-messages');
  if (!msgs) return;
  const msg     = document.createElement('div');
  msg.className = 'chat-msg user';
  msg.textContent = text;
  msgs.appendChild(msg);
  msgs.scrollTop = msgs.scrollHeight;
  const sugg = document.getElementById('chatbot-suggestions');
  if (sugg) sugg.innerHTML = '';
}

async function sendChatMessage() {
  const input = document.getElementById('chatbot-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  appendUserMessage(text);

  const response = await callOpenRouterAPI(text);
  appendBotMessage(response, []);
}

async function sendChatSuggestion(label) {
  const query = suggestionCommands[label] || label;
  appendUserMessage(label);
  const response = await callOpenRouterAPI(query);
  appendBotMessage(response, []);
}

function handleChatKey(e) {
  if (e.key === 'Enter') sendChatMessage();
}
