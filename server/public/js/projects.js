document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { projects } = await API.get('/api/projects');
        const grid = document.getElementById('projectGrid');
        grid.innerHTML = projects.map(p => `
            <div class="project-card" onclick="window.location.href='/projects/${p._id}'">
                <h3>${p.title}</h3>
                <p>${p.description || 'No description'}</p>
                <span class="status-badge ${p.status}">${p.status}</span>
                <div>Client: ${p.client?.name || 'Unknown'}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load projects:', error);
    }
});