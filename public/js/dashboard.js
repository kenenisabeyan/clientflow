// =====================================
// ELEMENTS
// =====================================
const projectsDiv = document.getElementById("projects");
const logoutBtn = document.getElementById("logoutBtn");
const createForm = document.getElementById("createProjectForm");
const createMessage = document.getElementById("createMessage");

// =====================================
// AUTH CHECK
// =====================================
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

// =====================================
// PARSE JWT (GET USER ROLE)
// =====================================
function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = atob(base64Url);
  return JSON.parse(base64);
}

const userData = parseJwt(token);

// Hide create form if not admin
if (createForm && userData.role !== "admin") {
  createForm.style.display = "none";
}

// =====================================
// LOAD PROJECTS
// =====================================
async function loadProjects() {
  try {
    const res = await fetch("/api/projects", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const data = await res.json();

    if (!res.ok) {
      projectsDiv.innerHTML = "<p>Error loading projects</p>";
      return;
    }

    if (data.length === 0) {
      projectsDiv.innerHTML = "<p>No projects found.</p>";
      return;
    }

    projectsDiv.innerHTML = "";

    data.forEach(project => {
      renderProject(project);
    });

  } catch (error) {
    projectsDiv.innerHTML = "<p>Server error</p>";
  }
}

// =====================================
// RENDER SINGLE PROJECT
// =====================================

function renderProject(project) {
  const div = document.createElement("div");
  div.className = "project-card";

  div.innerHTML = `
    <h3>${project.title}</h3>
    <p>${project.description}</p>
    <p><strong>Status:</strong> ${project.status}</p>

    <hr>

    <h4>Comments</h4>
    ${
      project.comments && project.comments.length > 0
        ? project.comments.map(c => `<p>• ${c.text}</p>`).join("")
        : "<p>No comments yet.</p>"
    }

    <form class="commentForm">
      <input type="text" placeholder="Add comment..." required />
      <button class="btn primary">Comment</button>
    </form>
  `;

  projectsDiv.appendChild(div);
  handleCommentSubmit(div, project._id);
}

// =====================================
// COMMENT SUBMIT HANDLER
// =====================================
function handleCommentSubmit(div, projectId) {
  const commentForm = div.querySelector(".commentForm");

  commentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const text = commentForm.querySelector("input").value;

    try {
      const res = await fetch(`/api/projects/${projectId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ text })
      });

      if (res.ok) {
        loadProjects();
      }

    } catch (error) {
      console.log("Comment error");
    }
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
    const userId = document.getElementById("userId").value;

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ title, description, userId })
      });

      const data = await res.json();

      if (res.ok) {
        createMessage.textContent = "Project created!";
        createForm.reset();
        loadProjects();
      } else {
        createMessage.textContent = data.message;
      }

    } catch (error) {
      createMessage.textContent = "Server error.";
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
loadProjects();