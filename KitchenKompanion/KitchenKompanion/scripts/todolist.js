//DOM Elements
const inventoryList = document.getElementById("inventory-list");
const itemNameInput = document.getElementById("item-name");
const quantityInput = document.getElementById("item-quantity");

const locationInput = document.getElementById("item-location");
const expirationInput = document.getElementById("item-expiration");
const addButton = document.querySelector(".row button");
const unitSelect = document.getElementById("item-unit");
const locationFilter = document.getElementById("location-filter");

// Wizard Mode (Transferred Items from Grocery List)
// <--- for this project I also used alot of past knlodge from 335 --->
 let transferredItems = JSON.parse(localStorage.getItem("inventoryItems")) || [];
let currentIndex = 0;

if (transferredItems.length > 0) {
  startWizard();
}
// I used Simple Task Management App with HTML CSS and JS 
// Learn Web Dev with Norbert video for basic concepts and refined them and edited it to fit my needs
//https://www.youtube.com/watch?v=txSwC82v6UM

function startWizard() {
  if (currentIndex >= transferredItems.length) {
       endWizard();
    return;
  }

  const item = transferredItems[currentIndex];
  itemNameInput.value = item.name;
   quantityInput.value = "";
  locationInput.value = "";
  expirationInput.value = "";
}

function endWizard() {
    transferredItems = [];
  currentIndex = 0;
  localStorage.removeItem("inventoryItems");
  clearInputs();
  addButton.textContent = "+ Add Location";
}


//Add inventory items 
function addItem() {
  const name = itemNameInput.value.trim();
  const quantity = `${quantityInput.value.trim()} ${unitSelect.value}`;
  const location = locationInput.value;
    const expiration = expirationInput.value;

  if (!name || !quantity || location === "" ||  !expiration) {
      alert("Please fill in all fields.");
     return;
  }




  const li = document.createElement("li");

  /*<--- for this section i used help from stackOverflow to get a jist on how to add multiple span section */
  li.className = "inventory-item";
  li.innerHTML = `
    ${name} <span class="item-quantity editable-quantity">${quantity}</span>
 ${location} 
    <span class="expiration">${expiration}</span>
    <span class="remove-btn" style="cursor: pointer; color: red;">&times;</span>
  `;

  inventoryList.appendChild(li);

  if (currentIndex < transferredItems.length) {

    currentIndex++;

    startWizard();

  } else {

    clearInputs();
  }

  saveInventory();
}



//Save and load inventory

function saveInventory() {

  const items = [];

  const listItems = document.querySelectorAll(
    "#inventory-list .inventory-item"
  );

  listItems.forEach((li) => {
    const name = li.childNodes[0].textContent.trim();
    const quantity =
      li.querySelector(".item-quantity")?.textContent.trim() || "";

    const location = li.childNodes[2]?.textContent.trim() || "";

    const expiration = li.querySelector(".expiration").textContent;

    items.push({
      text: `${name} - ${quantity} units - ${location}`,

      expiration,
    });
  });

  localStorage.setItem("savedInventory", JSON.stringify(items));
}

// for this section i used W3 schoold local storage page to help understand more on how exactlly local storage works 
function loadInventory() {
  const saved = JSON.parse(localStorage.getItem("savedInventory")) || [];

  saved.forEach((item) => {
    const li = document.createElement("li");
    li.className = "inventory-item";

    const parts = item.text.split(" - ");

    const name = parts[0];

    const quantity = parts[1].replace(" units", "");
    const location = parts[2];

    li.innerHTML = `
      ${name}  <span class="item-quantity editable-quantity">${quantity}</span>  ${location} 

      <span class="expiration">${item.expiration}</span>
      <span class="remove-btn" style="cursor: pointer; color: red;">&times;</span>
    `;

    inventoryList.appendChild(li);
  });

  locationFilter.addEventListener("change", filterInventoryByLocation);
  locationFilter.addEventListener("change", renderItems);

}


function filterInventoryByLocation() {
  const selected = locationFilter.value.toLowerCase();
  const items = document.querySelectorAll("#inventory-list .inventory-item");

  items.forEach((item) => {
    const location = item.textContent.toLowerCase();
    item.style.display =
      selected === "" || location.includes(selected) ? "" : "none";
  });
}


//clear inputs 

