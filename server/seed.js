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

    console.log('\nSeeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
