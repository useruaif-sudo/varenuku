// Order modal
function openOrderModal() {
  document.getElementById('orderModalOverlay').classList.add('open');
  document.getElementById('orderModal').classList.add('open');
}

function closeOrderModal() {
  document.getElementById('orderModalOverlay').classList.remove('open');
  document.getElementById('orderModal').classList.remove('open');
}

function toggleAddress() {
  const delivery = document.querySelector('input[name="delivery"]:checked');
  const addressField = document.getElementById('addressField');
  const addressInput = document.getElementById('oAddress');
  if (delivery && delivery.value === 'city') {
    addressField.style.display = 'flex';
    addressInput.required = true;
  } else {
    addressField.style.display = 'none';
    addressInput.required = false;
  }
}

// ── TELEGRAM INTEGRATION ──
async function sendToTelegram(orderData) {
  const BOT_TOKEN = '8827962240:AAFE6q-It4fsnJzTiZjmmkwP5bWJM8Eou2E';
  const CHAT_ID = '7753910778';
  
  // Формуємо повідомлення
  let message = `🥟 <b>НОВЕ ЗАМОВЛЕННЯ #${orderData.orderNum}</b>\n\n`;
  message += `📅 <b>Дата:</b> ${orderData.date}\n`;
  message += `🕐 <b>Час:</b> ${orderData.time}\n\n`;
  message += `👤 <b>Клієнт:</b> ${orderData.lastName} ${orderData.firstName}\n`;
  message += `📞 <b>Телефон:</b> ${orderData.phone}\n`;
  message += `💳 <b>Оплата:</b> ${orderData.payment === 'card' ? 'Картка' : 'Готівка'}\n`;
  message += `🚗 <b>Отримання:</b> ${orderData.delivery === 'pickup' ? 'Самовивіз' : 'Доставка'}\n`;
  
  if (orderData.delivery === 'city' && orderData.address) {
    message += `📍 <b>Адреса:</b> ${orderData.address}\n`;
  }
  
  if (orderData.comment) {
    message += `💬 <b>Коментар:</b> ${orderData.comment}\n`;
  }
  
  message += `\n📦 <b>ТОВАРИ:</b>\n`;
  orderData.items.forEach(item => {
    message += `\n${item.icon} <b>${item.name}</b>\n`;
    if (item.category) {
      message += `   └ ${item.category}\n`;
    }
    message += `   └ ${item.qty} кг × ${item.price} грн = ${item.qty * item.price} грн\n`;
  });
  
  message += `\n💰 <b>РАЗОМ:</b> ${orderData.total} грн`;
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    const result = await response.json();
    if (result.ok) {
      console.log('✅ Замовлення відправлено в Telegram');
    } else {
      console.error('❌ Помилка відправки в Telegram:', result);
    }
  } catch (error) {
    console.error('❌ Помилка з\'єднання з Telegram:', error);
  }
}