function clearInputs() {
  itemNameInput.value = "";
  quantityInput.value = "";
  locationInput.selectedIndex = 0;
  expirationInput.value = "";
}


//Search filter

function myFunction() {
  const input = document.getElementById("myInput");
  const filter = input.value.toUpperCase();
  const li = inventoryList.getElementsByTagName("li");

  for (let i = 0; i < li.length; i++) {
    const txtValue = li[i].textContent || li[i].innerText;
    li[i].style.display =
      txtValue.toUpperCase().indexOf(filter) > -1 ? "" : "none";
  }
}


//Locations add,load,save
//<----- In this section I used help from stack over flow specificlly 
//https://stackoverflow.com/questions/63539551/how-do-i-add-an-on-click-event-listener-using-an-argument-passed-to-a-function-i ---->
document.getElementById("add-location-btn").addEventListener("click", () => {
  const newLocation = prompt("Enter new storage location:");
  if (newLocation) {
    const exists = Array.from(locationInput.options).some(
      (opt) => opt.value.toLowerCase() === newLocation.toLowerCase()
    );

   
    if (!exists) {
      const option = document.createElement("option");

      option.value = newLocation;
      option.textContent = newLocation;

      locationInput.appendChild(option);

      // Update the filter dropdown too
      const filterOption = document.createElement("option");
      filterOption.value = newLocation;

        filterOption.textContent = newLocation;
      locationFilter.appendChild(filterOption);

      saveLocation(newLocation);
    }

    // Set the new location as selected in the location input to make it clear for user 

    locationInput.value = newLocation;
  }
});


function saveLocation(newLocation) {
  const saved = JSON.parse(localStorage.getItem("customLocations")) || [];

  // Avoid duplicates in localStorage bc that is no good
  if (!saved.includes(newLocation))   {

    saved.push(newLocation);

    localStorage.setItem("customLocations", JSON.stringify(saved));
  }
}


function loadLocations() {
  const savedLocations =
    JSON.parse(localStorage.getItem("customLocations")) || [];
  const locations = ["Fridge", "Freezer", "Pantry", ...savedLocations];

  // Clear existing options
  locationFilter.innerHTML = '<option value="">All Locations</option>'; // Add the default "All Locations" option

  // Add the locations to the filter dropdown
  locations.forEach((loc) => {
    const option = document.createElement("option");
    option.value = loc;
    option.textContent = loc;
    locationFilter.appendChild(option);
  });
}



//grocery list

function transferToGroceryList() {
  const checkedItems = [];

  document.querySelectorAll("#inventory-container li.checked").forEach((li) => {
    checkedItems.push({ name: li.textContent.replace("×", "").trim() });
    li.remove(); // optional: remove from inventory list
  });

  // Get existing grocery list data
  const existingList = JSON.parse(localStorage.getItem("groceryItems")) || [];

  // Append new items
  const updatedList = [...existingList, ...checkedItems];

  // Save back to localStorage
  localStorage.setItem("groceryItems", JSON.stringify(updatedList));

  saveData(); // if this updates UI or other state
  window.location.href = "grocerylist.html"; // redirect to grocery list
}


//inventory click list 

inventoryList.addEventListener("click", function (e) {
  const li = e.target.closest("li");

  if (e.target.classList.contains("remove-btn")) {
    li.remove();
    saveInventory();
  }

  if (e.target.classList.contains("item-quantity")) {
    const newQuantity = prompt("Enter new quantity:", e.target.textContent);
    if (newQuantity?.trim()) {
      e.target.textContent = newQuantity.trim();
      saveInventory();
    }
  }

  if (e.target.classList.contains("to-grocery")) {
    const itemText = li.textContent.split("-")[0].trim();
    addToGroceryList(itemText);
  }
});




// Close dropdowns when clicking outside
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    const dropdowns = document.getElementsByClassName("dropdown-content");
    Array.from(dropdowns).forEach(dropdown => {
      if (dropdown.classList.contains("show")) {
        dropdown.classList.remove("show");
      }
    });
  }
};

//rest logic 

document.getElementById("reset-app-btn").addEventListener("click", () => {
  if (
    confirm(
      "Are you sure you want to reset the app? This will remove all saved data."
    )
  ) {
    localStorage.clear();
    location.reload();
  }
});


//final setup

loadInventory();
loadLocations();

