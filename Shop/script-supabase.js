import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://gqcvoqemwsaptfcztani.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FOdYR9QBjHAQAhh52WuM6A_N4mWCfUJ';
const ORDER_EMAIL = 'chez.it.kid.2000@gmail.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let products = [];
let cart = [];
let currentUser = null;
let currentRole = 'customer';

const money = value => `$${Number(value).toFixed(2)}`;

const message = text => {
    document.querySelector('#account-message').textContent = text;
};

async function loadSession() {
    const { data: { session } } = await supabase.auth.getSession();

    await setUser(session?.user || null);

    supabase.auth.onAuthStateChange(
        (_event, nextSession) => setUser(nextSession?.user || null)
    );
}

async function setUser(user) {
    currentUser = user;
    currentRole = 'customer';

    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        currentRole = data?.role || 'customer';

        const { data: saved } = await supabase
            .from('carts')
            .select('items')
            .eq('user_id', user.id)
            .maybeSingle();

        cart = saved?.items || [];
    } else {
        cart = [];
    }

    renderAccount();
    renderCart();
}

async function saveCart() {
    if (!currentUser) return;

    await supabase
        .from('carts')
        .upsert({
            user_id: currentUser.id,
            items: cart,
            updated_at: new Date().toISOString()
        });
}

async function loadProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id');

    if (error) {
        document.querySelector('#product-grid').innerHTML =
            '<p class="empty-state">The shop database needs to be set up. Run supabase-schema.sql in Supabase first.</p>';
    }

    products = data || [];

    renderProducts();
    renderInventory();
}

function renderProducts() {
    document.querySelector('#product-grid').innerHTML = products
        .map(product => `<article class="product-card"><div class="product-art ${product.color}">${product.image_url ? `<img src="${product.image_url}" alt="${product.name}">` : '<span>3D<br>PRINT</span><i></i>'}</div><div class="product-info"><div class="product-topline"><h3>${product.name}</h3><strong>${money(product.price)}</strong></div><p>${product.description}</p><div class="product-bottom"><small>${product.stock > 0 ? `${product.stock} available` : 'Sold out'}</small><button class="add-button" data-add="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>${product.stock > 0 ? 'Add to cart' : 'Sold out'}</button></div></div></article>`)
        .join('') || '<p class="empty-state">The printer is warming up. Add products from the owner account.</p>';

    document
        .querySelectorAll('[data-add]')
        .forEach(button =>
            button.addEventListener(
                'click',
                () => addToCart(Number(button.dataset.add))
            )
        );
}

function renderCart() {
    const items = cart
        .map(item => ({
            ...item,
            product: products.find(product => product.id === item.id)
        }))
        .filter(item => item.product);

    document.querySelector('#cart-count').textContent =
        items.reduce((sum, item) => sum + item.quantity, 0);

    document.querySelector('#cart-total').textContent =
        money(
            items.reduce(
                (sum, item) =>
                    sum + item.product.price * item.quantity,
                0
            )
        );

    document.querySelector('#cart-items').innerHTML =
        items.length
            ? items
                  .map(item => `<div class="cart-item"><div><strong>${item.product.name}</strong><small>${money(item.product.price)} each</small></div><div class="quantity"><button data-change="${item.id}" data-amount="-1" aria-label="Remove one">&#8722;</button><span>${item.quantity}</span><button data-change="${item.id}" data-amount="1" aria-label="Add one">+</button></div></div>`)
                  .join('')
            : '<p class="empty-state">Your cart is waiting for something excellent.</p>';

    document
        .querySelectorAll('[data-change]')
        .forEach(button =>
            button.addEventListener(
                'click',
                () =>
                    changeQuantity(
                        Number(button.dataset.change),
                        Number(button.dataset.amount)
                    )
            )
        );
}

