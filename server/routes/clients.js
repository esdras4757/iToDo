const express = require("express");
const router = express.Router();
const User = require("../models/cliente.js");
const bcrypt = require("bcrypt");

router.post("/add", (req, res) => {
  console.log(req.body);
  const newClient = new User(req.body);

  newClient
    .save()
    .then((data) => res.json(data))
    .catch((err) => res.json({ message: err }));
});

router.post("/byId", async (req, res) => {
  try {
    console.log(req.body);
    const { id } = req.body;
    const usera = await User.findById(id)

    if (!usera) {
      return res
        .status(400)
        .json({
          message:
            "Ah ocurrido un error al obtener la informacion del usuario. Intente de nuevo mas tarde",
        });
    }

    const userInfo = {
      id: usera._id,
      correo: usera.correo,
      nombre: usera.nombre,
      apellido: usera.apellido,
      edad: usera.edad,
      telefono: usera.telefono,
    };

    res.json(userInfo);
  } catch (error) {
    res
      .status(400)
      .json({
        message: "Ah ocurrido un error al obtener la informacion del usuario.",
      });
  }
});

router.post("/login", async (req, res) => {
  console.log(req.body);
  const { identifier, pass } = req.body;
  const user = await User.findOne({
    $or: [{ correo: identifier }, { nombre: identifier }],
  });

  if (!user) {
    return res.status(400).json({ message: "Usuario no registrado" });
  }

  const validPassword = await bcrypt.compare(pass, user.pass);

  if (!validPassword) {
    return res.status(400).json({ message: "Contraseña incorrecta" });
  }

  const userInfo = {
    id: user._id,
    correo: user.correo,
    nombre: user.nombre,
    apellido: user.apellido,
    edad: user.edad,
    telefono: user.telefono,
  };

  res.json(userInfo);
});

module.exports = router;
