const res = await axios.post('/api/auth/login', { email, password });
const login = async (email, password) => {
  try {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    return { success: true };
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || 'Login failed' };
  }
};