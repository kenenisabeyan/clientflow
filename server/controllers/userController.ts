const User = require('../models/User');
const Project = require('../models/Project');

exports.getUsers = async (req, res, next) => {
  try {
    const { role, status } = req.query;
    const filter: any = {};
    if (role) filter.role = role;
    if (status && status !== 'all') filter.status = status;

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) { next(err); }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Also fetch associated projects for this client
    const projects = await Project.find({ client: user._id }).select('title status createdAt');
    
    res.json({ success: true, user, projects });
  } catch (err) { next(err); }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, company, status, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const newUser = await User.create({
      name,
      email,
      password: password || '12345678',
      phone: phone || '+1 555-0100',
      company: company || 'Independent Client',
      status: status || 'Active',
      role: role || 'client'
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({ success: true, user: userObj });
  } catch (err) { next(err); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, company, status, role } = req.body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (company !== undefined) updateData.company = company;
    if (status !== undefined) updateData.status = status;
    if (role !== undefined) updateData.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['client', 'admin', 'developer'].includes(role)) return res.status(400).json({ success: false, message: 'Invalid role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
};