// ── SEND QUESTION TO TELEGRAM ──
async function sendChatMessage(e) {
  e.preventDefault();
  
  const BOT_TOKEN = '8827962240:AAFE6q-It4fsnJzTiZjmmkwP5bWJM8Eou2E';
  const CHAT_ID = '7753910778';
  
  const userName = document.getElementById('chatUserName').value.trim();
  const userPhone = document.getElementById('chatUserPhone').value.trim();
  const messageText = document.getElementById('chatMessageInput').value.trim();
  
  if (!messageText || !userName || !userPhone) return;
  
  const now = new Date();
  const dateStr = now.toLocaleDateString('uk-UA', { day:'2-digit', month:'2-digit', year:'numeric' });
  const timeStr = now.toLocaleTimeString('uk-UA', { hour:'2-digit', minute:'2-digit' });
  
  // Додаємо повідомлення користувача в чат
  const chatBody = document.getElementById('chatBody');
  const userMsgDiv = document.createElement('div');
  userMsgDiv.className = 'chat-msg-row user';
  userMsgDiv.innerHTML = `
    <div class="chat-bubble">
      <span class="chat-text">${messageText}</span>
      <span class="chat-time">${timeStr}</span>
    </div>
  `;
  chatBody.appendChild(userMsgDiv);
  
  // Прокручуємо вниз
  chatBody.scrollTop = chatBody.scrollHeight;
  
  // Очищаємо тільки поле повідомлення
  document.getElementById('chatMessageInput').value = '';
  
  // Ховаємо поля імені та телефону після першого відправлення
  document.getElementById('chatUserName').style.display = 'none';
  document.getElementById('chatUserPhone').style.display = 'none';
  
  // Видаляємо required з прихованих полів
  document.getElementById('chatUserName').removeAttribute('required');
  document.getElementById('chatUserPhone').removeAttribute('required');
  
  // Формуємо повідомлення для Telegram
  let message = `💬 <b>НОВЕ ПИТАННЯ З ЧАТУ</b>\n\n`;
  message += `📅 <b>Дата:</b> ${dateStr}\n`;
  message += `🕐 <b>Час:</b> ${timeStr}\n\n`;
  message += `👤 <b>Ім'я:</b> ${userName}\n`;
  message += `📞 <b>Телефон:</b> ${userPhone}\n\n`;
  message += `💬 <b>Повідомлення:</b>\n${messageText}`;
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    const result = await response.json();
    if (result.ok) {
      console.log('✅ Повідомлення відправлено в Telegram');
      
      // Додаємо повідомлення про успішну відправку
      setTimeout(() => {
        const confirmMsgDiv = document.createElement('div');
        confirmMsgDiv.className = 'chat-msg-row';
        confirmMsgDiv.innerHTML = `
          <div class="chat-avatar">🥟</div>
          <div class="chat-bubble">
            <span class="chat-text">Дякуємо, ${userName}! Ваше повідомлення отримано. Ми зв'яжемося з вами найближчим часом! 😊</span>
            <span class="chat-time">щойно</span>
          </div>
        `;
        chatBody.appendChild(confirmMsgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 500);
    } else {
      console.error('❌ Помилка відправки в Telegram:', result);
    }
  } catch (error) {
    console.error('❌ Помилка відправки повідомлення:', error);
  }
}

function submitOrder(e) {
  e.preventDefault();
  const lastName  = document.getElementById('oLastName').value.trim();
  const firstName = document.getElementById('oFirstName').value.trim();
  const phone     = document.getElementById('oPhone').value.trim();
  const payment   = document.querySelector('input[name="payment"]:checked').value;
  const delivery  = document.querySelector('input[name="delivery"]:checked').value;
  const address   = document.getElementById('oAddress').value.trim();
  const comment   = document.getElementById('oComment').value.trim();

  // Генеруємо номер замовлення
  const orderNum = Math.floor(Math.random() * 90000) + 10000;
  const now = new Date();
  const dateStr = now.toLocaleDateString('uk-UA', { day:'2-digit', month:'2-digit', year:'numeric' });
  const timeStr = now.toLocaleTimeString('uk-UA', { hour:'2-digit', minute:'2-digit' });

  // Відправляємо в Telegram
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  sendToTelegram({
    orderNum,
    date: dateStr,
    time: timeStr,
    lastName,
    firstName,
    phone,
    payment,
    delivery,
    address,
    comment,
    items: cart,
    total
  });

  // Рядки товарів
  const itemsHtml = cart.map(item => `
    <tr>
      <td style="padding:.4rem .2rem;border-bottom:1px solid #f0e8df">
        <span style="display:block;font-size:.7rem;color:var(--muted);font-weight:500;text-transform:uppercase;letter-spacing:.4px;margin-bottom:.1rem">${item.category || ''}</span>
        ${item.icon} ${item.name}
      </td>
      <td style="padding:.4rem .2rem;border-bottom:1px solid #f0e8df;text-align:center;white-space:nowrap">${item.qty} кг</td>
      <td style="padding:.4rem .2rem;border-bottom:1px solid #f0e8df;text-align:right;white-space:nowrap;color:#2ecc71;font-weight:700">${item.price * item.qty} грн</td>
    </tr>
  `).join('');

  document.getElementById('receiptContent').innerHTML = `
    <div style="text-align:center;margin-bottom:1.2rem">
      <div style="font-size:3rem;margin-bottom:.4rem">✅</div>
      <h3 style="font-family:'Playfair Display',serif;font-size:1.5rem;color:var(--brown);margin-bottom:.2rem">Замовлення оформлено!</h3>
      <p style="color:var(--muted);font-size:.85rem">Ми зв'яжемося з вами найближчим часом</p>
    </div>

    <div style="background:var(--cream);border-radius:12px;padding:1rem 1.2rem;margin-bottom:1rem;font-size:.85rem">
      <div style="display:flex;justify-content:space-between;margin-bottom:.3rem">
        <span style="color:var(--muted)">Замовлення №</span>
        <strong style="color:var(--brown)">${orderNum}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:.3rem">
        <span style="color:var(--muted)">Дата / час</span>
        <span>${dateStr}, ${timeStr}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:.3rem">
        <span style="color:var(--muted)">Клієнт</span>
        <span>${lastName} ${firstName}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:.3rem">
        <span style="color:var(--muted)">Телефон</span>
        <span>${phone}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:.3rem">
        <span style="color:var(--muted)">Оплата</span>
        <span>${payment === 'card' ? '💳 Картка' : '💵 Готівка'}</span>
      </div>
      <div style="display:flex;justify-content:space-between${delivery === 'city' ? ';margin-bottom:.3rem' : ''}">
        <span style="color:var(--muted)">Отримання</span>
        <span>${delivery === 'pickup' ? '🏠 Самовивіз' : '🚗 Доставка'}</span>
      </div>
      ${delivery === 'city' && address ? `
      <div style="display:flex;justify-content:space-between">
        <span style="color:var(--muted)">Адреса</span>
        <span style="text-align:right;max-width:60%">${address}</span>
      </div>` : ''}
      ${comment ? `
      <div style="display:flex;justify-content:space-between;margin-top:.3rem">
        <span style="color:var(--muted)">Коментар</span>
        <span style="text-align:right;max-width:60%">${comment}</span>
      </div>` : ''}
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:.85rem;margin-bottom:.8rem">
      <thead>
        <tr style="border-bottom:2px solid var(--gold)">
          <th style="padding:.4rem .2rem;text-align:left;color:var(--muted);font-weight:600">Товар</th>
          <th style="padding:.4rem .2rem;text-align:center;color:var(--muted);font-weight:600">Кількість</th>
          <th style="padding:.4rem .2rem;text-align:right;color:var(--muted);font-weight:600">Сума</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div style="display:flex;justify-content:space-between;align-items:center;padding:.8rem 1rem;background:var(--brown);border-radius:10px;color:#fff">
      <span style="font-size:1rem;font-weight:600">Разом до сплати:</span>
      <span style="font-size:1.2rem;font-weight:700;color:var(--gold)">${total} грн</span>
    </div>

    <div class="receipt-actions">
      <button class="receipt-btn receipt-btn-pdf" onclick="receiptToPdf()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 17h-1v-5h1.8c1.1 0 1.7.6 1.7 1.5 0 1-.7 1.5-1.8 1.5H8.5V17zm0-2.8h.7c.5 0 .8-.2.8-.7s-.3-.7-.8-.7H8.5v1.4zm4.3 2.8h-1.1v-5h1.1c1.5 0 2.4.9 2.4 2.5s-.9 2.5-2.4 2.5zm0-4.2h-.1v3.4h.1c.9 0 1.4-.6 1.4-1.7s-.5-1.7-1.4-1.7zm4.4 4.2h-1v-5h2.8v.8H17v1.3h1.7v.8H17V17z"/></svg>
        Зберегти PDF
      </button>
      <button class="receipt-btn receipt-btn-excel" onclick="receiptToExcel()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM7.2 17l1.5-2.3L7.3 12h1.1l.9 1.6.9-1.6H11l-1.4 2.7L11 17H9.9l-1-1.7-1 1.7H7.2zm5.3 0v-5h1v4.2h2V17h-3z"/></svg>
        Зберегти Excel
      </button>
    </div>
  `;

  // Закриваємо форму, очищаємо кошик
  closeOrderModal();
  closeCart();
  cart = [];
  localStorage.removeItem('cart');
  updateCartDisplay();
  // Скидаємо кнопки на всіх картках
  document.querySelectorAll('.card').forEach(card => {
    const counter = card.querySelector('.card-qty-control');
    if (counter) {
      counter.remove();
      const footer = card.querySelector('.card-footer');
      const addBtn = document.createElement('button');
      addBtn.className = 'add-btn';
      addBtn.textContent = '+ В кошик';
      addBtn.onclick = function() { addToCart(this); };
      footer.appendChild(addBtn);
    }
  });
  document.getElementById('orderForm').reset();
  document.getElementById('addressField').style.display = 'none';

  // Показуємо чек
  document.getElementById('receiptModalOverlay').classList.add('open');
  document.getElementById('receiptModal').classList.add('open');

  // Запускаємо конфеті
  launchConfetti();
}

function closeReceiptModal() {
  document.getElementById('receiptModalOverlay').classList.remove('open');
  document.getElementById('receiptModal').classList.remove('open');
}

// ── CONFETTI ──
function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#c9a84c','#5c3d2e','#2ecc71','#e74c3c','#3498db','#f39c12','#9b59b6','#fff'];
  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    w: Math.random() * 10 + 5,
    h: Math.random() * 6 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.15,
    vx: (Math.random() - 0.5) * 3,
    vy: Math.random() * 4 + 2,
    active: true
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activePieces = 0;
    
    pieces.forEach(p => {
      if (!p.active) return;
      
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      
      p.x  += p.vx;
      p.y  += p.vy;
      p.rot += p.rotSpeed;
      p.vy += 0.05; // gravity
      
      // Якщо конфеті впало за межі екрану - деактивуємо його
      if (p.y > canvas.height + 20) {
        p.active = false;
      } else {
        activePieces++;
      }
    });
    
    // Якщо всі конфеті впали - видаляємо canvas
    if (activePieces === 0) {
      canvas.remove();
    } else {
      requestAnimationFrame(draw);
    }
  }
  
  draw();
}

// ── PDF (через браузерний друк) ──
function receiptToPdf() {
  const content = document.getElementById('receiptContent').innerHTML;
  const printArea = document.getElementById('receiptPrintArea');
  printArea.innerHTML = `
    <div style="font-family:'Inter',sans-serif;max-width:480px;margin:0 auto;padding:1.5rem">
      ${content.replace(/<div class="receipt-actions">[\s\S]*?<\/div>\s*$/, '')}
    </div>`;
  printArea.style.display = 'block';

  // Ховаємо все крім printArea і друкуємо
  document.body.classList.add('printing');
  window.print();
  document.body.classList.remove('printing');
  printArea.style.display = 'none';
}

