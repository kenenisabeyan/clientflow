const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const validatePassword = (pwd) => pwd && pwd.length >= 6;

module.exports = { validateEmail, validatePassword };