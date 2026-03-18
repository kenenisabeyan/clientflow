document.addEventListener('DOMContentLoaded', async () => {
    // Load projects and calculate stats
    try {
        const { projects } = await API.get('/api/projects');
        const total = projects.length;
        const completed = projects.filter(p => p.status === 'completed').length;
        const inProgress = projects.filter(p => p.status === 'in-progress').length;
        const pending = projects.filter(p => p.status === 'pending').length;

        document.getElementById('totalProjects').textContent = total;
        document.getElementById('completedProjects').textContent = completed;
        document.getElementById('inProgressProjects').textContent = inProgress;
        document.getElementById('pendingProjects').textContent = pending;

        // Load recent activity
        const { activities } = await API.get('/api/activity?limit=10');
        const feed = document.getElementById('activityFeed');
        feed.innerHTML = activities.map(a => `
            <div class="activity-item">
                <div>
                    <strong>${a.user?.name || 'Unknown'}</strong> ${a.action}
                    ${a.project ? `in project <a href="/projects/${a.project._id}">${a.project.title}</a>` : ''}
                    <div class="activity-time">${new Date(a.timestamp).toLocaleString()}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
});