// ── EXCEL (CSV з BOM для коректного відкриття в Excel) ──
function receiptToExcel() {
  const modal = document.getElementById('receiptContent');

  // Збираємо дані з DOM
  const rows = modal.querySelectorAll('tbody tr');
  const infoRows = modal.querySelectorAll('[style*="justify-content:space-between"]');

  let info = '';
  infoRows.forEach(row => {
    const cells = row.querySelectorAll('span, strong');
    if (cells.length >= 2) {
      info += `${cells[0].textContent.trim()}\t${cells[cells.length-1].textContent.trim()}\n`;
    }
  });

  let csv = '\uFEFF'; // BOM для Excel
  csv += 'Спадщина смаку — Замовлення\n\n';
  csv += info + '\n';
  csv += 'Категорія\tТовар\tКількість (кг)\tСума (грн)\n';

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length === 3) {
      const catEl  = cells[0].querySelector('span');
      const cat    = catEl ? catEl.textContent.trim() : '';
      const name   = cells[0].textContent.replace(cat, '').trim();
      const qty    = cells[1].textContent.replace('кг','').trim();
      const sum    = cells[2].textContent.replace('грн','').trim();
      csv += `${cat}\t${name}\t${qty}\t${sum}\n`;
    }
  });

  // Підсумок
  const totalEl = modal.querySelector('[style*="background:var(--brown)"] span:last-child');
  if (totalEl) csv += `\nРазом:\t\t\t${totalEl.textContent.trim()}\n`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `замовлення_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}



// Optimized scroll handler with debouncing
const siteHeader = document.querySelector('.site-header');
const mobileMenuBar = document.querySelector('.mobile-menu-bar');
let scrollTimeout;
let lastScrollY = 0;

function handleScroll() {
  const currentScrollY = window.scrollY;
  
  // Only update if scroll changed significantly (more than 5px)
  if (Math.abs(currentScrollY - lastScrollY) < 5) return;
  
  lastScrollY = currentScrollY;
  
  const contactFloat = document.getElementById('contactFloat');
  const tiktokFloat = document.getElementById('tiktokFloat');
  
  if (currentScrollY > 80) {
    siteHeader.classList.add('visible');
    if (contactFloat) {
      contactFloat.classList.add('visible');
      if (window._showContactBadgeSoon) window._showContactBadgeSoon();
    }
    if (tiktokFloat) {
      tiktokFloat.classList.add('visible');
      // TikTok banner logic
      const seen = localStorage.getItem('tiktokBannerSeen');
      const banner = document.getElementById('tiktokBanner');
      if (!seen && banner && !banner.classList.contains('visible') && !window._tiktokBannerShown) {
        window._tiktokBannerShown = true;
        banner.classList.add('visible');
        setTimeout(() => {
          banner.classList.remove('visible');
          localStorage.setItem('tiktokBannerSeen', '1');
        }, 5000);
      }
    }
  } else {
    siteHeader.classList.remove('visible');
    if (contactFloat) contactFloat.classList.remove('visible');
    if (tiktokFloat) tiktokFloat.classList.remove('visible');
    
    const mobileNav = document.getElementById('mobileNav');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileNav && mobileNav.classList.contains('open')) {
      mobileNav.classList.remove('open');
      mobileMenuBar.classList.remove('menu-open');
      mobileNav.scrollTop = 0;
      if (mobileMenuBtn) {
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.innerHTML = '☰ Меню';
      }
    }
  }
}

window.addEventListener('scroll', () => {
  if (scrollTimeout) {
    cancelAnimationFrame(scrollTimeout);
  }
  scrollTimeout = requestAnimationFrame(handleScroll);
}, { passive: true });

// Scroll arrows
document.addEventListener('DOMContentLoaded', () => {
  const allSections = Array.from(document.querySelectorAll('.hero, section[id]'));
  const arrowUp = document.getElementById('arrowUp');
  const arrowDown = document.getElementById('arrowDown');

  if (!arrowUp || !arrowDown) return;

  function getCurrentSectionIndex() {
    const scrollMid = window.scrollY + window.innerHeight / 2;
    let closest = 0;
    let minDist = Infinity;
    allSections.forEach((sec, i) => {
      const rect = sec.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const dist = Math.abs(top + rect.height / 2 - scrollMid);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    return closest;
  }

  function scrollToSection(index) {
    if (index < 0 || index >= allSections.length) return;
    const sec = allSections[index];
    const rect = sec.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const target = top + rect.height / 2 - window.innerHeight / 2;
    window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  }

  arrowUp.addEventListener('click', () => scrollToSection(getCurrentSectionIndex() - 1));
  arrowDown.addEventListener('click', () => scrollToSection(getCurrentSectionIndex() + 1));

  let arrowUpdateTimeout;
  function updateArrows() {
    const idx = getCurrentSectionIndex();
    arrowUp.style.display = idx === 0 ? 'none' : 'flex';
    arrowDown.style.display = idx === allSections.length - 1 ? 'none' : 'flex';
  }

  window.addEventListener('scroll', () => {
    clearTimeout(arrowUpdateTimeout);
    arrowUpdateTimeout = setTimeout(updateArrows, 100);
  }, { passive: true });
  updateArrows();
});

// Cart state — відновлюємо з localStorage якщо є
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// DOM elements
const cartBtn = document.getElementById('cartBtn');
const cartOverlay = document.getElementById('cartOverlay');
const cartDrawer = document.getElementById('cartDrawer');
const cartClose = document.getElementById('cartClose');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');

// Open/Close cart
cartBtn.addEventListener('click', () => {
  cartOverlay.classList.add('open');
  cartDrawer.classList.add('open');
});

cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

function closeCart() {
  cartOverlay.classList.remove('open');
  cartDrawer.classList.remove('open');
}

// Add to cart
function addToCart(btn) {
  const card = btn.closest('.card');
  // Беремо іконку з card-emoji (емодзі) або дефолтне 🥟 якщо є фото
  const emojiEl = card.querySelector('.card-emoji');
  const icon = emojiEl ? emojiEl.textContent.trim() : '🥟';
  const name = card.querySelector('h3').textContent;
  const priceText = card.querySelector('.price').textContent;
  
  // Перевіряємо чи є ціна (деякі товари мають "— грн/кг")
  const priceMatch = priceText.match(/\d+/);
  if (!priceMatch) {
    alert('⚠️ Ціна для цього товару ще не встановлена. Зв\'яжіться з нами для уточнення.');
    return;
  }
  const price = parseInt(priceMatch[0]);

  // Візуальний фідбек для мобільних
  btn.style.transform = 'scale(0.95)';
  setTimeout(() => btn.style.transform = '', 100);

  // Визначаємо категорію — беремо h2.cat-title з батьківської секції
  const section = card.closest('section.category');
  const category = section ? section.querySelector('.cat-title').textContent.trim() : '';

  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ icon, name, category, price, qty: 1 });
  }

  updateCardButton(card, name);
  updateCartDisplay();
}

// Update button to show quantity counter
function updateCardButton(card, itemName) {
  const item = cart.find(i => i.name === itemName);
  const footer = card.querySelector('.card-footer');
  
  if (!item) {
    // Item not in cart - show add button
    const existingCounter = footer.querySelector('.card-qty-control');
    if (existingCounter) {
      existingCounter.remove();
    }
    let addBtn = footer.querySelector('.add-btn');
    if (!addBtn) {
      addBtn = document.createElement('button');
      addBtn.className = 'add-btn';
      addBtn.textContent = '+ В кошик';
      
      // Простий onclick без touch events для уникнення конфліктів
      addBtn.onclick = function() { 
        addToCart(this); 
      };
      
      footer.appendChild(addBtn);
    }
  } else {
    // Item in cart - show counter
    let counter = footer.querySelector('.card-qty-control');
    if (!counter) {
      const addBtn = footer.querySelector('.add-btn');
      if (addBtn) addBtn.remove();
      
      counter = document.createElement('div');
      counter.className = 'card-qty-control';
      
      const minusBtn = document.createElement('button');
      minusBtn.className = 'card-qty-btn';
      minusBtn.textContent = '−';
      minusBtn.onclick = function() { 
        changeCardQty(itemName, -1); 
      };
      
      const qtySpan = document.createElement('span');
      qtySpan.className = 'card-qty-num';
      qtySpan.textContent = item.qty;
      
      const plusBtn = document.createElement('button');
      plusBtn.className = 'card-qty-btn';
      plusBtn.textContent = '+';
      plusBtn.onclick = function() { 
        changeCardQty(itemName, 1); 
      };
      
      counter.appendChild(minusBtn);
      counter.appendChild(qtySpan);
      counter.appendChild(plusBtn);
      footer.appendChild(counter);
    } else {
      counter.querySelector('.card-qty-num').textContent = item.qty;
    }
  }
}

// Change quantity from card
function changeCardQty(itemName, delta) {
  const item = cart.find(i => i.name === itemName);
  if (!item) return;
  
  item.qty += delta;
  if (item.qty <= 0) {
    const idx = cart.indexOf(item);
    cart.splice(idx, 1);
  }
  
  // Оновлюємо тільки лічильники на картках без повного перерендерингу
  const cards = document.querySelectorAll('.card');
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const cardName = card.querySelector('h3').textContent;
    if (cardName === itemName) {
      const counter = card.querySelector('.card-qty-control');
      if (counter) {
        if (item.qty <= 0) {
          // Видаляємо лічильник і показуємо кнопку
          counter.remove();
          const footer = card.querySelector('.card-footer');
          const addBtn = document.createElement('button');
          addBtn.className = 'add-btn';
          addBtn.textContent = '+ В кошик';
          addBtn.onclick = function() { addToCart(this); };
          footer.appendChild(addBtn);
        } else {
          // Просто оновлюємо число
          const qtyNum = counter.querySelector('.card-qty-num');
          if (qtyNum) qtyNum.textContent = item.qty;
        }
      }
    }
  }
  
  // Оновлюємо кошик
  updateCartDisplay();
}

// Update cart display
function updateCart() {
  updateCardButton(event.target.closest('.card'), event.target.closest('.card').querySelector('h3').textContent);
  updateCartDisplay();
}

// Оновлення відображення кошика (без оновлення кнопок на картках)
function updateCartDisplay() {
  // Зберігаємо в localStorage при кожній зміні
  localStorage.setItem('cart', JSON.stringify(cart));

  cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="cart-empty"><span>🛒</span>Кошик порожній</div>';
    cartTotal.textContent = '0 грн';
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartTotal.textContent = `${total} грн`;

  cartItems.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <div class="cart-item-icon">${item.icon}</div>
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <span>${item.category ? item.category + ' · ' : ''}${item.price} грн/кг</span>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="changeQty(${idx}, -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
      </div>
      <button class="cart-item-remove" onclick="removeItem(${idx})">✕</button>
    </div>
  `).join('');
}

