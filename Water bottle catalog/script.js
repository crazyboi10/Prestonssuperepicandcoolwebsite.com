const catalog = document.getElementById('catalog');
const loadBtn = document.getElementById('loadBtn');

async function fetchBottles() {
  catalog.innerHTML = '<div class="loading">Loading bottles...</div>';

  try {
    const response = await fetch('https://fakestoreapi.com/products/category/women\'s%20clothing');

    if (!response.ok) {
      throw new Error('Could not load products');
    }

    const products = await response.json();

    const bottles = products.slice(0, 8).map((product) => ({
      name: product.title,
      brand: product.category,
      price: `$${product.price.toFixed(2)}`,
      color: product.rating?.rate ? 'Popular' : 'New',
      description: product.description,
      image: product.image
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
