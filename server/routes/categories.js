const express = require("express");
const router = express.Router();
const Category = require("../models/category");

router.post("/add", (req, res) => {
  try {
    const { name, idUser, styles } = req.body;
    const category = new Category();
    category.name = name;
    category.user = idUser;
    category.styles = styles;
    category
      .save()
      .then((data) => res.json(data))
      .catch((err) => res.json({ message: err }));
  } catch (error) {
    res.json({ message: err });
  }
});

router.get("/byIdUser/:id", (req, res) => {
    try {
    const userId = req.params.id;
      Category
        .find({user:userId})
        .then((data) =>{
          const dataFormat = data.map(element => {
                return {
                    idList:element.id,
                    name:element.name,
                    idUser:element.user,
                    styles:element.styles
                }
            });

            res.json(dataFormat)

        } 
        )
        .catch((err) => res.json({ message: err }));
    } catch (error) {
      res.json({ message: err });
    }
  });

  router.put("/update/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, styles } = req.body;
  
      // Busca la categoría por id y actualiza los campos
      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        { name: name, styles: styles },
        { new: true } // Este flag retorna el documento actualizado
      );
  
      if (!updatedCategory) {
        return res.status(404).json(
          { message: "No se encontró la categoría para actualizar" });
      }

        const dataFormat= {
            idList:updatedCategory.id,
            name:updatedCategory.name,
            idUser:updatedCategory.user,
            styles:updatedCategory.styles
        }
  
      res.json(dataFormat);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

module.exports = router;