// Change quantity
function changeQty(idx, delta) {
  const item = cart[idx];
  const itemName = item.name;
  
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) {
    cart.splice(idx, 1);
  }
  
  // Оновлюємо тільки кнопки на картках з цим товаром
  const cards = document.querySelectorAll('.card');
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const cardName = card.querySelector('h3').textContent;
    if (cardName === itemName) {
      updateCardButton(card, itemName);
      break; // Знайшли картку, виходимо з циклу
    }
  }
  
  updateCartDisplay();
}

// Remove item
function removeItem(idx) {
  const itemName = cart[idx].name;
  cart.splice(idx, 1);
  
  // Оновлюємо тільки кнопки на картках з цим товаром
  const cards = document.querySelectorAll('.card');
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const cardName = card.querySelector('h3').textContent;
    if (cardName === itemName) {
      updateCardButton(card, itemName);
      break; // Знайшли картку, виходимо з циклу
    }
  }
  
  updateCartDisplay();
}

// Delivery tabs
document.querySelectorAll('.dtab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.dtab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.dpanel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// Highlight active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const desktopNavLinks = document.querySelectorAll('.desktop-nav a');
const mobileNavLinks = document.querySelectorAll('.mobile-nav a');

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      // Update desktop nav
      desktopNavLinks.forEach(a => a.classList.remove('active'));
      const desktopLink = document.querySelector(`.desktop-nav a[href="#${e.target.id}"]`);
      if (desktopLink) desktopLink.classList.add('active');
      
      // Update mobile nav
      mobileNavLinks.forEach(a => a.classList.remove('active'));
      const mobileLink = document.querySelector(`.mobile-nav a[href="#${e.target.id}"]`);
      if (mobileLink) mobileLink.classList.add('active');
    }
  });
}, { threshold: 0.3, rootMargin: '-100px' });

sections.forEach(s => observer.observe(s));

// Animate hero content on load
document.addEventListener('DOMContentLoaded', () => {
  const heroItems = document.querySelectorAll('.hero-sub, .hero h1, .hero-desc, .btn');
  heroItems.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(40px)';
    el.style.transition = `opacity 1s cubic-bezier(0.22,1,0.36,1) ${0.3 + i * 0.25}s, transform 1s cubic-bezier(0.22,1,0.36,1) ${0.3 + i * 0.25}s`;
  });
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      heroItems.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  });

  // Відновлюємо кнопки на картках якщо кошик збережений
  if (cart.length > 0) {
    updateCartDisplay();
    document.querySelectorAll('.card').forEach(card => {
      const name = card.querySelector('h3').textContent;
      if (cart.find(i => i.name === name)) {
        updateCardButton(card, name);
      }
    });
  }
});

// Animate cards on scroll
const grids = document.querySelectorAll('.grid');

const cardObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const cards = entry.target.querySelectorAll('.card');
      cards.forEach((card, i) => {
        // Reduced delay for faster appearance
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 40);
      });
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05, rootMargin: '80px' });

grids.forEach(grid => {
  grid.querySelectorAll('.card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
  });
  cardObserver.observe(grid);
});

