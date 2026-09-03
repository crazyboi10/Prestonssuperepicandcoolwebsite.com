const catalog = document.getElementById('catalog');
const loadBtn = document.getElementById('loadBtn');

const fallbackBottles = [
  {
    name: 'Stainless Steel Bottle',
    brand: 'HydraPeak',
    price: '$24.99',
    color: 'In Stock',
    description: 'A durable insulated bottle built for all-day hydration.',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Classic Travel Bottle',
    brand: 'PureFlow',
    price: '$18.50',
    color: 'Popular',
    description: 'Leak-proof and lightweight for commuting, school, and gym days.',
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Eco Sport Bottle',
    brand: 'EverHydro',
    price: '$21.00',
    color: 'New',
    description: 'A reusable bottle with a silicone sleeve and easy-carry design.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Daily Hydration Bottle',
    brand: 'BlueSip',
    price: '$19.99',
    color: 'In Stock',
    description: 'A simple, clean bottle designed for everyday use and quick refills.',
    image: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&w=900&q=80'
  }
];

function renderBottles(bottles) {
  catalog.innerHTML = bottles
    .map(
      (bottle) => `
        <article class="product-card">
          <img class="product-image" src="${bottle.image}" alt="${bottle.name}" />
          <div class="product-body">
            <h2 class="product-name">${bottle.name}</h2>
            <p class="product-brand">${bottle.brand}</p>

            <div class="product-meta">
              <span class="product-price">${bottle.price}</span>
              <span class="product-color">${bottle.color}</span>
            </div>

            <p class="product-description">${bottle.description}</p>
          </div>
        </article>
      `
    )
    .join('');
}

async function fetchBottles() {
  catalog.innerHTML = '<div class="loading">Loading bottles...</div>';

  try {
    const response = await fetch('https://dummyjson.com/products/search?q=bottle');

    if (!response.ok) {
      throw new Error('Could not load products');
    }

    const data = await response.json();
    const products = Array.isArray(data.products) ? data.products : [];

    const bottleProducts = products.filter((product) => {
      const title = (product.title || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      const combined = `${title} ${description} ${category}`;
      const isBottleItem =
        combined.includes('bottle') ||
        combined.includes('water bottle') ||
        combined.includes('hydration') ||
        combined.includes('drink bottle');

      const isDefinitelyNotBeauty =
        !combined.includes('lipstick') &&
        !combined.includes('foundation') &&
        !combined.includes('makeup') &&
        !combined.includes('mascara') &&
        !combined.includes('blush') &&
        !combined.includes('perfume') &&
        !combined.includes('skincare');

      return isBottleItem && isDefinitelyNotBeauty;
    });

    const bottles = (bottleProducts.length ? bottleProducts : fallbackBottles).slice(0, 8).map((product) => ({
      name: product.name || product.title || 'Water Bottle',
      brand: product.brand || product.company || 'Hydration Co.',
      price: product.price ? `$${Number(product.price).toFixed(2)}` : product.price || '$19.99',
      color: product.color || product.stock > 0 ? 'In Stock' : 'Sold Out',
      description: product.description || 'A clean hydration bottle built for everyday use.',
      image: product.image || product.images?.[0] || product.thumbnail || 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80'
    }));

    renderBottles(bottles);
  } catch (error) {
    console.error(error);
    renderBottles(fallbackBottles);
  }
}

loadBtn.addEventListener('click', fetchBottles);
fetchBottles();
