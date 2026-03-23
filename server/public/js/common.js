document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        // Update header user name
        const userNameSpan = document.getElementById('user-name');
        if (userNameSpan) {
            userNameSpan.innerText = `${user.name} (${user.role})`;
        }
        // Show admin links if user is admin
        if (user.role === 'admin') {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'block';
            });
        }
    } else {
        const userNameSpan = document.getElementById('user-name');
        if (userNameSpan) userNameSpan.innerText = 'Guest';
    }
});