// Ingredient modal data
const ingredientData = {
  boroshno: {
    icon: '🌾',
    title: 'Борошно',
    description: 'Високоякісне пшеничне борошно вищого ґатунку — основа нашого ніжного тіста.',
    benefits: 'Забезпечує еластичність та м’якість тіста, багате на вуглеводи та рослинний білок.'
  },
  voda: {
    icon: '💧',
    title: 'Вода',
    description: 'Чиста фільтрована вода для ідеальної консистенції тіста.',
    benefits: 'Зв’язує всі інгредієнти, допомагає утворити глютенову структуру для еластичності тіста.'
  },
  moloko: {
    icon: '🥛',
    title: 'Молоко',
    description: 'Свіже натуральне молоко для ніжного смаку та аромату.',
    benefits: 'Надає тісту ніжність, золотистий колір та вершковий смак. Джерело кальцію та білка.'
  },
  yaitce: {
    icon: '🥚',
    title: 'Яйце',
    description: 'Домашні свіжі яйця від перевірених постачальників.',
    benefits: 'Збагачує тісто білком, надає міцності та еластичності. Додає поживної цінності.'
  },
  sil: {
    icon: '🧂',
    title: 'Сіль',
    description: 'Морська сіль для ідеального смаку та балансу.',
    benefits: 'Підкреслює смак, зміцнює глютенову структуру тіста, робить його більш еластичним.'
  },
  oliya: {
    icon: '🫒',
    title: 'Олія',
    description: 'Натуральна рослинна олія вищої якості.',
    benefits: 'Робить тісто м’яким та еластичним, запобігає прилипанню. Джерело корисних жирів.'
  },
  kurkuma: {
    icon: '✨',
    title: 'Куркума',
    description: 'Натуральна спеція для золотистого кольору та корисних властивостей.',
    benefits: 'Надає тісту гарний золотистий колір, має протизапальні властивості, багата на антиоксиданти.'
  }
};

// Open ingredient modal
function openIngredientModal(ingredient) {
  const data = ingredientData[ingredient];
  if (!data) return;

  const modal = document.getElementById('ingredientModal');
  const overlay = document.getElementById('ingredientModalOverlay');
  const content = document.getElementById('ingredientModalContent');

  content.innerHTML = `
    <div class="modal-icon">${data.icon}</div>
    <h3>${data.title}</h3>
    <p><strong>Опис:</strong> ${data.description}</p>
    <p><strong>Користь:</strong> ${data.benefits}</p>
  `;

  overlay.classList.add('open');
  modal.classList.add('open');
}

// Close ingredient modal
function closeIngredientModal() {
  const modal = document.getElementById('ingredientModal');
  const overlay = document.getElementById('ingredientModalOverlay');
  
  overlay.classList.remove('open');
  modal.classList.remove('open');
}

// Open/Close Other Page
function openOtherPage() {
  const overlay = document.getElementById('otherPageOverlay');
  const page = document.getElementById('otherPage');
  
  overlay.classList.add('open');
  page.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.querySelector('.scroll-arrows').style.display = 'none';
}

function closeOtherPage() {
  const overlay = document.getElementById('otherPageOverlay');
  const page = document.getElementById('otherPage');
  
  overlay.classList.remove('open');
  page.classList.remove('open');
  document.body.style.overflow = '';
  document.querySelector('.scroll-arrows').style.display = '';
}

// Open/Close About Page
function openAboutPage() {
  const overlay = document.getElementById('aboutPageOverlay');
  const page = document.getElementById('aboutPage');
  
  overlay.classList.add('open');
  page.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.querySelector('.scroll-arrows').style.display = 'none';
}

function closeAboutPage() {
  const overlay = document.getElementById('aboutPageOverlay');
  const page = document.getElementById('aboutPage');
  
  overlay.classList.remove('open');
  page.classList.remove('open');
  document.body.style.overflow = '';
  document.querySelector('.scroll-arrows').style.display = '';
}

// Close Other Page on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const deliveryPage = document.getElementById('otherPage');
    const aboutPage = document.getElementById('aboutPage');
    
    if (deliveryPage && deliveryPage.classList.contains('open')) {
      closeOtherPage();
    }
    if (aboutPage && aboutPage.classList.contains('open')) {
      closeAboutPage();
    }
  }
});

// Contact float popup
(function() {
  const btn    = document.getElementById('contactFloatBtn');
  const popup  = document.getElementById('contactPopup');
  const close  = document.getElementById('contactPopupClose');
  const badge  = document.getElementById('contactBadge');
  const toast  = document.getElementById('contactToast');
  const typing = document.getElementById('chatTyping');
  const text   = document.getElementById('chatText');

  if (!btn || !popup) return;

  let messageShown = false;
  let badgeToastShown = false;
  let badgeTimer = null;
  let toastHideTimer = null;

  // Викликається зі scroll-логіки коли кнопка вперше стає видимою
  window._showContactBadgeSoon = function() {
    if (badgeToastShown || badgeTimer) return; // вже запущено або показано
    badgeTimer = setTimeout(() => {
      if (!badgeToastShown) {
        badgeToastShown = true;
        badge.classList.add('visible');
        toast.classList.add('visible');
        toastHideTimer = setTimeout(() => {
          toast.classList.remove('visible');
        }, 3000);
      }
    }, 2000); // 2 сек після появи кнопки
  };

  function showChatMessage() {
    if (messageShown) return;
    messageShown = true;
    // Показуємо "друкує..." 1.5 сек, потім текст
    typing.style.display = 'flex';
    text.style.display = 'none';
    setTimeout(() => {
      typing.style.display = 'none';
      text.style.display = 'inline';
    }, 1500);
  }

  function openPopup() {
    // Якщо відкрили до того як з'явився бейдж/тост — скасовуємо таймери
    clearTimeout(badgeTimer);
    clearTimeout(toastHideTimer);
    badgeToastShown = true; // більше не показувати

    popup.classList.add('open');
    badge.classList.remove('visible');
    toast.classList.remove('visible');
    showChatMessage();
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (popup.classList.contains('open')) {
      popup.classList.remove('open');
    } else {
      openPopup();
    }
  });

  close.addEventListener('click', (e) => {
    e.stopPropagation();
    popup.classList.remove('open');
  });

  document.addEventListener('click', (e) => {
    if (!document.getElementById('contactFloat').contains(e.target)) {
      popup.classList.remove('open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') popup.classList.remove('open');
  });
})();


