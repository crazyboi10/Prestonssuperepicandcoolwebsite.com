const recipeContent = document.getElementById('recipeContent');
const newRecipeBtn = document.getElementById('newRecipeBtn');

async function fetchRandomRecipe() {
  recipeContent.className = 'recipe-content loading';
  recipeContent.innerHTML = '<div class="loading-text">Loading a tasty recipe...</div>';

  try {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');

    if (!response.ok) {
      throw new Error('Failed to fetch recipe');
    }

    const data = await response.json();
    const meal = data.meals?.[0];

    if (!meal) {
      throw new Error('No recipe found');
    }

    const ingredients = [];
    for (let i = 1; i <= 20; i += 1) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push(`${measure ? measure.trim() : ''} ${ingredient.trim()}`.trim());
      }
    }

    const instructionLines = meal.strInstructions
      ? meal.strInstructions.split('\n').filter((line) => line.trim())
      : ['No instructions available.'];

    recipeContent.className = 'recipe-content';
    recipeContent.innerHTML = `
      <div class="recipe-header">
        <img class="recipe-image" src="${meal.strMealThumb}" alt="${meal.strMeal}" />

        <div class="recipe-info">
          <h2>${meal.strMeal}</h2>

          <div class="meta-row">
            <span class="meta-pill">${meal.strCategory || 'Meal'}</span>
            <span class="meta-pill">${meal.strArea || 'World'}</span>
            <span class="meta-pill">${meal.strTags ? meal.strTags.split(',').slice(0, 2).join(' • ') : 'Popular'}</span>
          </div>

          <div class="recipe-section">
            <h3>Ingredients</h3>
            <ul>
              ${ingredients.map((item) => `<li>${item}</li>`).join('') || '<li>Ingredients not available.</li>'}
            </ul>
          </div>
        </div>
      </div>

      <div class="recipe-section">
        <h3>Instructions</h3>
        <ol>
          ${instructionLines.map((step) => `<li>${step}</li>`).join('')}
        </ol>
      </div>
    `;
  } catch (error) {
    console.error(error);
    recipeContent.className = 'recipe-content';
    recipeContent.innerHTML = `
      <div class="loading-text">Unable to load a recipe right now. Please try again.</div>
    `;
  }
}

newRecipeBtn.addEventListener('click', fetchRandomRecipe);
fetchRandomRecipe();