function renderInventory() {
    document.querySelector('#inventory-list').innerHTML =
        currentRole === 'owner'
            ? products
                  .map(product => `<div class="inventory-row"><span>${product.name}</span><label>Stock <input data-stock="${product.id}" type="number" min="0" value="${product.stock}"></label><div class="give-stock"><label>Give Kelsey <input data-give-amount="${product.id}" type="number" min="1" max="${product.stock}" value="${product.stock ? 1 : 0}" ${product.stock ? '' : 'disabled'}></label><button class="give-button" data-give="${product.id}" type="button" ${product.stock ? '' : 'disabled'}>Give stock</button><button class="all-button" data-give-all="${product.id}" type="button" ${product.stock ? '' : 'disabled'}>All</button></div><button class="delete-button" data-delete="${product.id}" type="button">Delete</button></div>`)
                  .join('')
            : '';

    document
        .querySelectorAll('[data-stock]')
        .forEach(input =>
            input.addEventListener(
                'change',
                async event => {
                    const product = products.find(
                        item =>
                            item.id ===
                            Number(event.target.dataset.stock)
                    );

                    product.stock = Math.max(
                        0,
                        Number(event.target.value)
                    );

                    await supabase
                        .from('products')
                        .update({ stock: product.stock })
                        .eq('id', product.id);

                    renderProducts();
                }
            )
        );

    document
        .querySelectorAll('[data-give-all]')
        .forEach(button =>
            button.addEventListener(
                'click',
                () => {
                    const input = document.querySelector(
                        `[data-give-amount="${button.dataset.giveAll}"]`
                    );

                    input.value = input.max;
                }
            )
        );

    document
        .querySelectorAll('[data-give]')
        .forEach(button =>
            button.addEventListener(
                'click',
                async () => {
                    const product = products.find(
                        item =>
                            item.id ===
                            Number(button.dataset.give)
                    );

                    const input = document.querySelector(
                        `[data-give-amount="${button.dataset.give}"]`
                    );

                    const amount =
                        Math.floor(Number(input.value));

                    if (
                        !product ||
                        amount < 1 ||
                        amount > product.stock
                    ) {
                        return;
                    }

                    if (
                        !confirm(
                            `Give ${amount} ${product.name} to Kelsey and remove it from stock?`
                        )
                    ) {
                        return;
                    }

                    const newStock =
                        product.stock - amount;

                    const { error } =
                        await supabase
                            .from('products')
                            .update({
                                stock: newStock
                            })
                            .eq('id', product.id);

                    if (error) {
                        alert(
                            `Stock could not be updated: ${error.message}`
                        );
                        return;
                    }

                    product.stock = newStock;

                    renderProducts();
                    renderInventory();
                }
            )
        );

    document
        .querySelectorAll('[data-delete]')
        .forEach(button =>
            button.addEventListener(
                'click',
                async () => {
                    const id = Number(button.dataset.delete);

                    await supabase
                        .from('products')
                        .delete()
                        .eq('id', id);

                    products = products.filter(
                        product => product.id !== id
                    );

                    cart = cart.filter(
                        item => item.id !== id
                    );

                    renderProducts();
                    renderInventory();
                    renderCart();

                    await saveCart();
                }
            )
        );
}

function renderAccount() {
    const signedIn = Boolean(currentUser);

    document.querySelector('#account-signed-out').hidden =
        signedIn;

    document.querySelector('#account-signed-in').hidden =
        !signedIn;

    document.querySelector('#account-button').textContent =
        signedIn
            ? currentUser.email.split('@')[0]
            : 'Account';

    document.querySelector('#inventory-toggle').hidden =
        !signedIn || currentRole !== 'owner';

    document.querySelector('#test-order-panel').hidden =
        !signedIn || currentRole !== 'owner';

    if (signedIn) {
        document.querySelector('#account-name').textContent =
            currentUser.email;

        document.querySelector('#account-role').textContent =
            currentRole === 'owner'
                ? 'Owner account: inventory tools are unlocked.'
                : 'Customer account: your cart is saved online.';
    }
}

async function addToCart(id) {
    const product = products.find(
        item => item.id === id
    );

    const item = cart.find(
        entry => entry.id === id
    );

    if (
        !product ||
        (item && item.quantity >= product.stock)
    ) {
        return;
    }

    item
        ? item.quantity++
        : cart.push({
              id,
              quantity: 1
          });

    renderCart();

    await saveCart();

    openCart();
}

async function changeQuantity(id, amount) {
    const item = cart.find(
        entry => entry.id === id
    );

    const product = products.find(
        entry => entry.id === id
    );

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        cart = cart.filter(
            entry => entry.id !== id
        );
    }

    if (
        product &&
        item.quantity > product.stock
    ) {
        item.quantity = product.stock;
    }

    renderCart();

    await saveCart();
}

function openCart() {
    document
        .querySelector('#cart-drawer')
        .classList.add('open');

    document
        .querySelector('#cart-drawer')
        .setAttribute(
            'aria-hidden',
            'false'
        );

    document.querySelector('#overlay').hidden =
        false;
}