(function() {
  const btn = document.getElementById('mobileMenuBtn');
  const nav = document.getElementById('mobileNav');
  const menuBar = document.getElementById('mobileMenuBar');
  
  if (!btn || !nav || !menuBar) return;

  function openNav() {
    nav.classList.add('open');
    menuBar.classList.add('menu-open');
    btn.setAttribute('aria-expanded', 'true');
    btn.innerHTML = '✕ Закрити';
  }

  function closeNav() {
    nav.classList.remove('open');
    menuBar.classList.remove('menu-open');
    nav.scrollTop = 0;
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '☰ Меню';
  }

  btn.addEventListener('click', () => {
    if (nav.classList.contains('open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  // Close on link click
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeNav();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => { 
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      closeNav();
    }
  });
})();

// ── TIKTOK PROMO ──
(function() {
  const banner      = document.getElementById('tiktokBanner');
  const bannerClose = document.getElementById('tiktokBannerClose');
  const bannerBtn   = document.getElementById('tiktokBannerBtn');
  const tiktokBtn   = document.getElementById('tiktokBtn');

  if (!banner || !tiktokBtn) return;

  // Закрити банер вручну
  bannerClose.addEventListener('click', () => {
    banner.classList.remove('visible');
    localStorage.setItem('tiktokBannerSeen', '1');
  });

  // Кнопка "Дізнатись більше"
  bannerBtn.addEventListener('click', () => {
    banner.classList.remove('visible');
    localStorage.setItem('tiktokBannerSeen', '1');
    openTiktokPopup();
  });

  // Кнопка TikTok
  tiktokBtn.addEventListener('click', () => {
    openTiktokPopup();
  });
})();

function openTiktokPopup() {
  document.getElementById('tiktokOverlay').classList.add('open');
  document.getElementById('tiktokPopup').classList.add('open');
}

function closeTiktokPopup() {
  document.getElementById('tiktokOverlay').classList.remove('open');
  document.getElementById('tiktokPopup').classList.remove('open');
}

// ── INGREDIENT FILTER (desktop) ──
(function() {
  const toggle = document.getElementById('ingFilterToggle');
  const panel = document.getElementById('ingFilterPanel');
  const list = document.getElementById('ingFilterList');
  const resetBtn = document.getElementById('ingFilterReset');
  const countBadge = document.getElementById('ingFilterCount');
  const nav = document.getElementById('desktopNav');

  if (!toggle || !panel) return;

  // Збираємо всі інгредієнти з карток
  function extractIngredients() {
    const set = new Set();
    document.querySelectorAll('section.category .card p').forEach(p => {
      const text = p.textContent.replace(/^(Начинка|Склад):\s*/i, '');
      text.split(',').forEach(part => {
        const ing = part.trim()
          .replace(/\s*\(.*?\)/g, '')  // прибираємо дужки
          .replace(/\s+/g, ' ')
          .toLowerCase()
          .trim();
        if (ing.length > 2 && ing.length < 40) set.add(ing);
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'uk'));
  }

  let activeFilters = new Set();

  function buildChips(ingredients) {
    list.innerHTML = '';
    ingredients.forEach(ing => {
      const label = document.createElement('label');
      label.className = 'ing-filter-chip';
      label.innerHTML = `<input type="checkbox" value="${ing}"> ${ing.charAt(0).toUpperCase() + ing.slice(1)}`;
      label.querySelector('input').addEventListener('change', (e) => {
        if (e.target.checked) activeFilters.add(ing);
        else activeFilters.delete(ing);
        label.classList.toggle('active', e.target.checked);
        applyFilter();
      });
      list.appendChild(label);
    });
  }

  function applyFilter() {
    // Оновлюємо лічильник
    if (activeFilters.size > 0) {
      countBadge.textContent = activeFilters.size;
      countBadge.style.display = 'inline';
    } else {
      countBadge.style.display = 'none';
    }

    document.querySelectorAll('section.category').forEach(section => {
      let sectionHasVisible = false;
      section.querySelectorAll('.card').forEach(card => {
        if (activeFilters.size === 0) {
          card.style.display = '';
          sectionHasVisible = true;
          return;
        }
        const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
        const matches = [...activeFilters].every(f => desc.includes(f));
        card.style.display = matches ? '' : 'none';
        if (matches) sectionHasVisible = true;
      });
      // Ховаємо секцію якщо в ній немає жодного видимого товару
      section.style.display = sectionHasVisible ? '' : 'none';
    });
  }

  // Відкрити/закрити панель
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = panel.classList.toggle('open');
    const arrow = document.getElementById('ingFilterArrow');
    if (arrow) {
      arrow.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    }
    if (isOpen && list.children.length === 0) {
      buildChips(extractIngredients());
    }
  });

  // Закриваємо при кліку поза панеллю
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !panel.contains(e.target)) {
      panel.classList.remove('open');
      const arrow = document.getElementById('ingFilterArrow');
      if (arrow) {
        arrow.style.transform = 'rotate(0deg)';
      }
    }
  });

  // Скинути фільтр
  resetBtn.addEventListener('click', () => {
    activeFilters.clear();
    list.querySelectorAll('input').forEach(inp => inp.checked = false);
    list.querySelectorAll('.ing-filter-chip').forEach(c => c.classList.remove('active'));
    countBadge.style.display = 'none';
    applyFilter();
  });
})();

// ── MOBILE INGREDIENT FILTER ──
(function() {
  const toggle = document.getElementById('mobileIngFilterToggle');
  const panel = document.getElementById('mobileIngFilterPanel');
  const list = document.getElementById('mobileIngFilterList');
  const resetBtn = document.getElementById('mobileIngFilterReset');
  const countBadge = document.getElementById('mobileIngFilterCount');

  if (!toggle || !panel) return;

  // Збираємо всі інгредієнти з карток
  function extractIngredients() {
    const set = new Set();
    document.querySelectorAll('section.category .card p').forEach(p => {
      const text = p.textContent.replace(/^(Начинка|Склад):\s*/i, '');
      text.split(',').forEach(part => {
        const ing = part.trim()
          .replace(/\s*\(.*?\)/g, '')  // прибираємо дужки
          .replace(/\s+/g, ' ')
          .toLowerCase()
          .trim();
        if (ing.length > 2 && ing.length < 40) set.add(ing);
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'uk'));
  }

  let activeFilters = new Set();

  function buildChips(ingredients) {
    list.innerHTML = '';
    ingredients.forEach(ing => {
      const label = document.createElement('label');
      label.className = 'ing-filter-chip';
      label.innerHTML = `<input type="checkbox" value="${ing}"> ${ing.charAt(0).toUpperCase() + ing.slice(1)}`;
      label.querySelector('input').addEventListener('change', (e) => {
        if (e.target.checked) activeFilters.add(ing);
        else activeFilters.delete(ing);
        label.classList.toggle('active', e.target.checked);
        applyFilter();
      });
      list.appendChild(label);
    });
  }

  function applyFilter() {
    // Оновлюємо лічильник
    if (activeFilters.size > 0) {
      countBadge.textContent = activeFilters.size;
      countBadge.style.display = 'inline-flex';
    } else {
      countBadge.style.display = 'none';
    }

    document.querySelectorAll('section.category').forEach(section => {
      let sectionHasVisible = false;
      section.querySelectorAll('.card').forEach(card => {
        if (activeFilters.size === 0) {
          card.style.display = '';
          sectionHasVisible = true;
          return;
        }
        const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
        const matches = [...activeFilters].every(f => desc.includes(f));
        card.style.display = matches ? '' : 'none';
        if (matches) sectionHasVisible = true;
      });
      section.style.display = sectionHasVisible ? '' : 'none';
    });
  }

  // Відкрити/закрити панель
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = panel.classList.toggle('open');
    const arrow = document.getElementById('mobileIngFilterArrow');
    if (arrow) {
      arrow.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    }
    if (isOpen && list.children.length === 0) {
      buildChips(extractIngredients());
    }
  });

  // Закрити панель при кліку поза нею
  document.addEventListener('click', (e) => {
    const mobileNav = document.getElementById('mobileNav');
    if (mobileNav && !mobileNav.contains(e.target) && panel.classList.contains('open')) {
      panel.classList.remove('open');
      const arrow = document.getElementById('mobileIngFilterArrow');
      if (arrow) {
        arrow.style.transform = 'rotate(0deg)';
      }
    }
  });

  // Закрити панель при закритті мобільного меню
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const mobileNav = document.getElementById('mobileNav');
      if (mobileNav && !mobileNav.classList.contains('open') && panel.classList.contains('open')) {
        panel.classList.remove('open');
        const arrow = document.getElementById('mobileIngFilterArrow');
        if (arrow) {
          arrow.style.transform = 'rotate(0deg)';
        }
      }
    });
  }

  // Скинути фільтр
  resetBtn.addEventListener('click', () => {
    activeFilters.clear();
    list.querySelectorAll('input').forEach(inp => inp.checked = false);
    list.querySelectorAll('.ing-filter-chip').forEach(c => c.classList.remove('active'));
    countBadge.style.display = 'none';
    applyFilter();
  });
})();

// ── LAZY LOAD BACKGROUND IMAGES ──
// Load heavy background images after page is ready
window.addEventListener('load', () => {
  // Small delay to ensure critical content is rendered first
  setTimeout(() => {
    // Load body background
    document.body.classList.add('bg-loaded');
    
    // Load hero background
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.classList.add('bg-loaded');
    }
  }, 100);
});

