import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://gqcvoqemwsaptfcztani.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FOdYR9QBjHAQAhh52WuM6A_N4mWCfUJ';
const ORDER_EMAIL = 'YOUR-EMAIL@example.com';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
let products = [];
let cart = [];
let currentUser = null;
let currentRole = 'customer';
const money = value => `$${Number(value).toFixed(2)}`;
const message = text => { document.querySelector('#account-message').textContent = text; };

async function loadSession() {
    const { data: { session } } = await supabase.auth.getSession();
    await setUser(session?.user || null);
    supabase.auth.onAuthStateChange((_event, nextSession) => setUser(nextSession?.user || null));
}
async function setUser(user) {
    currentUser = user;
    currentRole = 'customer';
    if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
        currentRole = data?.role || 'customer';
        const { data: saved } = await supabase.from('carts').select('items').eq('user_id', user.id).maybeSingle();
        cart = saved?.items || [];
    } else cart = [];
    renderAccount();
    renderCart();
}
async function saveCart() {
    if (!currentUser) return;
    await supabase.from('carts').upsert({ user_id: currentUser.id, items: cart, updated_at: new Date().toISOString() });
}
async function loadProducts() {
    const { data, error } = await supabase.from('products').select('*').order('id');
    if (error) document.querySelector('#product-grid').innerHTML = '<p class="empty-state">The shop database needs to be set up. Run supabase-schema.sql in Supabase first.</p>';
    products = data || [];
    renderProducts();
    renderInventory();
}
function renderProducts() {
    document.querySelector('#product-grid').innerHTML = products.map(product => `<article class="product-card"><div class="product-art ${product.color}"><span>3D<br>PRINT</span><i></i></div><div class="product-info"><div class="product-topline"><h3>${product.name}</h3><strong>${money(product.price)}</strong></div><p>${product.description}</p><div class="product-bottom"><small>${product.stock > 0 ? `${product.stock} available` : 'Sold out'}</small><button class="add-button" data-add="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>${product.stock > 0 ? 'Add to cart' : 'Sold out'}</button></div></div></article>`).join('') || '<p class="empty-state">The printer is warming up. Add products from the owner account.</p>';
    document.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => addToCart(Number(button.dataset.add))));
}
function renderCart() {
    const items = cart.map(item => ({ ...item, product: products.find(product => product.id === item.id) })).filter(item => item.product);
    document.querySelector('#cart-count').textContent = items.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector('#cart-total').textContent = money(items.reduce((sum, item) => sum + item.product.price * item.quantity, 0));
    document.querySelector('#cart-items').innerHTML = items.length ? items.map(item => `<div class="cart-item"><div><strong>${item.product.name}</strong><small>${money(item.product.price)} each</small></div><div class="quantity"><button data-change="${item.id}" data-amount="-1" aria-label="Remove one">&#8722;</button><span>${item.quantity}</span><button data-change="${item.id}" data-amount="1" aria-label="Add one">+</button></div></div>`).join('') : '<p class="empty-state">Your cart is waiting for something excellent.</p>';
    document.querySelectorAll('[data-change]').forEach(button => button.addEventListener('click', () => changeQuantity(Number(button.dataset.change), Number(button.dataset.amount))));
}
function renderInventory() {
    document.querySelector('#inventory-list').innerHTML = currentRole === 'owner' ? products.map(product => `<div class="inventory-row"><span>${product.name}</span><label>Stock <input data-stock="${product.id}" type="number" min="0" value="${product.stock}"></label><button class="delete-button" data-delete="${product.id}" type="button">Delete</button></div>`).join('') : '';
    document.querySelectorAll('[data-stock]').forEach(input => input.addEventListener('change', async event => { const product = products.find(item => item.id === Number(event.target.dataset.stock)); product.stock = Math.max(0, Number(event.target.value)); await supabase.from('products').update({ stock: product.stock }).eq('id', product.id); renderProducts(); }));
    document.querySelectorAll('[data-delete]').forEach(button => button.addEventListener('click', async () => { const id = Number(button.dataset.delete); await supabase.from('products').delete().eq('id', id); products = products.filter(product => product.id !== id); cart = cart.filter(item => item.id !== id); renderProducts(); renderInventory(); renderCart(); await saveCart(); }));
}
function renderAccount() {
    const signedIn = Boolean(currentUser);
    document.querySelector('#account-signed-out').hidden = signedIn;
    document.querySelector('#account-signed-in').hidden = !signedIn;
    document.querySelector('#account-button').textContent = signedIn ? currentUser.email.split('@')[0] : 'Account';
    document.querySelector('#inventory-toggle').hidden = !signedIn || currentRole !== 'owner';
    if (signedIn) { document.querySelector('#account-name').textContent = currentUser.email; document.querySelector('#account-role').textContent = currentRole === 'owner' ? 'Owner account: inventory tools are unlocked.' : 'Customer account: your cart is saved online.'; }
}
async function addToCart(id) { const product = products.find(item => item.id === id); const item = cart.find(entry => entry.id === id); if (!product || (item && item.quantity >= product.stock)) return; item ? item.quantity++ : cart.push({ id, quantity: 1 }); renderCart(); await saveCart(); openCart(); }
async function changeQuantity(id, amount) { const item = cart.find(entry => entry.id === id); const product = products.find(entry => entry.id === id); if (!item) return; item.quantity += amount; if (item.quantity <= 0) cart = cart.filter(entry => entry.id !== id); if (product && item.quantity > product.stock) item.quantity = product.stock; renderCart(); await saveCart(); }
function openCart() { document.querySelector('#cart-drawer').classList.add('open'); document.querySelector('#cart-drawer').setAttribute('aria-hidden', 'false'); document.querySelector('#overlay').hidden = false; }
function closeCart() { document.querySelector('#cart-drawer').classList.remove('open'); document.querySelector('#cart-drawer').setAttribute('aria-hidden', 'true'); document.querySelector('#overlay').hidden = true; }

