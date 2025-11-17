window.onload = function () {
  const addWatcherModal = document.getElementById("add-watcher-modal");
  const addWatcherBtn = document.getElementById("add-watcher-button");
  const closeModalBtn = addWatcherModal.querySelector(".close");
  const watcherListDiv = document.getElementById("watcher-list");

  const defaultWatchers = [
    { name: "Natalie", relationship: "Anthony's Older Sister" },
  ];

  // open modal
  addWatcherBtn.onclick = () => {
    addWatcherModal.style.display = "block";
  };

  // close modal on x
  closeModalBtn.onclick = () => {
    addWatcherModal.style.display = "none";
  };

  // close modal when tap background
  window.onclick = function (event) {
    if (event.target == addWatcherModal) {
      addWatcherModal.style.display = "none";
    }
  };

  function renderWatchers(watchers) {
    watcherListDiv.innerHTML = "";
    watchers.forEach((watcher, index) => {
      const watcherHTML = `
        <div class="watcher" data-index="${index}">
          <button class="delete-watcher">×</button>
          <div class="profile-pic"></div>
          <div class="user-info">
            <h3 class="member-name">${watcher.name}</h3>
            <p class="member-allergies">${watcher.relationship}</p>
          </div>
        </div>`;
      watcherListDiv.innerHTML += watcherHTML;
    });

    // deleting watchers
    document.querySelectorAll(".delete-watcher").forEach((btn) => {
      btn.onclick = function () {
        const parent = btn.closest(".watcher");
        const index = parent.getAttribute("data-index");
        let watchers = JSON.parse(localStorage.getItem("watchers")) || [];

        watchers.splice(index, 1); // remove watcher
        localStorage.setItem("watchers", JSON.stringify(watchers)); // save updated list
        renderWatchers(watchers); // re-render
      };
    });
  }

  function loadWatchers() {
    const stored = localStorage.getItem("watchers");
    let watchers = [];

    if (stored) {
      watchers = JSON.parse(stored);
    } else {
      watchers = defaultWatchers;
      localStorage.setItem("watchers", JSON.stringify(watchers));
    }

    renderWatchers(watchers);
  }

  document.getElementById("add-watcher").onclick = function () {
    const name = document.getElementById("watcher-name-text").value.trim();
    const relationship = document
      .getElementById("relationship-text")
      .value.trim();

    if (name === "" || relationship === "") return;

    const newWatcher = { name, relationship };
    const watchers = JSON.parse(localStorage.getItem("watchers")) || [];
    watchers.push(newWatcher);
    localStorage.setItem("watchers", JSON.stringify(watchers));

    renderWatchers(watchers);
    addWatcherModal.style.display = "none";

    document.getElementById("watcher-name-text").value = "";
    document.getElementById("relationship-text").value = "";
  };

  loadWatchers();
};
