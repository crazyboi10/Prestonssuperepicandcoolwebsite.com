const catalog = document.getElementById('catalog');
const loadBtn = document.getElementById('loadBtn');

async function fetchBottles() {
  catalog.innerHTML = '<div class="loading">Loading bottles...</div>';

  try {
    const response = await fetch('https://dummyjson.com/products?limit=16');

    if (!response.ok) {
      throw new Error('Could not load products');
    }

    const data = await response.json();
    const products = Array.isArray(data.products) ? data.products : [];

    const bottleProducts = products.filter((product) => {
      const title = product.title || '';
      const description = product.description || '';
      const category = product.category || '';
      const combined = `${title} ${description} ${category}`.toLowerCase();
      return combined.includes('bottle') || combined.includes('water') || combined.includes('hydration');
    });

    const bottles = (bottleProducts.length ? bottleProducts : products).slice(0, 8).map((product) => ({
      name: product.title || 'Water Bottle',
      brand: product.brand || 'Hydration Co.',
      price: `$${Number(product.price || 0).toFixed(2)}`,
      color: product.stock > 0 ? 'In Stock' : 'Sold Out',
      description: product.description || 'A clean hydration bottle built for everyday use.',
      image: product.images?.[0] || product.thumbnail || 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80'
    }));

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
  } catch (error) {
    console.error(error);
    catalog.innerHTML = '<div class="loading">Unable to load the bottle catalog right now.</div>';
  }
}

loadBtn.addEventListener('click', fetchBottles);
fetchBottles();
