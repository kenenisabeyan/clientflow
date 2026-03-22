async function login(email, password) {
    try {
        const data = await API.post('/api/auth/login', { email, password });
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return { success: true, user: data.user };
    } catch (error) {
        return { success: false, message: error.message };
    }
}
async function register(name, email, password) {
    try {
        const data = await API.post('/api/auth/register', { name, email, password });
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return { success: true, user: data.user };
    } catch (error) {
        return { success: false, message: error.message };
    }
}
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token && !window.location.pathname.match(/^\/(login|register)$/)) {
        window.location.href = '/login';
    }
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); logout(); });
});
