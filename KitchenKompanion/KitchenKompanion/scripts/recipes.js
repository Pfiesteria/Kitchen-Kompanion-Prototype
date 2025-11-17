// Get elements
const addRecipeButton = document.querySelector('.add-recipe-button');
const recipeFormContainer = document.getElementById('recipeFormContainer');
const formOverlay = document.getElementById('formOverlay');
const closeFormButton = document.getElementById('closeForm');
const recipeForm = document.getElementById('recipeForm');
const recipeList = document.getElementById('recipeList');
const searchInput = document.querySelector('.search-bar input[type="search"]');
const ingredientsContainer = document.getElementById('ingredientsContainer');
const addIngredientButton = document.getElementById('addIngredient');
const userDropdown = document.getElementById('active-user');
const allergyFilter = document.getElementById('allergy-filter');

// Load user profiles from localStorage
function loadUserProfiles() {
  let members = [];
  
  try {
    const storedMembers = localStorage.getItem('members');
    if (storedMembers) {
      members = JSON.parse(storedMembers);
    }
  } catch (e) {
    console.error('Error loading member profiles:', e);
  }
  
  // Clear existing options except the default one
  while (userDropdown.options.length > 1) {
    userDropdown.remove(1);
  }
  
  // Add member options to dropdown
  members.forEach((member, index) => {
    const option = document.createElement('option');
    option.value = member.name;
    option.textContent = member.name;
    userDropdown.appendChild(option);
  });
  
  // Set previously selected user if available
  const activeUser = localStorage.getItem('activeUser');
  if (activeUser) {
    userDropdown.value = activeUser;
  }
  
  // Initialize allergy filter state if the element exists
  if (allergyFilter) {
    const filterState = localStorage.getItem('allergyFilterEnabled') === 'true';
    allergyFilter.checked = filterState;
    
    // Apply initial filtering if needed
    if (filterState) {
      filterRecipesByAllergies();
    }
  }
}

// Handle user selection change
userDropdown.addEventListener('change', function() {
  const selectedUser = userDropdown.value;
  localStorage.setItem('activeUser', selectedUser);
  
  // Apply filtering if checkbox is checked
  if (allergyFilter && allergyFilter.checked) {
    filterRecipesByAllergies();
  }
  
  // Also update any allergy warnings displayed in recipe cards
  updateAllergyWarnings();
});

// Update recipe displays with allergy warnings based on active user
function updateAllergyWarnings() {
  // This will be called when user changes to update any visible recipe warnings
  const selectedUser = userDropdown.value;
  
  // If we have recipe cards displayed with allergy warnings, update them
  const recipes = document.querySelectorAll('#recipeList article');
  recipes.forEach(recipe => {
    // Logic to update allergy warnings for the active user
    // Will use recipe ingredients and selected user's allergies
  });
}

// Add profile loading to window load event
window.addEventListener('load', function() {
  loadRecipesFromStorage();
  loadUserProfiles();
});

function saveRecipesToStorage() {
  const recipes = [];
  document.querySelectorAll('#recipeList article').forEach(article => {
    const recipeInfo = article.querySelector('.recipe-info');
    const name = recipeInfo.querySelector('h2').textContent;
    const description = article.dataset.description || '';
    //desc
    const fullDescription = article.dataset.fullDescription || '';
    // tags
    const tagsElement = recipeInfo.querySelector('.tags');
    const tags = tagsElement ? tagsElement.textContent.replace('Tags: ', '') : '';
    
    //  ingredients
    const ingredients = JSON.parse(article.dataset.ingredients || '[]');
    
    recipes.push({ name, description, fullDescription, tags, ingredients });
  });
  
  localStorage.setItem('recipes', JSON.stringify(recipes));
}

