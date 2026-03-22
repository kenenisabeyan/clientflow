// common.js – loads user info from localStorage and sets UI elements
document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        // Set user name in header
        const userNameSpan = document.getElementById('user-name');
        if (userNameSpan) {
            userNameSpan.innerText = `${user.name} (${user.role})`;
        }
        // Show/hide admin-only links
        if (user.role !== 'admin') {
            const adminLinks = document.querySelectorAll('.admin-only');
            adminLinks.forEach(link => link.style.display = 'none');
        }
    } else {
        // No user – maybe show a guest view
        const userNameSpan = document.getElementById('user-name');
        if (userNameSpan) userNameSpan.innerText = 'Guest';
    }
});