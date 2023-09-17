const express = require("express");
const router = express.Router();
const User = require("../models/cliente.js");
const nodemailer = require('nodemailer');
const Note = require("../models/notes.js");
const Task = require("../models/task.js");
const Event = require("../models/event.js");
const { error } = require("console");

router.post("/sendEmail", async (req, res) => {
  const { to, title, userid,content } = req.body;

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


router.get('/getAllEventsByIdUser/:id', async (req, res) => {

  try {
    const taskReminders = (await Task.find({ userId: req.params.id }, ['initAt', 'endAt', 'title', '_id', 'reminder','type','note','color','description']))
  .filter(task => (task.initAt !== null && task.initAt !== '') || (task.endAt !== null && task.endAt !== ''));

  const noteReminders = (await Note.find({ userId: req.params.id }, ['initAt', 'endAt', 'title', '_id', 'reminder','type','note','color','description']))
  .filter(note => (note.initAt !== null && note.initAt !== '') || (note.endAt !== null && note.endAt !== ''));

  const EventReminders = (await Event.find({ userId: req.params.id }, ['initAt', 'endAt', 'title', '_id', 'reminder','type','note','color','description']))
  .filter(event => (event.initAt !== null && event.initAt !== '') || (event.endAt !== null && event.endAt !== ''));

    const allReminders = taskReminders.map(task => ({
      type: 'task',
      id: task._id,
      title: task.title,
      initAt: task.initAt,
      endAt: task.endAt,
      reminder:  task.reminder,
      note:task.note,
      color:task.color,
      description:task.descripton
    
    })).concat(
      noteReminders.map(note => ({
        type: 'note',
        id: note._id,
        title: note.title,
        initAt: note.initAt,
        endAt: note.endAt,
        reminder:  note.reminder,
        note:note.note,
        color:note.color,
        description:note.descripton
      }))
    ).concat(
      EventReminders.map(event => ({
        type: event.type,
        id: event._id,
        title: event.title,
        initAt: event.initAt,
        endAt: event.endAt,
        reminder:  event.reminder,
        note:event.note,
        color:event.color,
        description:event.description
      }))
    )

    res.send(allReminders);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/updateEventById/:id', async (req, res) => {
  const id = req.params.id;
  const camposParaEditar = req.body;

  try {
    // Intenta actualizar en Notas
    let resultado = await Note.findByIdAndUpdate({ _id: id }, camposParaEditar, { new: true });

    
    if (resultado) {
      return res.json( {...resultado.toObject(),type:'note'} );
    }

    // Intenta actualizar en Tareas
    resultado = await Task.findByIdAndUpdate(id, camposParaEditar, { new: true });
    
    if (resultado) {
      return res.json({...resultado.toObject(),type:'task'} );
    }

    // Intenta actualizar en Eventos
    resultado = await Event.findByIdAndUpdate(id, camposParaEditar, { new: true });
    
    if (resultado) {
      return res.json({...resultado.toObject(),type:'event'});
    }

    // Si no se encontró el ID en ninguna colección
    return res.status(404).json({ message: 'ID no encontrado en ninguna colección' });
    
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error al editar', error });
  }
});


router.get('/allRemaindersByIdUser/:id', async (req,res)=>{
  try {
    const notesCoinciences= await Note.find({idUser:req.params.id},['reminder','_id','idUser','description'])
    console.log(notesCoinciences)
  } catch (error) {
    res.status(500).json({error:error.message})
  }
})


module.exports = router;
