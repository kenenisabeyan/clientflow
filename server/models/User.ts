const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'client', 'developer'], default: 'client' },
  phone: { type: String, default: '' },
  company: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Pending', 'Inactive'], default: 'Active' },
}, { timestamps: true });

// Role indexing for directory lookups and RBAC scoping
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);