// load recipes from localStorage
function loadRecipesFromStorage() {
  try {
    const savedRecipes = JSON.parse(localStorage.getItem('recipes'));
    if (savedRecipes && Array.isArray(savedRecipes)) {
      // Clear existing recipes first to prevent duplicates
      const recipeArticles = document.querySelectorAll('#recipeList article');
      recipeArticles.forEach(article => {
        if (!article.classList.contains('add-recipe-button')) {
          article.remove();
        }
      });
      
      savedRecipes.forEach(recipe => {
        createRecipeElement(
          recipe.name,
          recipe.description,
          recipe.fullDescription,
          recipe.tags,
          recipe.ingredients,
          true // Skip saving to avoid circular saving
        );
      });
    }
  } catch (e) {
    console.error('Error loading saved recipes:', e);
  }
}


// Modify the createRecipeElement function to have an optional parameter to prevent saving
function createRecipeElement(name, description, fullDescription, tags, ingredients, skipSaving = false) {
  const newArticle = document.createElement('article');
  newArticle.dataset.fullDescription = fullDescription || '';
  newArticle.dataset.description = description || '';
  newArticle.dataset.ingredients = JSON.stringify(ingredients || []);
  
  const recipeDiv = document.createElement('div');
  recipeDiv.className = 'recipe-info';

  // Recipe name (heading)
  const recipeHeading = document.createElement('h2');
  recipeHeading.textContent = name;
  recipeDiv.appendChild(recipeHeading);

  // Display tags
  let recipeTags = null;
  if (tags) {
    recipeTags = document.createElement('p');
    recipeTags.className = 'tags';
    recipeTags.textContent = `Tags: ${tags}`;
    recipeDiv.appendChild(recipeTags);
  }
  
  // Make the entire article clickable to navigate to full recipe page
  newArticle.addEventListener('click', function() {
    window.location.href = `FullRecipe.html?name=${encodeURIComponent(name)}`;
  });

  newArticle.appendChild(recipeDiv);
  recipeList.appendChild(newArticle);
  
  // Save to localStorage only if not loading from storage
  if (!skipSaving) {
    saveRecipesToStorage();
  }
  
  // Apply filtering if needed after adding a new recipe
  if (allergyFilter && allergyFilter.checked) {
    filterRecipesByAllergies();
  }
  
  return newArticle;
}

// Helper function to show recipe modal
function showRecipeModal(name, description, fullDescription, tags, ingredients) {
  const modal = document.getElementById('recipeModal');
  const modalContentDiv = document.getElementById('modalRecipeDetails');
  
  modalContentDiv.innerHTML = '';
  
  const titleElement = document.createElement('h2');
  titleElement.textContent = name;
  modalContentDiv.appendChild(titleElement);
  
  const descElement = document.createElement('p');
  descElement.textContent = description;
  modalContentDiv.appendChild(descElement);
  
  if (fullDescription && fullDescription.trim()) {
    const fullDescHeading = document.createElement('h3');
    fullDescHeading.textContent = 'Full Description';
    modalContentDiv.appendChild(fullDescHeading);
    
    const fullDescElement = document.createElement('div');
    fullDescElement.className = 'full-description';
    fullDescElement.textContent = fullDescription;
    modalContentDiv.appendChild(fullDescElement);
  }
  
  if (ingredients.length > 0) {
    const ingredientsHeading = document.createElement('h3');
    ingredientsHeading.textContent = 'Ingredients';
    modalContentDiv.appendChild(ingredientsHeading);

    const ingredientsList = document.createElement('ul');
    ingredients.forEach(ingredient => {
      const listItem = document.createElement('li');
      listItem.textContent = `${ingredient.name} - ${ingredient.size}`;
      ingredientsList.appendChild(listItem);
    });
    modalContentDiv.appendChild(ingredientsList);
    
    // allergy warnings
    const allergens = getAllergyWarnings(ingredients);
    if (allergens.length > 0) {
      const allergensHeading = document.createElement('h4');
      allergensHeading.textContent = 'Allergy Warning';
      allergensHeading.style.color = '#E34C35'; 
      modalContentDiv.appendChild(allergensHeading);
      
      const allergensList = document.createElement('ul');
      allergensList.className = 'allergens-list';
      allergensList.style.color = '#E34C35';
      
      allergens.forEach(allergen => {
        const listItem = document.createElement('li');
        listItem.textContent = allergen;
        allergensList.appendChild(listItem);
      });
      
      modalContentDiv.appendChild(allergensList);
    }
  }
  
  if (tags) {
    const tagsElement = document.createElement('p');
    tagsElement.textContent = `Tags: ${tags}`;
    modalContentDiv.appendChild(tagsElement);
  }
  
  const addToListBtn = document.createElement('button');
  addToListBtn.textContent = 'Add Missing Ingredients to List';
  addToListBtn.className = 'add-to-list-btn';
  addToListBtn.addEventListener('click', function() {
    addMissingIngredientsToList(ingredients);
  });
  modalContentDiv.appendChild(addToListBtn);
  
  modal.style.display = 'block';
}

