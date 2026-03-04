// =====================================
// ELEMENTS
// =====================================
const projectsDiv = document.getElementById("projects");
const logoutBtn = document.getElementById("logoutBtn");
const createForm = document.getElementById("createProjectForm");
const createMessage = document.getElementById("createMessage");
const adminSection = document.getElementById("adminSection");

// =====================================
// AUTH
// =====================================
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = atob(base64Url);
  return JSON.parse(base64);
}

const userData = parseJwt(token);

// Hide admin UI if not admin
if (userData.role !== "admin") {
  adminSection.style.display = "none";
  document.getElementById("adminMenu").style.display = "none";
}

// =====================================
// LOAD USERS (Admin Only)
// =====================================
async function loadUsers() {
  if (userData.role !== "admin") return;

  const res = await fetch("/api/users", {
    headers: { Authorization: "Bearer " + token }
  });

  const users = await res.json();
  const select = document.getElementById("assignedTo");

  select.innerHTML = users
    .filter(u => u.role === "user")
    .map(u => `<option value="${u._id}">${u.name}</option>`)
    .join("");
}

// =====================================
// LOAD PROJECTS
// =====================================
async function loadProjects() {
  const res = await fetch("/api/projects", {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();

  projectsDiv.innerHTML = "";

  // Stats
  document.getElementById("totalProjects").innerHTML =
    `<h3>Total</h3><p>${data.length}</p>`;

  document.getElementById("completedProjects").innerHTML =
    `<h3>Completed</h3><p>${data.filter(p => p.status === "Completed").length}</p>`;

  document.getElementById("pendingProjects").innerHTML =
    `<h3>Pending</h3><p>${data.filter(p => p.status === "Pending").length}</p>`;

  data.forEach(project => renderProject(project));
}

// =====================================
// RENDER PROJECT
// =====================================
function renderProject(project) {

  const div = document.createElement("div");
  div.className = "project-card";

  div.innerHTML = `
    <h3>${project.title}</h3>
    <p>${project.description}</p>
    <p><strong>Assigned To:</strong> ${project.assignedTo?.name || "Unknown"}</p>

    <p>
      <strong>Status:</strong>
      <select class="statusSelect">
        <option ${project.status === "Pending" ? "selected" : ""}>Pending</option>
        <option ${project.status === "In Progress" ? "selected" : ""}>In Progress</option>
        <option ${project.status === "Completed" ? "selected" : ""}>Completed</option>
      </select>
    </p>

    <hr>

    <h4>Files</h4>
    ${
      project.files?.length
        ? project.files.map(f =>
            `<p><a href="/uploads/${f}" target="_blank">${f}</a></p>`
          ).join("")
        : "<p>No files uploaded.</p>"
    }

    <form class="uploadForm">
      <input type="file" required />
      <button class="btn primary">Upload</button>
    </form>

    <hr>

    <h4>Comments</h4>
    ${
      project.comments?.length
        ? project.comments.map(c => `<p>• ${c.text}</p>`).join("")
        : "<p>No comments yet.</p>"
    }

    <form class="commentForm">
      <input type="text" placeholder="Add comment..." required />
      <button class="btn primary">Comment</button>
    </form>
  `;

  projectsDiv.appendChild(div);

  handleStatusUpdate(div, project._id);
  handleUpload(div, project._id);
  handleComment(div, project._id);
}

// =====================================
// STATUS UPDATE
// =====================================
function handleStatusUpdate(div, projectId) {
  const select = div.querySelector(".statusSelect");

  select.addEventListener("change", async () => {
    await fetch(`/api/projects/${projectId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ status: select.value })
    });
  });
}

// =====================================
// FILE UPLOAD
// =====================================
function handleUpload(div, projectId) {
  const uploadForm = div.querySelector(".uploadForm");

  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = uploadForm.querySelector("input");
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    await fetch(`/api/projects/${projectId}/upload`, {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: formData
    });

    loadProjects();
  });
}

// =====================================
// COMMENTS
// =====================================
function handleComment(div, projectId) {
  const form = div.querySelector(".commentForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const text = form.querySelector("input").value;

    await fetch(`/api/projects/${projectId}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ text })
    });

    loadProjects();
  });
}

// =====================================
// CREATE PROJECT
// =====================================
if (createForm) {
  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const assignedTo = document.getElementById("assignedTo").value;

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ title, description, assignedTo })
    });

    if (res.ok) {
      createMessage.textContent = "Project created!";
      createForm.reset();
      loadProjects();
    } else {
      createMessage.textContent = "Error creating project.";
    }
  });
}

// =====================================
// LOGOUT
// =====================================
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});

// =====================================
// INITIAL LOAD
// =====================================
loadUsers();
loadProjects();