function closeCart() {
    document
        .querySelector('#cart-drawer')
        .classList.remove('open');

    document
        .querySelector('#cart-drawer')
        .setAttribute(
            'aria-hidden',
            'true'
        );

    document.querySelector('#overlay').hidden =
        true;
}

document
    .querySelector('#cart-button')
    .addEventListener(
        'click',
        openCart
    );

document
    .querySelector('#cart-close')
    .addEventListener(
        'click',
        closeCart
    );

document
    .querySelector('#overlay')
    .addEventListener(
        'click',
        closeCart
    );

document
    .querySelector('#account-button')
    .addEventListener(
        'click',
        () => {
            renderAccount();

            document
                .querySelector('#account-dialog')
                .showModal();
        }
    );

document
    .querySelector('#account-close')
    .addEventListener(
        'click',
        () =>
            document
                .querySelector('#account-dialog')
                .close()
    );

document
    .querySelector('#inventory-toggle')
    .addEventListener(
        'click',
        () => {
            if (currentRole !== 'owner') return;

            document
                .querySelector('#inventory-panel')
                .hidden = false;

            renderInventory();
        }
    );

document
    .querySelector('#inventory-close')
    .addEventListener(
        'click',
        () => {
            document
                .querySelector('#inventory-panel')
                .hidden = true;
        }
    );

document
    .querySelector('#product-form')
    .addEventListener(
        'submit',
        async event => {
            event.preventDefault();

            if (currentRole !== 'owner') return;

            const image =
                document
                    .querySelector('#product-image')
                    .files[0];

            let imageUrl = null;

            if (image) {
                if (
                    !image.type.startsWith('image/')
                ) {
                    alert(
                        'Please choose a PNG, JPG, or WEBP image.'
                    );
                    return;
                }

                const safeName =
                    image.name
                        .replace(
                            /[^a-z0-9.-]/gi,
                            '-'
                        )
                        .toLowerCase();

                const id =
                    crypto.randomUUID
                        ? crypto.randomUUID()
                        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

                const path =
                    `${id}-${safeName}`;

                const upload =
                    await supabase.storage
                        .from('product-images')
                        .upload(
                            path,
                            image,
                            {
                                upsert: false,
                                contentType: image.type
                            }
                        );

                if (upload.error) {
                    alert(
                        `Image upload failed: ${upload.error.message}. Run the latest supabase-schema.sql and make sure the product-images bucket exists.`
                    );
                    return;
                }

                imageUrl =
                    supabase
                        .storage
                        .from('product-images')
                        .getPublicUrl(path)
                        .data
                        .publicUrl;
            }

            const product = {
                name:
                    document
                        .querySelector('#product-name')
                        .value,

                price:
                    Number(
                        document
                            .querySelector('#product-price')
                            .value
                    ),

                stock:
                    Number(
                        document
                            .querySelector('#product-stock')
                            .value
                    ),

                color:
                    document
                        .querySelector('#product-color')
                        .value,

                description:
                    'A fresh print from the Preston studio.',

                image_url:
                    imageUrl
            };

            const { data, error } =
                await supabase
                    .from('products')
                    .insert(product)
                    .select()
                    .single();

            if (error) {
                alert(
                    `Product could not be added: ${error.message}. Run the latest supabase-schema.sql so products has an image_url column.`
                );
                return;
            }

            products.push(data);

            event.target.reset();

            renderProducts();
            renderInventory();
        }
    );

document
    .querySelector('#customer-form')
    .addEventListener(
        'submit',
        async event => {
            event.preventDefault();

            const email =
                document
                    .querySelector(
                        '#customer-account-email'
                    )
                    .value
                    .trim()
                    .toLowerCase();

            const password =
                document
                    .querySelector(
                        '#customer-account-password'
                    )
                    .value;

            const { error } =
                await supabase.auth.signUp({
                    email,
                    password
                });

            if (error) {
                message(error.message);
                return;
            }

            message(
                'Check your email to confirm your account, then sign in.'
            );
        }
    );

document
    .querySelector('#login-form')
    .addEventListener(
        'submit',
        async event => {
            event.preventDefault();

            const email =
                document
                    .querySelector('#login-email')
                    .value
                    .trim()
                    .toLowerCase();

            const password =
                document
                    .querySelector('#login-password')
                    .value;

            const { error } =
                await supabase.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) {
                message(error.message);
            } else {
                document
                    .querySelector('#account-dialog')
                    .close();
            }
        }
    );