// Helper function to add missing ingredients to list
function addMissingIngredientsToList(ingredients) {
  // Get current grocery list items from localStorage
  const currentListHTML = localStorage.getItem("data") || "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = currentListHTML;
  const currentItems = Array.from(tempDiv.querySelectorAll("li"))
    .map(li => li.textContent.replace("×", "").trim().toLowerCase());
  
  // Get current inventory items from localStorage
  let inventoryItems = [];
  try {
    inventoryItems = JSON.parse(localStorage.getItem("inventoryItems")) || [];
  } catch (e) {
    inventoryItems = [];
  }
  
  const inventoryItemNames = inventoryItems.map(item => item.name.toLowerCase());
  
  // get missing ingredients
  const missingIngredients = ingredients.filter(ingredient => 
    !inventoryItemNames.includes(ingredient.name.toLowerCase()));

  
  // Add missing ingredients to grocery list if not already there
  let addedCount = 0;
  missingIngredients.forEach(ingredient => {
    const ingredientName = ingredient.name.toLowerCase();
    if (!currentItems.includes(ingredientName)) {
      const li = document.createElement("li");
      li.textContent = ingredient.name;
      const span = document.createElement("span");
      span.innerHTML = "\u00d7";
      li.appendChild(span);
      tempDiv.appendChild(li);
      addedCount++;
    }
  });
  
  // Save updated grocery list back to localStorage
  localStorage.setItem("data", tempDiv.innerHTML);
  
}

addIngredientButton.addEventListener('click', function () {
  const ingredientRow = document.createElement('div');
  ingredientRow.className = 'ingredient-row';
  ingredientRow.innerHTML = `
    <input type="text" class="ingredient-name" placeholder="Ingredient" maxlength="60" />
    <input type="text" class="ingredient-size" placeholder="Serving Size" />
    <button type="button" class="remove-ingredient">Remove</button>
  `;
  ingredientRow.querySelector('.remove-ingredient').addEventListener('click', function () {
    ingredientRow.remove();
  });
  ingredientsContainer.appendChild(ingredientRow);
});

function showForm() {
  recipeFormContainer.style.display = 'block';
  formOverlay.style.display = 'block';
}

function hideForm() {
  recipeFormContainer.style.display = 'none';
  formOverlay.style.display = 'none';
}


addRecipeButton.addEventListener('click', showForm);
closeFormButton.addEventListener('click', hideForm);
formOverlay.addEventListener('click', hideForm);

