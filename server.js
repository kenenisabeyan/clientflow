require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express(); // 👈 app created here

// Middleware
app.use(express.json());

// ✅ PUT THIS AFTER app is created
app.use("/uploads", express.static("uploads"));

// Routes
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));