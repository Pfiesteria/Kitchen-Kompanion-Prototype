// <--- for this project I also used alot of past knlodge from 335 --->
const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
/* I used stack over flow to get an idea of how to do list were done and how i could make mine 
 https://stackoverflow.com/questions/77173437/doing-a-todolist-in-js-receiving-a-not-expected-output-when-inserting-an-elemen */ 
function addTask() {
  if (inputBox.value === "") {
    alert("Please enter a task");
  } else {
    let li = document.createElement("li");
    li.innerHTML = inputBox.value;
    listContainer.appendChild(li);
    let span = document.createElement("span");
    span.innerHTML = "\u00d7";
    li.appendChild(span);
  }
  inputBox.value = "";
  saveData();
}

listContainer.addEventListener(
  "click",
  function (e) {
    if (e.target.tagName === "LI") {
      e.target.classList.toggle("checked");
    }
    if (e.target.tagName === "SPAN") {
      e.target.parentElement.remove();
      saveData();
    }
  },
  false
);

function saveData() {
  localStorage.setItem("data", listContainer.innerHTML);
}
function showTask() {
  // Load from UI-stored tasks
  listContainer.innerHTML = localStorage.getItem("data");

  // Also load items added via inventory
  const storedGroceryItems =
    JSON.parse(localStorage.getItem("groceryList")) || [];
  storedGroceryItems.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = item.name;
    listContainer.appendChild(li);
    const span = document.createElement("span");
    span.innerHTML = "\u00d7";
    li.appendChild(span);
  });

  // Clear groceryList after showing to prevent duplicates on next load
  localStorage.removeItem("groceryList");
}

showTask();

function transferCheckedItems() {
  const checkedItems = [];
  document.querySelectorAll("#list-container li.checked").forEach((li) => {
    // Extract the name without the "x" (assuming it's in a <span> element)
    const itemName = li.childNodes[0].textContent.trim(); // Get the text of the item (ignores the "x")
    checkedItems.push({ name: itemName });

    li.remove(); // Remove the item from the list
  });

  // Save the cleaned-up items to localStorage
  localStorage.setItem("inventoryItems", JSON.stringify(checkedItems));
  saveData();

  // Show the modal instead of redirecting
  document.getElementById("transfer-modal").style.display = "block";
}

/* <----- Based off of w3schools How TO - Filter/Search List: https://www.w3schools.com/howto/howto_js_filter_lists.asp */

function myFunction() {
  // Declare variables
  var input, filter, ul, li, a, i, txtValue;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  ul = document.getElementById("list-container");
  li = ul.getElementsByTagName("li");

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("a")[0];
    txtValue = li[i].textContent || li[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}
/* <-------- end w3schools top navigation -------------> */
