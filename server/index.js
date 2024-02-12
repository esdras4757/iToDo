const express = require("express");
require('dotenv').config();
const app = express();
const port = process.env.PORT || 500; // Corrige el puerto
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/clients.js");
const categoryRoutes = require("./routes/categories.js");
const taskRoutes = require("./routes/tasks.js");
const noteRoutes = require("./routes/notes.js");
const utilsRoutes = require("./routes/utils.js");
const path = require('path');
const eventRoutes = require("./routes/events.js");
const reminderRoutes = require("./routes/reminders.js");
const openIaRoutes = require("./routes/openIa.js");
const { createServer } = require('http');
const { Server } = require("socket.io");

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors({
    origin: ['http://localhost:3000', 'https://i-to-do-esdras4757.vercel.app'], // Reemplaza con la URL de tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
app.use(express.json());
app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/note", noteRoutes);
app.use("/api/utils", utilsRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/reminder", reminderRoutes);
app.use('/api/openIaConnection', openIaRoutes);

// servidor ws
const server = createServer(app);
const io = new Server(server,{
  cors: {
    origins: ['http://localhost:3000', 'https://i-to-do-esdras4757.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
    console.log('a user has been connected');
    // Puedes manejar eventos aquí o en funciones separadas
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

mongoose.Promise = global.Promise;
mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => { console.log('conectado') })
  .catch((err) => { console.log(err) });

server.listen(port, () => {
  console.log("escuchando puerto", port);
});
