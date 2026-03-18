// Simple validation helpers (can be expanded with Joi if needed)

const validateEmail = (email) => {
  const re = /^\S+@\S+\.\S+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateProjectInput = (title, clientId) => {
  const errors = [];
  if (!title || title.trim() === '') errors.push('Title is required');
  if (!clientId) errors.push('Client ID is required');
  return errors;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateProjectInput,
};