document.addEventListener('DOMContentLoaded', async () => {
    const projectId = document.getElementById('projectDetail').dataset.projectId;
    const user = JSON.parse(localStorage.getItem('user'));

    async function loadProject() {
        try {
            const { project } = await API.get(`/api/projects/${projectId}`);
            document.getElementById('projectTitle').textContent = project.title;
            document.getElementById('projectDescription').textContent = project.description || 'No description';
            document.getElementById('projectStatus').textContent = project.status;
            document.getElementById('projectStatus').className = `status-badge ${project.status}`;

            // Comments
            const commentList = document.getElementById('commentList');
            commentList.innerHTML = project.comments.map(c => `
                <div class="comment">
                    <strong>${c.user.name}</strong> (${c.user.role}): ${c.text}
                    <div class="comment-time">${new Date(c.createdAt).toLocaleString()}</div>
                </div>
            `).join('');

            // Files
            const fileList = document.getElementById('fileList');
            fileList.innerHTML = project.files.map(f => `
                <div class="file-item">
                    <a href="/api/projects/${projectId}/files/${encodeURIComponent(f.filename)}" download>${f.filename}</a>
                    <span>Uploaded by ${f.uploadedBy?.name || 'Unknown'}</span>
                </div>
            `).join('');

            // Activity
            const activityLog = document.getElementById('activityLog');
            activityLog.innerHTML = project.activityLogs.map(a => `
                <div class="activity-item">
                    <div><strong>${a.user?.name || 'Unknown'}</strong> ${a.action}</div>
                    <div class="activity-time">${new Date(a.timestamp).toLocaleString()}</div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Failed to load project:', error);
        }
    }

    await loadProject();

    // Post comment
    document.getElementById('commentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = e.target.querySelector('textarea').value;
        try {
            await API.post('/api/comments', { text, projectId });
            e.target.reset();
            loadProject(); // reload comments
        } catch (error) {
            alert(error.message);
        }
    });

    // Upload file
    document.getElementById('uploadForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fileInput = e.target.querySelector('input[type="file"]');
        const file = fileInput.files[0];
        if (!file) return;

        try {
            await API.upload(`/api/projects/${projectId}/files`, file);
            fileInput.value = '';
            loadProject(); // reload files
        } catch (error) {
            alert(error.message);
        }
    });
});