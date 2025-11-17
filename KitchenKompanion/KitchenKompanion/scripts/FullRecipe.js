document.addEventListener('DOMContentLoaded', function() {
  // Get recipe details from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const recipeName = urlParams.get('name');
  
  if (recipeName) {
    loadRecipeDetails(recipeName);
  } else {
    // If no recipe name provided, redirect back to recipes page
    window.location.href = 'recipes.html';
  }
  
  // Setup button event listeners
  document.getElementById('backToRecipes').addEventListener('click', function() {
    window.location.href = 'recipes.html';
  });
  
  document.getElementById('editRecipe').addEventListener('click', function() {
    // Store the recipe name to edit and redirect to recipes page
    localStorage.setItem('editRecipeName', recipeName);
    window.location.href = 'recipes.html?edit=' + encodeURIComponent(recipeName);
  });
  
  document.getElementById('deleteRecipe').addEventListener('click', function() {
    if (confirm('Are you sure you want to delete this recipe?')) {
      deleteRecipe(recipeName);
      window.location.href = 'recipes.html?deleted=' + encodeURIComponent(recipeName);
    }
  });
});

function loadRecipeDetails(recipeName) {
  // Get recipes from localStorage
  const savedRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
  
  // Find the recipe with the matching name
  const recipe = savedRecipes.find(recipe => recipe.name === recipeName);
  
  if (!recipe) {
    alert('Recipe not found!');
    window.location.href = 'recipes.html';
    return;
  }
  
  // Update the page with recipe details
  document.getElementById('recipeName').textContent = recipe.name;
  document.getElementById('recipeDescription').textContent = recipe.description;
  
  if (recipe.tags) {
    document.getElementById('recipeTags').textContent = `Tags: ${recipe.tags}`;
  } else {
    document.getElementById('recipeTags').style.display = 'none';
  }
  
  if (recipe.fullDescription) {
    document.getElementById('fullDescriptionText').textContent = recipe.fullDescription;
  } else {
    document.getElementById('recipeFullDescription').style.display = 'none';
  }
  
  const ingredientsList = document.getElementById('ingredientsList');
  ingredientsList.innerHTML = '';
  
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    recipe.ingredients.forEach(ingredient => {
      const listItem = document.createElement('li');
      listItem.textContent = `${ingredient.name} - ${ingredient.size}`;
      ingredientsList.appendChild(listItem);
    });
  } else {
    const listItem = document.createElement('li');
    listItem.textContent = 'No ingredients listed';
    ingredientsList.appendChild(listItem);
  }
}

function deleteRecipe(recipeName) {
  // Get recipes from localStorage
  const savedRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
  
  // Filter out the recipe to delete
  const updatedRecipes = savedRecipes.filter(recipe => recipe.name !== recipeName);
  
  // Save the updated recipes list
  localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
}