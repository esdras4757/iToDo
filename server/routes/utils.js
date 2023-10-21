const express = require("express");
const router = express.Router();
const User = require("../models/cliente.js");
const nodemailer = require("nodemailer");
const Note = require("../models/notes.js");
const Task = require("../models/task.js");
const Event = require("../models/event.js");
const http = require("http");
const Reminder = require("../models/reminder.js");
const { error } = require("console");
const { Server } = require("socket.io");
const server = http.createServer(router);
const schedule = require("node-schedule");
const moment = require("moment-timezone");

moment.tz.setDefault("America/Mexico_City");

const getTaskSatus = (task)=>{
  return task.isCompleted===true?'Completada':
  moment().isSameOrAfter(moment(task.initAt, 'DD/MM/YYYY HH:mm')) && 
  moment().isBefore(moment(task.endAt, 'DD/MM/YYYY HH:mm'))?
  'En curso': 
  moment().isBefore(moment(task.initAt, 'DD/MM/YYYY HH:mm')) && 
  moment().isBefore(moment(task.endAt, 'DD/MM/YYYY HH:mm'))?
  'pendiente'
  :'No completada'
}
const getStyletSatus = (status)=>{
 switch (status) {
  case 'Completada':
    return 'blue'
    break;
    case 'En curso':
      return '#0093c7'
    break;
    case 'pendiente':
      return 'grey'
    break;
    case 'No completada':
      return 'red'
    break;
  default:
    break;
 }
}

const PORT = 5500;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: "https://i-to-do-esdras4757.vercel.app", // Dirección de tu aplicación Next.js
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Un usuario se ha conectado");

  // Evento personalizado (puedes agregar tantos como quieras)
  socket.on("miEvento", (data) => {
    console.log(data);
  });

  socket.on("disconnect", () => {
    console.log("Un usuario se ha desconectado");
  });
});

function convertToISODate(reminderString) {
  // Verificar que la cadena esté definida y no sea vacía
  if (!reminderString || reminderString.trim() === "") {
    return null; // O manejar el caso de cadena no válida de acuerdo a tus necesidades
  }

  const [datePart, timePart] = reminderString.split(" ");

  // Verificar que se hayan obtenido las partes de fecha y hora correctamente
  if (!datePart || !timePart) {
    return null; // O manejar el caso de cadena no válida de acuerdo a tus necesidades
  }

  const [day, month, year] = datePart.split("/");
  const [hours, minutes] = timePart.split(":");
  const isoDateString = `${year}-${month}-${day}T${hours}:${minutes}:00.000Z`;
  return isoDateString;
}

const job = schedule.scheduleJob("* * * * *", async () => {
  const now = moment().startOf('minute'); // Redondea al minuto más cercano

  const noteReminders = await Note.find({
    reminder: {
      $exists: true,
    },
  });

  if (noteReminders) {
    const notesToSend = noteReminders.filter((note) => {
      if (note.reminder) {
        const noteMoment = moment(note.reminder, "DD/MM/YYYY HH:mm");
        return noteMoment.isSame(now);
      }
      return false;
    });

    notesToSend.forEach(note => {
      console.log("Alert for note:", note);
      io.emit("alert", note);
    });
  }

  const taskReminders = await Task.find({
    reminder: {
      $exists: true,
    },
  });

  if (taskReminders) {
    const tasksToSend = taskReminders.filter((task) => {
      if (task.reminder) {
        const taskMoment = moment(task.reminder, "DD/MM/YYYY HH:mm");
        return taskMoment.isSame(now);
      }
      return false;
    });

    tasksToSend.forEach(task => {
      console.log("Alert for task:", task);
      io.emit("alert", task);
    });
  }


 const eventReminders = await Event.find({
    reminder: {
      $exists: true,
    },
  });

  if (eventReminders) {
    const eventsToSend = eventReminders.filter((event) => {
      if (event.reminder) {
        const eventMoment = moment(event.reminder, "DD/MM/YYYY HH:mm");
        return eventMoment.isSame(now);
      }
      return false;
    });

    eventsToSend.forEach(event => {
      console.log("Alert for event:", event);
      io.emit("alert", event);
    });
  }

  const reminders = await Reminder.find({
    reminder: {
      $exists: true,
    },
  });

  if (reminders) {
    const remindersToSend = reminders.filter((reminder) => {
      if (reminder.reminder) {
        const reminderMoment = moment(reminder.reminder, "DD/MM/YYYY HH:mm");
        return reminderMoment.isSame(now);
      }
      return false;
    });

    remindersToSend.forEach(reminder => {
      console.log("Alert for reminder:", reminder);
      io.emit("alert", reminder);
    });
  }


});

