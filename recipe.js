document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the recipe and image path from Chrome's local storage
    chrome.storage.local.get(['modifiedRecipe', 'imagePath'], (data) => {
        const modifiedRecipe = data.modifiedRecipe.modified_recipe;
        const imagePath = data.imagePath;
        const recipeElement = document.getElementById('recipe');
        const recipeImageElement = document.getElementById('recipeImage'); // Targeting the image element

        console.log('Retrieved modifiedRecipe:', modifiedRecipe);
        console.log('Retrieved imagePath:', imagePath);
        console.log('Retrieved recipeURL:', data.recipeURL);

        if (modifiedRecipe) {
            displayRecipe(modifiedRecipe, recipeElement);
        } else {
            recipeElement.textContent = 'No recipe data found.';
        }

        // Set the image src dynamically using the stored path
        if (imagePath) {
            recipeImageElement.src = imagePath; // Assuming the image is saved with a .png extension
        } else {
            recipeImageElement.alt = 'No image available';
        }
    });

    // Save button functionality
    document.getElementById('saveRecipe').addEventListener('click', saveRecipe);

    function saveRecipe() {
        const recipeTitle = document.getElementById('recipe').querySelector('h1').textContent;
        const recipeContent = document.getElementById('recipe').innerHTML;

        chrome.storage.local.get('recipeURL', function(data) {
            const recipeURL = data.recipeURL;

            chrome.storage.local.get({recipes: [], recipeComments: {}}, function (result) {
                const recipes = result.recipes;
                const comments = result.recipeComments;
                chrome.storage.local.get('imagePath', (data) => {
                    const imagePath = data.imagePath;
                    recipes.push({
                        title: recipeTitle,
                        content: recipeContent,
                        imagePath: imagePath,
                        url: recipeURL
                    });

                    chrome.storage.local.set({recipes: recipes, recipeComments: comments}, function () {
                        console.log('Recipe and comments saved');
                        alert('Recipe saved successfully!');
                        window.location.href = 'library.html';
                    });
                });
            });
        });
    }

    function displayRecipe(modifiedRecipe, container) {
        container.textContent = '';
    
        // Display the name of the dish
        const dishName = document.createElement('h1');
        dishName.textContent = modifiedRecipe['Name of the dish'] || 'Dish Name Not Specified';
        container.appendChild(dishName);
    
        // Display servings and cooking time
        const servings = document.createElement('p');
        servings.textContent = `Amount of servings: ${modifiedRecipe['Amount of servings'] === 'NA' ? 'Not Specified' : modifiedRecipe['Amount of servings']}`;
        container.appendChild(servings);
    
        const cookingTime = document.createElement('p');
        cookingTime.textContent = `Cooking time: ${modifiedRecipe['Cooking time'] === 'NA' ? 'Not Specified' : modifiedRecipe['Cooking time']}`;
        container.appendChild(cookingTime);
    
        // Display ingredients
        const ingredientsTitle = document.createElement('h2');
        ingredientsTitle.textContent = 'List of ingredients:';
        container.appendChild(ingredientsTitle);
    
        const ingredients = modifiedRecipe['List of ingredients'];
        if (ingredients) {
            displayData(ingredients, container);
        } else {
            const noIngredients = document.createElement('p');
            noIngredients.textContent = 'No ingredients found.';
            container.appendChild(noIngredients);
        }
    
        // Display instructions
        const instructionsTitle = document.createElement('h2');
        instructionsTitle.textContent = 'Instructions:';
        container.appendChild(instructionsTitle);
    
        const instructions = modifiedRecipe['Instructions'];
        if (instructions) {
            displayData(instructions, container, true); // Pass a flag to indicate it's for instructions
        } else {
            const noInstructions = document.createElement('p');
            noInstructions.textContent = 'No instructions found.';
            container.appendChild(noInstructions);
        }
    }
    
    function displayData(data, container, isInstructions = false) {
        if (Array.isArray(data)) {
            // If it's an array, display each item as a list item
            const list = document.createElement('ul');
            data.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                list.appendChild(li);
            });
            container.appendChild(list);
        } else if (typeof data === 'object') {
            // If it's an object, iterate through each key
            Object.keys(data).forEach(key => {
                const sectionTitle = document.createElement('h3');
                sectionTitle.textContent = `${key}:`;
                container.appendChild(sectionTitle);
    
                const sectionData = data[key];
                displayData(sectionData, container, isInstructions);
            });
        } else if (typeof data === 'string') {
            // If it's a string, and it's instructions, split by sentences
            if (isInstructions) {
                const sentences = data.split(/(?<=\.)\s+/);
                sentences.forEach(sentence => {
                    const p = document.createElement('p');
                    p.textContent = sentence;
                    container.appendChild(p);
                });
            } else {
                const paragraph = document.createElement('p');
                paragraph.textContent = data;
                container.appendChild(paragraph);
            }
        }
    }         
});