function createEditButton(article, recipeHeading, recipeDesc, recipeTags, recipeIngredients, fullDescription) {
  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.className = 'edit-recipe-button';

  editButton.addEventListener('click', function () {
    // Populate the form with the current recipe details
    document.getElementById('recipeName').value = recipeHeading.textContent;
    document.getElementById('description').value = recipeDesc.textContent;
    document.getElementById('fullDescription').value = fullDescription || '';
    document.getElementById('tags').value = recipeTags ? recipeTags.textContent.replace('Tags: ', '') : '';

    ingredientsContainer.innerHTML = '';

    // Populate the ingredients container with the current ingredients
    recipeIngredients.forEach(ingredient => {
      const ingredientRow = document.createElement('div');
      ingredientRow.className = 'ingredient-row';
      ingredientRow.innerHTML = `
        <input type="text" class="ingredient-name" value="${ingredient.name}" placeholder="Ingredient" />
        <input type="text" class="ingredient-size" value="${ingredient.size}" placeholder="Serving Size" />
        <button type="button" class="remove-ingredient">Remove</button>
      `;
      ingredientsContainer.appendChild(ingredientRow);

      ingredientRow.querySelector('.remove-ingredient').addEventListener('click', function () {
        ingredientRow.remove();
      });
    });

    showForm();


    recipeForm.onsubmit = function (e) { 
      e.preventDefault();

      // Get new values
      const updatedName = document.getElementById('recipeName').value;
      const updatedDescription = document.getElementById('description').value;
      const updatedFullDescription = document.getElementById('fullDescription').value;
      const updatedTags = document.getElementById('tags').value;

      recipeHeading.textContent = updatedName;
      recipeDesc.textContent = updatedDescription;
      
      article.dataset.fullDescription = updatedFullDescription;
      fullDescription = updatedFullDescription;
      
      if (recipeTags) {
        recipeTags.textContent = `Tags: ${updatedTags}`;
      } else if (updatedTags) {
        const newTags = document.createElement('p');
        newTags.className = 'tags';
        newTags.textContent = `Tags: ${updatedTags}`;
        article.querySelector('.recipe-info').appendChild(newTags);
        recipeTags = newTags;
      }

      // Update ingredients
      const updatedIngredients = [];
      document.querySelectorAll('.ingredient-row').forEach(row => {
        const ingredientName = row.querySelector('.ingredient-name').value;
        const ingredientSize = row.querySelector('.ingredient-size').value;
        if (ingredientName && ingredientSize) {
          updatedIngredients.push({ name: ingredientName, size: ingredientSize });
        }
      });

      recipeIngredients.length = 0;
      updatedIngredients.forEach(ingredient => recipeIngredients.push(ingredient));

      const ingredientsList = article.querySelector('.ingredients-list');
      ingredientsList.innerHTML = '';
      updatedIngredients.forEach(ingredient => {
        const listItem = document.createElement('li');
        listItem.textContent = `${ingredient.name} - ${ingredient.size}`;
        ingredientsList.appendChild(listItem);
      });

      const seeMoreButton = article.querySelector('.see-more-button');
      if (seeMoreButton) {
        const newSeeMoreButton = seeMoreButton.cloneNode(true);
        seeMoreButton.parentNode.replaceChild(newSeeMoreButton, seeMoreButton);
        
        newSeeMoreButton.addEventListener('click', function() {
          const modal = document.getElementById('recipeModal');
          const modalContentDiv = document.getElementById('modalRecipeDetails');
          
          modalContentDiv.innerHTML = '';
          
          const titleElement = document.createElement('h2');
          titleElement.textContent = updatedName;
          modalContentDiv.appendChild(titleElement);
          
          const descElement = document.createElement('p');
          descElement.textContent = updatedDescription;
          modalContentDiv.appendChild(descElement);
          
          if (fullDescription && fullDescription.trim()) {
            const fullDescHeading = document.createElement('h3');
            fullDescHeading.textContent = 'Full Description';
            modalContentDiv.appendChild(fullDescHeading);
            
            const fullDescElement = document.createElement('div');
            fullDescElement.className = 'full-description';
            fullDescElement.textContent = fullDescription;
            modalContentDiv.appendChild(fullDescElement);
          }
          
          if (recipeIngredients.length > 0) {
            const ingredientsHeading = document.createElement('h3');
            ingredientsHeading.textContent = 'Ingredients';
            modalContentDiv.appendChild(ingredientsHeading);
        
            const ingredientsList = document.createElement('ul');
            recipeIngredients.forEach(ingredient => {
              const listItem = document.createElement('li');
              listItem.textContent = `${ingredient.name} - ${ingredient.size}`;
              ingredientsList.appendChild(listItem);
            });
            modalContentDiv.appendChild(ingredientsList);
            
            // Add allergy warnings
            const allergens = getAllergyWarnings(recipeIngredients);
            if (allergens.length > 0) {
              const allergensHeading = document.createElement('h4');
              allergensHeading.textContent = 'Allergy Warning';
              modalContentDiv.appendChild(allergensHeading);
              
              const allergensList = document.createElement('ul');
              allergensList.className = 'allergens-list';
                            
              allergens.forEach(allergen => {
                const listItem = document.createElement('li');
                listItem.textContent = allergen;
                allergensList.appendChild(listItem);
              });
              
              modalContentDiv.appendChild(allergensList);
            }
          }
          
          if (updatedTags) {
            const tagsElement = document.createElement('p');
            tagsElement.textContent = `Tags: ${updatedTags}`;
            modalContentDiv.appendChild(tagsElement);
          }
          
          const addToListBtn = document.createElement('button');
          addToListBtn.textContent = 'Add Missing Ingredients to List';
          addToListBtn.className = 'add-to-list-btn';
          addToListBtn.addEventListener('click', function() {
            // Get current grocery list items from localStorage
            const currentListHTML = localStorage.getItem("data") || "";
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = currentListHTML;
            const currentItems = Array.from(tempDiv.querySelectorAll("li"))
              .map(li => li.textContent.replace("×", "").trim().toLowerCase());
            
            // Get current inventory items from localStorage
            let inventoryItems = [];
            try {
              inventoryItems = JSON.parse(localStorage.getItem("inventoryItems")) || [];
            } catch (e) {
              inventoryItems = [];
            }
            
            const inventoryItemNames = inventoryItems.map(item => item.name.toLowerCase());
            
            // get missing ingredients
            const missingIngredients = recipeIngredients.filter(ingredient => 
              !inventoryItemNames.includes(ingredient.name.toLowerCase()));
            
            
            // Add missing ingredients to grocery list if they're not already there
            let addedCount = 0;
            missingIngredients.forEach(ingredient => {
              const ingredientName = ingredient.name.toLowerCase();
              if (!currentItems.includes(ingredientName)) {
                const li = document.createElement("li");
                li.textContent = ingredient.name;
                const span = document.createElement("span");
                span.innerHTML = "\u00d7";
                li.appendChild(span);
                tempDiv.appendChild(li);
                addedCount++;
              }
            });
            
            // Save updated grocery list back to localStorage
            localStorage.setItem("data", tempDiv.innerHTML);
          });
          modalContentDiv.appendChild(addToListBtn);
          
          modal.style.display = 'block';
        });
      }

      recipeForm.reset();
      hideForm();
      
      recipeForm.onsubmit = defaultFormSubmit;
      saveRecipesToStorage();
    };
  });

  return editButton;
}