router.post("/sendEmail", async (req, res) => {
  const { to, title, userid, content } = req.body;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: "itodo.services@gmail.com",
      pass: "hailaxkqdhngzfam",
    },
  });

  const user = await User.findOne({ _id: userid });

  if (!user) {
    return res.status(400).send("Usuario no encontrado");
  }

  const mailOptions = {
    from: "itodo@services.com",
    to: to,
    subject: `${user.nombre} ah compartido una nota contigo`,
    html: `<h1>${title}</h1> <div>${content}</div>`,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/getAllEventsByIdUser/:id", async (req, res) => {
  try {
    const taskReminders = (
      await Task.find({ userId: req.params.id }, [
        "initAt",
        "endAt",
        "title",
        "_id",
        "reminder",
        "type",
        "note",
        "color",
        "description",
      ])
    ).filter(
      (task) =>
        (task.initAt !== null && task.initAt !== "") ||
        (task.endAt !== null && task.endAt !== "")
    );

    const noteReminders = (
      await Note.find({ userId: req.params.id }, [
        "initAt",
        "endAt",
        "title",
        "_id",
        "reminder",
        "type",
        "note",
        "color",
        "description",
      ])
    ).filter(
      (note) =>
        (note.initAt !== null && note.initAt !== "") ||
        (note.endAt !== null && note.endAt !== "")
    );

    const EventReminders = (
      await Event.find({ userId: req.params.id }, [
        "initAt",
        "endAt",
        "title",
        "_id",
        "reminder",
        "type",
        "note",
        "color",
        "description",
      ])
    ).filter(
      (event) =>
        (event.initAt !== null && event.initAt !== "") ||
        (event.endAt !== null && event.endAt !== "")
    );

    const allReminders = taskReminders
      .map((task) => ({
        type: "task",
        id: task._id,
        title: task.title,
        initAt: task.initAt,
        endAt: task.endAt,
        reminder: task.reminder,
        note: task.note,
        color: task.color,
        description: task.description,
      }))
      .concat(
        noteReminders.map((note) => ({
          type: "note",
          id: note._id,
          title: note.title,
          initAt: note.initAt,
          endAt: note.endAt,
          reminder: note.reminder,
          note: note.note,
          color: note.color,
          description: note.description,
        }))
      )
      .concat(
        EventReminders.map((event) => ({
          type: event.type,
          id: event._id,
          title: event.title,
          initAt: event.initAt,
          endAt: event.endAt,
          reminder: event.reminder,
          note: event.note,
          color: event.color,
          description: event.description,
        }))
      );

    res.send(allReminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/updateEventById/:id", async (req, res) => {
  const id = req.params.id;
  const camposParaEditar = req.body;

  try {
    // Intenta actualizar en Notas
    let resultado = await Note.findByIdAndUpdate(
      { _id: id },
      camposParaEditar,
      { new: true }
    );

    if (resultado) {
      return res.json({ ...resultado.toObject(), type: "note" });
    }

    // Intenta actualizar en Tareas
    resultado = await Task.findByIdAndUpdate(id, camposParaEditar, {
      new: true,
    });

    if (resultado) {
      return res.json({ ...resultado.toObject(), type: "task" });
    }

    // Intenta actualizar en Eventos
    resultado = await Event.findByIdAndUpdate(id, camposParaEditar, {
      new: true,
    });

    if (resultado) {
      return res.json({ ...resultado.toObject(), type: "event" });
    }

    // Si no se encontró el ID en ninguna colección
    return res
      .status(404)
      .json({ message: "ID no encontrado en ninguna colección" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al editar", error });
  }
});

router.get("/allRemindersByIdUser/:id", async (req, res) => {
  try {
    const notes = (
      await Note.find({ userId: req.params.id }, [
        "reminder",
        "_id",
        "userId",
        "content",
        "title",
      ])
    ).filter((note) => note.reminder !== null && note.reminder !== "" && moment(note.reminder,'DD/MM/YYYY HH:mm').isAfter(moment()));

    const tasks = (
      await Task.find({ userId: req.params.id }, [
        "reminder",
        "_id",
        "userId",
        "description",
        "title",
      ])
    ).filter((task) => task.reminder !== null && task.reminder !== "" && moment(task.reminder,'DD/MM/YYYY HH:mm').isAfter(moment()));

    const events = (
      await Event.find({ userId: req.params.id }, [
        "reminder",
        "_id",
        "userId",
        "description",
        "title",
      ])
    ).filter((event) => event.reminder !== null && event.reminder !== "" && moment(event.reminder,'DD/MM/YYYY HH:mm').isAfter(moment()));

    const reminders = (
      await Reminder.find({ userId: req.params.id }, [
        "reminder",
        "_id",
        "userId",
        "description",
        "title",
        "type",
      ])
    ).filter(
      (reminder) => reminder.reminder !== null && reminder.reminder !== "" && moment(reminder.reminder,'DD/MM/YYYY HH:mm').isAfter(moment())
    );

    const allReminders = tasks
      .map((task) => ({
        type: "task",
        _id: task._id,
        userId: task.userId,
        title: task.title,
        reminder: task.reminder,
        description: task.description,
      }))
      .concat(
        notes.map((note) => ({
          type: "note",
          _id: note._id,
          userId: note.userId,
          title: note.title,
          reminder: note.reminder,
          description: note.content,
        }))
      )
      .concat(
        reminders.map((reminder) => ({
          type: reminder.type,
          _id: reminder._id,
          title: reminder.title,
          userId: reminder.userId,
          reminder: reminder.reminder,
          description: reminder.description,
        }))
      )
      .concat(
        events.map((event) => ({
          type: 'event',
          _id: event._id,
          title: event.title,
          userId: event.userId,
          reminder: event.reminder,
          description: event.description,
        }))
      );

    res.send(allReminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/updateReminderById/:id", async (req, res) => {
  const id = req.params.id;
  const camposParaEditar = req.body;

  try {
    // Intenta actualizar en Notas
    let resultado = await Note.findByIdAndUpdate(
      { _id: id },
      camposParaEditar,
      { new: true }
    );

    if (resultado) {
      return res.json({ ...resultado.toObject(), type: "note" });
    }

    // Intenta actualizar en Tareas
    resultado = await Task.findByIdAndUpdate(id, camposParaEditar, {
      new: true,
    });

    if (resultado) {
      return res.json({ ...resultado.toObject(), type: "task" });
    }

    // Intenta actualizar en Eventos
    resultado = await Reminder.findByIdAndUpdate(id, camposParaEditar, {
      new: true,
    });

    if (resultado) {
      return res.json({ ...resultado.toObject(), type: "reminder" });
    }

    resultado = await Event.findByIdAndUpdate(id, camposParaEditar, {
      new: true,
    });

    if (resultado) {
      return res.json({ ...resultado.toObject(), type: "event" });
    }

    // Si no se encontró el ID en ninguna colección
    return res
      .status(404)
      .json({ message: "ID no encontrado en ninguna colección" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al editar", error });
  }
});

router.post("/postponedById/:id", async (req,res)=>{
  
});

router.get("/getAllTaskInProgress/:id", async (req, res) => {
  try {
    const taskReminders = (
      await Task.find({ userId: req.params.id }, [
        "initAt",
        "endAt",
        "title",
        "_id",
        "reminder",
        "type",
        "note",
        "color",
        "description",
        "priority",
        "stylePriority",
        "status"
      ])
    ).filter(
      (task) =>
        task.initAt !== null &&
        task.initAt !== "" &&
        task.endAt !== null &&
        task.endAt !== "" &&
        moment().isSameOrAfter(moment(task.initAt, 'DD/MM/YYYY HH:mm')) && 
        moment().isBefore(moment(task.endAt, 'DD/MM/YYYY HH:mm'))
    );

    const tasksWithCategoryName = taskReminders.map(task => ({
      ...task.toObject(),
       status:getTaskSatus(task),
       styleStatus:getStyletSatus(getTaskSatus(task)),
      categoryName: task.categoryId ? task.categoryId.name : null,
    }));

    res.send(tasksWithCategoryName);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/getAllNotesInProgress/:id", async (req, res) => {
  try {
    const taskReminders = (
      await Note.find({ userId: req.params.id }, [
        "initAt",
        "endAt",
        "title",
        "_id",
        "reminder",
        "type",
        "note",
        "color",
        "description",
        "createdAt",
        "updatedAt",
        "isImportant",
      ])
    ).filter(
      (note) =>
        note.initAt !== null &&
        note.initAt !== "" &&
        note.endAt !== null &&
        note.endAt !== "" &&
        moment().isSameOrAfter(moment(note.initAt, 'DD/MM/YYYY')) && 
        moment().isBefore(moment(note.endAt, 'DD/MM/YYYY'))
    );
    res.send(taskReminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
