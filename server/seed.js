require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('MONGO_URI is not set in environment or .env file');
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'client', 'developer'], default: 'client' },
  },
  { timestamps: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    files: [
      {
        filename: String,
        path: String,
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    activityLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    project: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['todo', 'inProgress', 'done'], default: 'todo' },
    date: { type: String, required: true },
    avatar: { type: String, default: 'U' },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['Paid', 'Pending', 'Overdue', 'Draft'], default: 'Pending' },
  dueDate: { type: String, required: true },
  issueDate: { type: String, default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
  items: [{ description: String, quantity: Number, rate: Number, amount: Number }],
  notes: { type: String, default: '' }
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
  channel: { type: String, default: 'general' },
  content: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true });

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully!');

    const rawUsers = [
      { name: 'Kenenisa Beyan', email: 'kenenisa@gmail.com', password: '123456', role: 'admin' },
      { name: 'Beyan Kenenisa', email: 'beyankenenisa@gmail.com', password: '12345678', role: 'admin' },
      { name: 'Delelegn', email: 'delelegn@gmail.com', password: '12345678', role: 'client' },
      { name: 'Kidane', email: 'kidane@gmail.com', password: '12345678', role: 'developer' },
      { name: 'Test User', email: 'testuser@example.com', password: 'password123', role: 'client' },
    ];

    const seededUsers = {};
    for (const u of rawUsers) {
      const existing = await User.findOne({ email: u.email });
      if (!existing) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(u.password, salt);
        const created = await User.create({
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role,
        });
        console.log(`Created user: ${u.email} (${u.role})`);
        seededUsers[u.email] = created;
      } else {
        console.log(`User already exists: ${u.email}`);
        seededUsers[u.email] = existing;
      }
    }

    const clientUser = seededUsers['delelegn@gmail.com'] || seededUsers['testuser@example.com'];
    if (clientUser) {
      const existingProjects = await Project.countDocuments();
      if (existingProjects === 0) {
        await Project.create([
          {
            title: 'Website Redesign',
            description: 'Redesign client portal and landing page with modern responsive theme',
            status: 'in-progress',
            client: clientUser._id,
          },
          {
            title: 'Mobile App API',
            description: 'Develop REST endpoints and authentication flow for iOS and Android',
            status: 'pending',
            client: clientUser._id,
          },
          {
            title: 'SEO & Analytics Optimization',
            description: 'Setup Google Tag Manager and optimize Core Web Vitals',
            status: 'completed',
            client: clientUser._id,
          },
        ]);
        console.log('Created sample projects.');
      } else {
        console.log(`${existingProjects} project(s) already exist.`);
      }
    }

    const existingTasks = await Task.countDocuments();
    if (existingTasks === 0) {
      await Task.create([
        {
          title: 'Design high-fidelity dashboard mockups',
          project: 'Website Redesign',
          priority: 'High',
          status: 'inProgress',
          date: 'Nov 18, 2026',
          avatar: 'K',
        },
        {
          title: 'Implement JWT refresh tokens',
          project: 'Mobile App API',
          priority: 'High',
          status: 'todo',
          date: 'Nov 20, 2026',
          avatar: 'D',
        },
        {
          title: 'Verify Lighthouse score >= 95',
          project: 'SEO & Analytics Optimization',
          priority: 'Medium',
          status: 'done',
          date: 'Nov 15, 2026',
          avatar: 'B',
        },
      ]);
      console.log('Created sample tasks.');
    } else {
      console.log(`${existingTasks} task(s) already exist.`);
    }

    // Invoices
    if (clientUser) {
      const existingInvoices = await Invoice.countDocuments();
      if (existingInvoices === 0) {
        await Invoice.create([
          {
            invoiceNumber: 'INV-2026-0001',
            client: clientUser._id,
            amount: 5000,
            status: 'Paid',
            dueDate: 'Nov 30, 2026',
            items: [{ description: 'Full-Stack Portal Development Milestone 1', quantity: 1, rate: 5000, amount: 5000 }],
            notes: 'Thank you for your business. Payment received via Stripe wire transfer.'
          },
          {
            invoiceNumber: 'INV-2026-0002',
            client: clientUser._id,
            amount: 3200,
            status: 'Pending',
            dueDate: 'Dec 15, 2026',
            items: [{ description: 'Mobile App API & OAuth Security Audit', quantity: 1, rate: 3200, amount: 3200 }],
            notes: 'Milestone 2 deliverable invoice.'
          }
        ]);
        console.log('Created sample invoices.');
      } else {
        console.log(`${existingInvoices} invoice(s) already exist.`);
      }
    }

    // Messages
    const adminUser = seededUsers['kenenisa@gmail.com'];
    if (adminUser && clientUser) {
      const existingMessages = await Message.countDocuments();
      if (existingMessages === 0) {
        await Message.create([
          {
            sender: adminUser._id,
            recipient: clientUser._id,
            channel: 'direct',
            content: 'Hello Delelegn, welcome to ClientFlow ERP! Your Website Redesign milestone is on track.'
          },
          {
            sender: clientUser._id,
            recipient: adminUser._id,
            channel: 'direct',
            content: 'Thank you Kenenisa! The dashboard looks fantastic. Let us know when the mobile API is ready for review.'
          },
          {
            sender: adminUser._id,
            channel: 'general',
            content: 'Team announcement: All sprint tasks and deliverables are now synced with MongoDB Atlas.'
          }
        ]);
        console.log('Created sample messages.');
      } else {
        console.log(`${existingMessages} message(s) already exist.`);
      }
    }

    console.log('\nSeeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
