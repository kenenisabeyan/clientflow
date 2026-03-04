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

document.getElementById("totalProjects").innerHTML =
  `<h3>Total</h3><p>${data.length}</p>`;

document.getElementById("completedProjects").innerHTML =
  `<h3>Completed</h3><p>${data.filter(p => p.status === "Completed").length}</p>`;

document.getElementById("pendingProjects").innerHTML =
  `<h3>Pending</h3><p>${data.filter(p => p.status === "Pending").length}</p>`;

  if (userData.role !== "admin") {
  document.getElementById("adminMenu").style.display = "none";
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


<h4>Files</h4>
${project.files && project.files.length > 0
  ? project.files.map(f => `<p><a href="/uploads/${f}" target="_blank">${f}</a></p>`).join("")
  : "<p>No files uploaded.</p>"
}

<form class="uploadForm" enctype="multipart/form-data">
  <input type="file" required />
  <button class="btn primary">Upload</button>
</form>



// =====================================
// COMMENT SUBMIT HANDLER
// =====================================

const uploadForm = div.querySelector(".uploadForm");

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = uploadForm.querySelector("input");
  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  await fetch(`/api/projects/${project._id}/upload`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token
    },
    body: formData
  });

  loadProjects();
});

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


//====================================
// backed route
//====================================
router.put("/:id/status", authMiddleware, async (req, res) => {
  const { status } = req.body;
  const project = await Project.findById(req.params.id);

  project.status = status;
  await project.save();

  res.json({ message: "Status updated" });
});

//====================================
// fronted handler
//====================================
const statusSelect = div.querySelector(".statusSelect");

statusSelect.addEventListener("change", async () => {
  await fetch(`/api/projects/${project._id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ status: statusSelect.value })
  });
});
// This is handled in the renderProject function where we add an event listener to the upload form for each project card.

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