window.onload = function () {
  const addMemberModal = document.getElementById("add-member-modal");
  const addMemberBtn = document.getElementById("add-member-button");
  const closeMemberModal = addMemberModal.querySelector(".close");
  const memberListDiv = document.getElementById("member-list");

  const defaultMembers = [
    { name: "Wendy", allergies: ["Peanuts", "Shellfish"] },
    { name: "Terence", allergies: ["Milk"] },
    { name: "Anthony", allergies: ["Shellfish"] },
  ];

  // show modal
  addMemberBtn.onclick = () => (addMemberModal.style.display = "block");

  // close modal
  closeMemberModal.onclick = () => (addMemberModal.style.display = "none");

  window.onclick = (event) => {
    if (event.target == addMemberModal) {
      addMemberModal.style.display = "none";
    }
  };

  function renderMembers(members) {
    memberListDiv.innerHTML = "";
    members.forEach((member, index) => {
      const memberHTML = `
        <div class="member" data-index="${index}">
          <button class="delete-member">×</button>
          <div class="profile-pic"></div>
          <div class="user-info">
            <h3 class="member-name">${member.name}</h3>
            <p class="member-allergies">Allergies: ${member.allergies.join(
              ", "
            )}</p>
          </div>
        </div>`;
      memberListDiv.innerHTML += memberHTML;
    });

    // deleting members
    document.querySelectorAll(".delete-member").forEach((btn) => {
      btn.onclick = function () {
        const parent = btn.closest(".member");
        const index = parent.getAttribute("data-index");
        let members = JSON.parse(localStorage.getItem("members")) || [];

        members.splice(index, 1);
        localStorage.setItem("members", JSON.stringify(members));
        renderMembers(members);
      };
    });
  }

  function loadMembers() {
    const stored = localStorage.getItem("members");
    let members = [];

    if (stored) {
      members = JSON.parse(stored);
    } else {
      members = defaultMembers;
      localStorage.setItem("members", JSON.stringify(members));
    }

    renderMembers(members);
  }

  // allergy form
  document
    .getElementById("allergen-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const name = document.getElementById("name-text").value.trim();
      if (name === "") return;

      const selectedAllergens = Array.from(
        document.querySelectorAll('input[name="allergen"]:checked')
      ).map((checkbox) => checkbox.value);

      const newMember = { name, allergies: selectedAllergens };

      const members = JSON.parse(localStorage.getItem("members")) || [];
      members.push(newMember);
      localStorage.setItem("members", JSON.stringify(members));

      renderMembers(members);
      addMemberModal.style.display = "none";
      document.getElementById("name-text").value = "";
      document
        .querySelectorAll('input[name="allergen"]')
        .forEach((c) => (c.checked = false));
    });

  loadMembers();
};
