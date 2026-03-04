// ===============================
// ELEMENTS
// ===============================
const projectsDiv = document.getElementById("projects");
const logoutBtn = document.getElementById("logoutBtn");
const createForm = document.getElementById("createProjectForm");
const createMessage = document.getElementById("createMessage");

// ===============================
// AUTH CHECK
// ===============================
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

// ===============================
// LOAD PROJECTS
// ===============================
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
      const div = document.createElement("div");

      div.innerHTML = `
        <hr>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <p>Status: ${project.status}</p>

        <h4>Comments:</h4>
        <div>
          ${
            project.comments && project.comments.length > 0
              ? project.comments.map(c => `<p>- ${c.text}</p>`).join("")
              : "<p>No comments</p>"
          }
        </div>

        <form class="commentForm">
          <input type="text" placeholder="Add comment" required />
          <button type="submit">Comment</button>
        </form>
      `;

      projectsDiv.appendChild(div);

      // ===============================
      // COMMENT SUBMIT
      // ===============================
      const commentForm = div.querySelector(".commentForm");

      commentForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const text = commentForm.querySelector("input").value;

        try {
          const commentRes = await fetch(`/api/projects/${project._id}/comment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token
            },
            body: JSON.stringify({ text })
          });

          if (commentRes.ok) {
            loadProjects(); // reload projects to show new comment
          }

        } catch (error) {
          console.log("Comment error");
        }
      });
    });

  } catch (error) {
    projectsDiv.innerHTML = "<p>Server error</p>";
  }
}

// Load projects on page start
loadProjects();

// ===============================
// CREATE PROJECT
// ===============================
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

// ===============================
// LOGOUT
// ===============================
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});