document
    .querySelector('#sign-out')
    .addEventListener(
        'click',
        async () => {
            await supabase.auth.signOut();

            document
                .querySelector('#account-dialog')
                .close();
        }
    );


function createOrderNumber() {
    const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `PRINT-${stamp}-${random}`;
}

function getCheckoutDetails() {
    return {
        customerName: document.querySelector('#checkout-name').value.trim(),
        customerEmail: document.querySelector('#checkout-email').value.trim().toLowerCase(),
        address: document.querySelector('#checkout-address').value.trim(),
        notes: document.querySelector('#checkout-notes').value.trim()
    };
}

// STRIPE CHECKOUT

async function checkout() {
    if (!currentUser) {
        message('Please sign in before checking out.');
        return;
    }

    if (!cart.length) {
        message('Your cart is empty.');
        return;
    }

    document.querySelector('#checkout-name').value = currentUser.email.split('@')[0];
    document.querySelector('#checkout-email').value = currentUser.email;
    document.querySelector('#checkout-dialog').showModal();
}

async function startStripeCheckout(event) {
    event.preventDefault();

    if (!currentUser || !cart.length) return;

    const details = getCheckoutDetails();
    const orderNumber = createOrderNumber();

    localStorage.setItem('pendingOrderNumber', orderNumber);

    try {
        const { data, error } =
            await supabase.functions.invoke(
                'create-checkout',
                {
                    body: {
                        orderNumber,
                        customerName: details.customerName,
                        customerEmail: details.customerEmail,
                        address: details.address,
                        notes: details.notes,
                        items: cart.map(item => ({
                            id: item.id,
                            quantity: item.quantity
                        }))
                    }
                }
            );

        if (error) {
            console.error(
                'Supabase function error:',
                error
            );

            if (error.context) {
                try {
                    const errorBody =
                        await error.context.json();

                    console.error(
                        'Edge Function response:',
                        errorBody
                    );

                    alert(
                        errorBody?.error ||
                        error.message ||
                        'Checkout failed.'
                    );

                    return;
                } catch (readError) {
                    console.error(
                        'Could not read Edge Function error:',
                        readError
                    );
                }
            }

            alert(
                error.message ||
                'Could not start checkout.'
            );

            return;
        }

        if (!data || !data.url) {
            console.error(
                'Stripe response:',
                data
            );

            alert(
                'Stripe did not return a checkout URL.'
            );

            return;
        }

        window.location.href =
            data.url;

    } catch (error) {
        console.error(
            'Checkout error:',
            error
        );

        alert(
            error.message ||
            'Checkout failed.'
        );
    }
}

document
    .querySelector('#checkout-button')
    .addEventListener(
        'click',
        checkout
    );

document
    .querySelector('#checkout-form')
    .addEventListener('submit', startStripeCheckout);

document
    .querySelector('#checkout-close')
    .addEventListener('click', () => document.querySelector('#checkout-dialog').close());

document
    .querySelector('#test-order-form')
    .addEventListener('submit', async event => {
        event.preventDefault();

        if (currentRole !== 'owner') return;

        if (!cart.length) {
            alert('Add at least one product to the cart before sending a fake order.');
            return;
        }

        const customerName = document.querySelector('#test-order-name').value.trim();
        const customerEmail = document.querySelector('#test-order-email').value.trim().toLowerCase();
        const address = document.querySelector('#test-order-address').value.trim();
        const notes = document.querySelector('#test-order-notes').value.trim();
        const orderNumber = createOrderNumber();
        const total = cart.reduce((sum, item) => {
            const product = products.find(entry => entry.id === item.id);
            return sum + (product ? product.price * item.quantity : 0);
        }, 0);

        const { error } = await supabase.functions.invoke('send-order-telegram', {
            body: {
                orderNumber,
                customerName,
                customerEmail,
                address,
                notes,
                items: cart.map(item => {
                    const product = products.find(entry => entry.id === item.id);
                    return { name: product?.name || 'Unknown product', price: product?.price || 0, quantity: item.quantity };
                }),
                total,
                isTestOrder: true
            }
        });

        if (error) {
            alert(`Fake order could not be sent: ${error.message}`);
            return;
        }

        alert(`Fake order ${orderNumber} sent to Telegram.`);
        event.target.reset();
    });

await loadProducts();
await loadSession();