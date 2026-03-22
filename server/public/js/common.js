document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        // Update user name in header
        const userNameSpan = document.getElementById('user-name');
        if (userNameSpan) {
            userNameSpan.innerText = `${user.name} (${user.role})`;
        }
        // Show admin links if user is admin
        if (user.role === 'admin') {
            const adminLinks = document.querySelectorAll('.admin-only');
            adminLinks.forEach(link => link.style.display = 'block');
        }
    } else {
        // No user – maybe show guest text
        const userNameSpan = document.getElementById('user-name');
        if (userNameSpan) userNameSpan.innerText = 'Guest';
    }
});