document.querySelector('#cart-button').addEventListener('click', openCart);
document.querySelector('#cart-close').addEventListener('click', closeCart);
document.querySelector('#overlay').addEventListener('click', closeCart);
document.querySelector('#account-button').addEventListener('click', () => { renderAccount(); document.querySelector('#account-dialog').showModal(); });
document.querySelector('#account-close').addEventListener('click', () => document.querySelector('#account-dialog').close());
document.querySelector('#inventory-toggle').addEventListener('click', () => { if (currentRole !== 'owner') return; document.querySelector('#inventory-panel').hidden = false; renderInventory(); });
document.querySelector('#inventory-close').addEventListener('click', () => { document.querySelector('#inventory-panel').hidden = true; });
document.querySelector('#product-form').addEventListener('submit', async event => { event.preventDefault(); if (currentRole !== 'owner') return; const product = { name: document.querySelector('#product-name').value, price: Number(document.querySelector('#product-price').value), stock: Number(document.querySelector('#product-stock').value), color: document.querySelector('#product-color').value, description: 'A fresh print from the Preston studio.' }; const { data } = await supabase.from('products').insert(product).select().single(); if (data) products.push(data); event.target.reset(); renderProducts(); renderInventory(); });
document.querySelector('#customer-form').addEventListener('submit', async event => { event.preventDefault(); const email = document.querySelector('#customer-account-email').value.trim().toLowerCase(); const password = document.querySelector('#customer-account-password').value; const { error } = await supabase.auth.signUp({ email, password }); if (error) { message(error.message); return; } message('Check your email to confirm your account, then sign in.'); });
document.querySelector('#login-form').addEventListener('submit', async event => { event.preventDefault(); const email = document.querySelector('#login-email').value.trim().toLowerCase(); const password = document.querySelector('#login-password').value; const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) message(error.message); else document.querySelector('#account-dialog').close(); });
document.querySelector('#sign-out').addEventListener('click', async () => { await supabase.auth.signOut(); document.querySelector('#account-dialog').close(); });
document.querySelector('#checkout-button').addEventListener('click', () => { if (cart.length) document.querySelector('#checkout-dialog').showModal(); });
document.querySelector('#checkout-close').addEventListener('click', () => document.querySelector('#checkout-dialog').close());
document.querySelector('#checkout-form').addEventListener('submit', event => { event.preventDefault(); const name = document.querySelector('#customer-name').value; const email = document.querySelector('#customer-email').value; const notes = document.querySelector('#customer-notes').value; const lines = cart.map(item => { const product = products.find(entry => entry.id === item.id); return `${item.quantity} x ${product.name} (${money(product.price * item.quantity)})`; }).join('%0D%0A'); const total = cart.reduce((sum, item) => sum + products.find(product => product.id === item.id).price * item.quantity, 0); window.location.href = `mailto:${ORDER_EMAIL}?subject=New Preston Prints order&body=Name: ${encodeURIComponent(name)}%0D%0AEmail: ${encodeURIComponent(email)}%0D%0A%0D%0A${lines}%0D%0A%0D%0ATotal: ${money(total)}%0D%0ANotes: ${encodeURIComponent(notes)}`; });

await loadProducts();
await loadSession();