// ── SEARCH ──
(function() {
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');

  if (!searchInput) return;

  // Зберігаємо оригінальний порядок секцій
  const allSections = Array.from(document.querySelectorAll('section.category'));

  // Контейнер для результатів пошуку
  let searchResultsSection = null;

  const SEARCH_PAGE_SIZE = 8;
  let searchCurrentPage = 1;
  let searchMatched = [];
  let searchQuery = '';

  function createSearchResultsSection() {
    if (searchResultsSection) return;
    searchResultsSection = document.createElement('section');
    searchResultsSection.id = 'search-results';
    searchResultsSection.className = 'category section-bg';
    searchResultsSection.innerHTML = `
      <div class="container">
        <h2 class="cat-title" id="searchResultsTitle">Результати пошуку</h2>
        <div class="grid" id="searchResultsGrid"></div>
        <div id="searchPagination" style="display:flex;justify-content:center;align-items:center;gap:.5rem;margin-top:1.5rem;flex-wrap:wrap"></div>
      </div>
    `;
    searchResultsSection.style.display = 'none';
    document.getElementById('menu').prepend(searchResultsSection);
  }

  function normalizeText(str) {
    return str.toLowerCase()
      .replace(/['`']/g, '')
      .trim();
  }

  function renderSearchPage(page) {
    searchCurrentPage = page;
    const grid = document.getElementById('searchResultsGrid');
    const pagination = document.getElementById('searchPagination');
    const title = document.getElementById('searchResultsTitle');
    const totalPages = Math.ceil(searchMatched.length / SEARCH_PAGE_SIZE);

    grid.innerHTML = '';

    if (searchMatched.length === 0) {
      grid.innerHTML = `<p style="color:var(--muted);font-size:1rem;padding:1rem 0;grid-column:1/-1">Нічого не знайдено за запитом «${searchQuery}»</p>`;
      pagination.style.display = 'none';
    } else {
      const start = (page - 1) * SEARCH_PAGE_SIZE;
      const end = Math.min(start + SEARCH_PAGE_SIZE, searchMatched.length);
      const pageCards = searchMatched.slice(start, end);

      pageCards.forEach(cardClone => {
        // Відновлюємо обробники кнопок
        const addBtn = cardClone.querySelector('.add-btn');
        if (addBtn) {
          addBtn.onclick = function() { addToCart(this); };
        }
        const qtyBtns = cardClone.querySelectorAll('.card-qty-btn');
        qtyBtns.forEach(btn => {
          const itemName = cardClone.querySelector('h3')?.textContent;
          if (btn.textContent === '−') btn.onclick = () => changeCardQty(itemName, -1);
          if (btn.textContent === '+') btn.onclick = () => changeCardQty(itemName, 1);
        });
        // Підсвічуємо збіг у назві
        const h3 = cardClone.querySelector('h3');
        if (h3) {
          const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
          h3.innerHTML = h3.textContent.replace(regex, '<mark style="background:rgba(201,168,76,0.35);border-radius:3px;padding:0 2px">$1</mark>');
        }
        // Скидаємо анімацію появи — картки одразу видимі
        cardClone.style.opacity = '1';
        cardClone.style.transform = 'none';
        cardClone.style.transition = 'none';
        grid.appendChild(cardClone);
      });

      // Пагінація
      if (totalPages > 1) {
        pagination.style.display = 'flex';
        pagination.innerHTML = '';

        // Кнопка «назад»
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '←';
        prevBtn.disabled = page === 1;
        prevBtn.style.cssText = `padding:.4rem .8rem;border-radius:8px;border:1px solid var(--gold);background:${page === 1 ? 'transparent' : 'var(--gold)'};color:${page === 1 ? 'var(--muted)' : 'var(--brown)'};font-weight:600;cursor:${page === 1 ? 'default' : 'pointer'};opacity:${page === 1 ? '.4' : '1'}`;
        prevBtn.onclick = () => { renderSearchPage(page - 1); searchResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
        pagination.appendChild(prevBtn);

        // Номери сторінок
        for (let i = 1; i <= totalPages; i++) {
          const btn = document.createElement('button');
          btn.textContent = i;
          const isActive = i === page;
          btn.style.cssText = `padding:.4rem .75rem;border-radius:8px;border:1px solid var(--gold);background:${isActive ? 'var(--brown)' : 'transparent'};color:${isActive ? '#fff' : 'var(--brown)'};font-weight:600;cursor:${isActive ? 'default' : 'pointer'}`;
          if (!isActive) btn.onclick = () => { renderSearchPage(i); searchResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
          pagination.appendChild(btn);
        }

        // Кнопка «вперед»
        const nextBtn = document.createElement('button');
        nextBtn.textContent = '→';
        nextBtn.disabled = page === totalPages;
        nextBtn.style.cssText = `padding:.4rem .8rem;border-radius:8px;border:1px solid var(--gold);background:${page === totalPages ? 'transparent' : 'var(--gold)'};color:${page === totalPages ? 'var(--muted)' : 'var(--brown)'};font-weight:600;cursor:${page === totalPages ? 'default' : 'pointer'};opacity:${page === totalPages ? '.4' : '1'}`;
        nextBtn.onclick = () => { renderSearchPage(page + 1); searchResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
        pagination.appendChild(nextBtn);
      } else {
        pagination.style.display = 'none';
      }
    }

    title.textContent = searchMatched.length > 0
      ? `Результати пошуку: «${searchQuery}» (${searchMatched.length})`
      : `Результати пошуку: «${searchQuery}»`;
  }

  function performSearch(query) {
    const q = normalizeText(query);

    if (!q) {
      clearSearch();
      return;
    }

    createSearchResultsSection();

    searchQuery = query;
    searchMatched = [];

    // Збираємо всі картки ЗАРАЗ, поки секції видимі
    const allCards = document.querySelectorAll('.card');
    
    allCards.forEach(card => {
      const name = normalizeText(card.querySelector('h3')?.textContent || '');
      const desc = normalizeText(card.querySelector('p')?.textContent || '');
      const section = card.closest('section.category');
      const category = normalizeText(section?.querySelector('.cat-title')?.textContent || '');

      if (name.includes(q) || desc.includes(q) || category.includes(q)) {
        // Клонуємо глибоко
        const clone = card.cloneNode(true);
        searchMatched.push(clone);
      }
    });

    // СПОЧАТКУ рендеримо
    renderSearchPage(1);

    // ПОТІМ ховаємо секції
    allSections.forEach(s => s.style.display = 'none');
    searchResultsSection.style.display = 'block';

    // Скролимо до результатів
    setTimeout(() => {
      searchResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    // Показуємо кнопку очищення
    searchClear.style.display = 'block';
  }

  function clearSearch() {
    searchInput.value = '';
    searchClear.style.display = 'none';

    // Відновлюємо всі секції
    allSections.forEach(s => s.style.display = '');

    // Ховаємо результати
    if (searchResultsSection) {
      searchResultsSection.style.display = 'none';
    }
  }

  // Debounce — не шукаємо при кожному символі, а з затримкою 300мс
  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const val = searchInput.value.trim();
    if (val) {
      searchClear.style.display = 'block';
      debounceTimer = setTimeout(() => performSearch(val), 300);
    } else {
      clearSearch();
    }
  });

  // Enter — миттєвий пошук
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      clearTimeout(debounceTimer);
      const val = searchInput.value.trim();
      if (val) performSearch(val);
    }
    if (e.key === 'Escape') {
      clearSearch();
      searchInput.blur();
    }
  });

  // Кнопка очищення
  searchClear.addEventListener('click', () => {
    clearSearch();
    searchInput.focus();
  });
})();