function defaultFormSubmit(e) {
  e.preventDefault(); // Prevent default form submission which reloads pager

  const name = document.getElementById('recipeName').value;
  const description = document.getElementById('description').value;
  const fullDescription = document.getElementById('fullDescription').value;
  const tags = document.getElementById('tags').value;

  const ingredients = [];
  document.querySelectorAll('.ingredient-row').forEach(row => {
    const ingredientName = row.querySelector('.ingredient-name').value;
    const ingredientSize = row.querySelector('.ingredient-size').value;
    if (ingredientName && ingredientSize) {
      ingredients.push({ name: ingredientName, size: ingredientSize });
    }
  });

  createRecipeElement(name, description, fullDescription, tags, ingredients);

  recipeForm.reset();
  ingredientsContainer.innerHTML = ''; 

  hideForm();
}

recipeForm.onsubmit = defaultFormSubmit;

// Function to filter recipes based on search input
searchInput.addEventListener('input', function () {
  const query = searchInput.value.toLowerCase(); 
  const recipes = document.querySelectorAll('#recipeList article'); 

  recipes.forEach(recipe => {
    const title = recipe.querySelector('h2').textContent.toLowerCase(); 
    const description = recipe.dataset.description.toLowerCase();
    const tags = recipe.querySelector('.tags')?.textContent.toLowerCase() || ''; 

    if (title.includes(query) || description.includes(query) || tags.includes(query)) {
      recipe.style.display = '';
    } else {
      recipe.style.display = 'none';
    }
  });
});

