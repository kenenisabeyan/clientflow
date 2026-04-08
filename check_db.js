const mongoose = require("./server/node_modules/mongoose");

mongoose.connect("mongodb://localhost:27017/clientflow").then(async () => {
    console.log("Connected to DB");
    const db = mongoose.connection.db;
    const users = await db.collection("users").find({}).toArray();
    console.log("Users:", users.map(u => ({ email: u.email, role: u.role, status: u.status, password: !!u.password })));
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