// ── MOBILE SEARCH ──
(function() {
  const mobileSearchBtn = document.getElementById('mobileSearchBtn');
  const mobileSearchModal = document.getElementById('mobileSearchModal');
  const mobileSearchOverlay = document.getElementById('mobileSearchOverlay');
  const mobileSearchClose = document.getElementById('mobileSearchClose');
  const mobileSearchInput = document.getElementById('mobileSearchInput');
  const mobileSearchClear = document.getElementById('mobileSearchClear');
  const mobileSearchBody = document.getElementById('mobileSearchBody');

  if (!mobileSearchBtn) return;

  const MOBILE_PAGE_SIZE = 8;
  let mobileMatched = [];
  let mobileQuery = '';
  let mobileCurrentPage = 1;

  function openMobileSearch() {
    mobileSearchModal.classList.add('open');
    mobileSearchOverlay.classList.add('open');
    setTimeout(() => mobileSearchInput.focus(), 100);
    document.body.style.overflow = 'hidden';
  }

  function closeMobileSearch() {
    mobileSearchModal.classList.remove('open');
    mobileSearchOverlay.classList.remove('open');
    mobileSearchInput.value = '';
    mobileSearchClear.style.display = 'none';
    mobileSearchBody.innerHTML = '<p class="mobile-search-hint">Введіть назву товару або інгредієнт</p>';
    mobileMatched = [];
    mobileQuery = '';
    document.body.style.overflow = '';
  }

  function normalizeText(str) {
    return str.toLowerCase().replace(/['`']/g, '').trim();
  }

  function renderMobilePage(page) {
    mobileCurrentPage = page;
    const totalPages = Math.ceil(mobileMatched.length / MOBILE_PAGE_SIZE);
    const start = (page - 1) * MOBILE_PAGE_SIZE;
    const end = Math.min(start + MOBILE_PAGE_SIZE, mobileMatched.length);
    const pageCards = mobileMatched.slice(start, end);

    let html = `<p class="mobile-search-title">Знайдено: ${mobileMatched.length} позицій</p>`;
    html += `<div class="mobile-search-grid" id="mobileSearchGrid"></div>`;

    // Пагінація
    if (totalPages > 1) {
      html += `<div class="mobile-search-pagination" id="mobileSearchPagination"></div>`;
    }

    mobileSearchBody.innerHTML = html;

    const grid = document.getElementById('mobileSearchGrid');

    pageCards.forEach(clone => {
      const addBtn = clone.querySelector('.add-btn');
      if (addBtn) addBtn.onclick = function() { addToCart(this); };
      const qtyBtns = clone.querySelectorAll('.card-qty-btn');
      qtyBtns.forEach(btn => {
        const itemName = clone.querySelector('h3')?.textContent;
        if (btn.textContent === '−') btn.onclick = () => changeCardQty(itemName, -1);
        if (btn.textContent === '+') btn.onclick = () => changeCardQty(itemName, 1);
      });
      // Підсвічуємо збіг
      const h3 = clone.querySelector('h3');
      if (h3) {
        const regex = new RegExp(`(${mobileQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        h3.innerHTML = h3.textContent.replace(regex, '<mark style="background:rgba(201,168,76,0.35);border-radius:3px;padding:0 2px">$1</mark>');
      }
      // Скидаємо анімацію
      clone.style.opacity = '1';
      clone.style.transform = 'none';
      clone.style.transition = 'none';
      grid.appendChild(clone);
    });

    // Рендеримо пагінацію
    if (totalPages > 1) {
      const pag = document.getElementById('mobileSearchPagination');

      const prevBtn = document.createElement('button');
      prevBtn.textContent = '←';
      prevBtn.disabled = page === 1;
      prevBtn.style.cssText = `padding:.4rem .8rem;border-radius:8px;border:1px solid var(--gold);background:${page===1?'transparent':'var(--gold)'};color:${page===1?'var(--muted)':'var(--brown)'};font-weight:600;opacity:${page===1?'.4':'1'}`;
      prevBtn.onclick = () => { renderMobilePage(page - 1); mobileSearchBody.scrollTop = 0; };
      pag.appendChild(prevBtn);

      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        const isActive = i === page;
        btn.style.cssText = `padding:.4rem .75rem;border-radius:8px;border:1px solid var(--gold);background:${isActive?'var(--brown)':'transparent'};color:${isActive?'#fff':'var(--brown)'};font-weight:600`;
        if (!isActive) btn.onclick = () => { renderMobilePage(i); mobileSearchBody.scrollTop = 0; };
        pag.appendChild(btn);
      }

      const nextBtn = document.createElement('button');
      nextBtn.textContent = '→';
      nextBtn.disabled = page === totalPages;
      nextBtn.style.cssText = `padding:.4rem .8rem;border-radius:8px;border:1px solid var(--gold);background:${page===totalPages?'transparent':'var(--gold)'};color:${page===totalPages?'var(--muted)':'var(--brown)'};font-weight:600;opacity:${page===totalPages?'.4':'1'}`;
      nextBtn.onclick = () => { renderMobilePage(page + 1); mobileSearchBody.scrollTop = 0; };
      pag.appendChild(nextBtn);
    }
  }

  function performMobileSearch(query) {
    const q = normalizeText(query);
    if (!q) {
      mobileSearchBody.innerHTML = '<p class="mobile-search-hint">Введіть назву товару або інгредієнт</p>';
      mobileMatched = [];
      return;
    }

    mobileQuery = query;
    mobileMatched = [];

    document.querySelectorAll('section.category .card').forEach(card => {
      const name = normalizeText(card.querySelector('h3')?.textContent || '');
      const desc = normalizeText(card.querySelector('p')?.textContent || '');
      const section = card.closest('section.category');
      const category = normalizeText(section?.querySelector('.cat-title')?.textContent || '');

      if (name.includes(q) || desc.includes(q) || category.includes(q)) {
        const clone = card.cloneNode(true);
        mobileMatched.push(clone);
      }
    });

    if (mobileMatched.length === 0) {
      mobileSearchBody.innerHTML = `<p class="mobile-search-hint">Нічого не знайдено за запитом «${query}»</p>`;
      return;
    }

    renderMobilePage(1);
  }

  mobileSearchBtn.addEventListener('click', openMobileSearch);
  mobileSearchClose.addEventListener('click', closeMobileSearch);
  mobileSearchOverlay.addEventListener('click', closeMobileSearch);

  mobileSearchClear.addEventListener('click', () => {
    mobileSearchInput.value = '';
    mobileSearchClear.style.display = 'none';
    mobileSearchBody.innerHTML = '<p class="mobile-search-hint">Введіть назву товару або інгредієнт</p>';
    mobileMatched = [];
    mobileSearchInput.focus();
  });

  let debounceTimer;
  mobileSearchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const val = mobileSearchInput.value.trim();
    mobileSearchClear.style.display = val ? 'block' : 'none';
    debounceTimer = setTimeout(() => performMobileSearch(val), 300);
  });

  mobileSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      clearTimeout(debounceTimer);
      performMobileSearch(mobileSearchInput.value.trim());
    }
    if (e.key === 'Escape') closeMobileSearch();
  });
})();