const modal = document.getElementById('recipeModal');
const closeModalButton = modal.querySelector('.close-modal');

closeModalButton.addEventListener('click', function() {
  modal.style.display = 'none';
});

window.addEventListener('click', function(event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

window.addEventListener('load', loadRecipesFromStorage);

// Helper function to check for allergens in household members
function getAllergyWarnings(ingredients) {
  // Get the active user from localStorage
  const activeUser = localStorage.getItem('activeUser');
  
  // If no active user is selected, use all household allergens
  if (!activeUser) {
    // Original code for checking all household member allergens
    let memberAllergens = [];
    try {
      memberAllergens = JSON.parse(localStorage.getItem("member_allergens")) || [];
    } catch (e) {
      console.error("Error loading allergens:", e);
      return [];
    }
    
    if (!memberAllergens || !memberAllergens.length) {
      return [];
    }
    
    const ingredientNames = ingredients.map(ing => ing.name.toLowerCase());
    const warnings = [];
    
    memberAllergens.forEach(allergen => {
      const allergenLower = allergen.toLowerCase();
      
      for (const ingredient of ingredientNames) {
        if (ingredient.includes(allergenLower) || allergenLower.includes(ingredient)) {
          warnings.push(`This recipe contains ${allergen} which may cause allergic reactions for household members.`);
          break;
        }
      }
    });
    
    return warnings;
  } else {
    // Get only the active user's allergies
    let members = [];
    try {
      members = JSON.parse(localStorage.getItem("members")) || [];
    } catch (e) {
      console.error("Error loading members:", e);
      return [];
    }
    
    // Find the active user's allergies
    const activeUserData = members.find(member => member.name === activeUser);
    if (!activeUserData || !activeUserData.allergies || !activeUserData.allergies.length) {
      return [];
    }
    
    const ingredientNames = ingredients.map(ing => ing.name.toLowerCase());
    const warnings = [];
    
    activeUserData.allergies.forEach(allergen => {
      const allergenLower = allergen.toLowerCase();
      
      for (const ingredient of ingredientNames) {
        if (ingredient.includes(allergenLower) || allergenLower.includes(ingredient)) {
          warnings.push(`This recipe contains ${allergen} which may cause an allergic reaction for ${activeUser}.`);
          break;
        }
      }
    });
    
    return warnings;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM loaded, setting up delete button");
  
  const deleteAllButton = document.getElementById('delete-all-recipes');
  if (deleteAllButton) {
    console.log("Delete button found, adding event listener");
    deleteAllButton.addEventListener('click', function() {
      console.log("Delete button clicked");
      deleteAllRecipes();
    });
  } else {
    console.log("Delete button not found");
  }
  
  // Rest of your existing DOMContentLoaded code...
  // Check if we're coming from the FullRecipe page with an edit request
  const urlParams = new URLSearchParams(window.location.search);
  const editRecipeName = urlParams.get('edit');
  
  if (editRecipeName) {
    // Find the recipe and open the edit form
    const savedRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    const recipeToEdit = savedRecipes.find(recipe => recipe.name === editRecipeName);
    
    if (recipeToEdit) {
      openEditForm(recipeToEdit);
    }
  }
});

function openEditForm(recipe) {
  // Show the recipe form
  document.getElementById('recipeFormContainer').style.display = 'block';
  document.getElementById('formOverlay').style.display = 'block';
  
  // Fill in form values
  document.getElementById('recipeName').value = recipe.name;
  document.getElementById('description').value = recipe.description;
  document.getElementById('fullDescription').value = recipe.fullDescription || '';
  document.getElementById('tags').value = recipe.tags || '';
  
  // Clear existing ingredients
  const ingredientsContainer = document.getElementById('ingredientsContainer');
  ingredientsContainer.innerHTML = '';
  
  // Add ingredient rows if there are any
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    recipe.ingredients.forEach(ingredient => {
      const row = document.createElement('div');
      row.className = 'ingredient-row';
      
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'ingredient-name';
      nameInput.value = ingredient.name;
      
      const sizeInput = document.createElement('input');
      sizeInput.type = 'text';
      sizeInput.className = 'ingredient-size';
      sizeInput.value = ingredient.size;
      
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'remove-ingredient';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', function() {
        row.remove();
      });
      
      row.appendChild(nameInput);
      row.appendChild(sizeInput);
      row.appendChild(removeBtn);
      
      ingredientsContainer.appendChild(row);
    });
  } else {
    // Add an empty ingredient row if no ingredients
    addIngredientRow();
  }
  
  // Set the form in edit mode
  document.getElementById('submitBtn').dataset.editMode = 'true';
  document.getElementById('submitBtn').dataset.originalName = recipe.name;
}

