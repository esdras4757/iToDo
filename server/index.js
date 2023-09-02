const express = require("express")
require('dotenv').config();;
const app = express();
const port = process.env.PORT || 5000;
const cores = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/clients.js");
const categoryRoutes = require("./routes/categories.js");
const taskRoutes = require("./routes/tasks.js");
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cores());
app.use(express.json());
app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/task",taskRoutes)

mongoose.Promise = global.promise;
mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {console.log('conectado')})
  .catch((err) => {console.log(err)});

app.listen(port, () => {
  console.log("escuchando puerto", port);
});