// Modify window.addEventListener('load') to first clear existing recipes
window.addEventListener('load', function() {
  // Clear existing recipe elements before loading from storage
  const recipeArticles = document.querySelectorAll('#recipeList article');
  recipeArticles.forEach(article => {
    if (!article.classList.contains('add-recipe-button')) {
      article.remove();
    }
  });
  
  loadRecipesFromStorage();
  loadUserProfiles();
});

// Add this function to delete all recipes
function deleteAllRecipes() {
  // Remove from localStorage
  localStorage.removeItem('recipes');
  
  // Clear all recipe elements from the UI
  const recipeArticles = document.querySelectorAll('#recipeList article');
  recipeArticles.forEach(article => {
    if (!article.classList.contains('add-recipe-button')) {
      article.remove();
    }
  });
  
  alert('All recipes have been deleted.');
}

// Implement the filter function
function filterRecipesByAllergies() {
  const activeUser = userDropdown.value;
  const filterAllergies = allergyFilter.checked;
  
  if (!activeUser || !filterAllergies) {
    // Show all recipes if no user selected or filter not checked
    document.querySelectorAll('#recipeList article').forEach(article => {
      if (!article.classList.contains('add-recipe-button')) {
        article.style.display = '';
      }
    });
    return;
  }
  
  // Get the active user's allergies
  let members = [];
  try {
    members = JSON.parse(localStorage.getItem("members")) || [];
  } catch (e) {
    console.error("Error loading members:", e);
    return;
  }
  
  // Find the active user's allergies
  const activeUserData = members.find(member => member.name === activeUser);
  if (!activeUserData || !activeUserData.allergies || !activeUserData.allergies.length) {
    // No allergies for this user, show all recipes
    document.querySelectorAll('#recipeList article').forEach(article => {
      if (!article.classList.contains('add-recipe-button')) {
        article.style.display = '';
      }
    });
    return;
  }
  
  // Get all recipes and check for allergens
  document.querySelectorAll('#recipeList article').forEach(article => {
    if (article.classList.contains('add-recipe-button')) {
      return; // Skip the add recipe button
    }
    
    // Get ingredients for this recipe
    const ingredients = JSON.parse(article.dataset.ingredients || '[]');
    const ingredientNames = ingredients.map(ing => ing.name.toLowerCase());
    
    // Check if any ingredients contain allergens
    let hasAllergen = false;
    activeUserData.allergies.forEach(allergen => {
      const allergenLower = allergen.toLowerCase();
      
      for (const ingredient of ingredientNames) {
        if (ingredient.includes(allergenLower) || allergenLower.includes(ingredient)) {
          hasAllergen = true;
          break;
        }
      }
    });
    
    // Hide recipes with allergens, show recipes without allergens
    article.style.display = hasAllergen ? 'none' : '';
  });
}

// Add event listener for the allergy filter checkbox
document.addEventListener('DOMContentLoaded', function() {
  if (allergyFilter) {
    allergyFilter.addEventListener('change', function() {
      // Save filter state
      localStorage.setItem('allergyFilterEnabled', allergyFilter.checked);
      
      // Apply or remove filtering
      filterRecipesByAllergies();
    });
  }
  
  // Add the delete all recipes button functionality
  const deleteAllButton = document.getElementById('delete-all-recipes');
  if (deleteAllButton) {
    deleteAllButton.addEventListener('click', function() {
      deleteAllRecipes();
    });
  }
});
