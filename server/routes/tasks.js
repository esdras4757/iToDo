const express = require("express");
const Task = require("../models/task");
const router = express.Router();
const multer = require("multer");
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the destination folder for the uploaded files
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Set the file name
    const id=Date.now()
    const ext = path.extname(file.originalname); // obtener la extensión del archivo original
    const originalNameWithoutExt = path.basename(file.originalname, ext);
    cb(null, originalNameWithoutExt + "-" + id + ext);
    file.id=id
    },
});

const upload = multer({ storage: storage });

router.post("/add", upload.single("file"), async (req, res) => {
  try {
    const {
      title,
      idStatus,
      description,
      reminder,
      isImportant,
      initAt,
      endAt,
      note,
      userId,
      categoryId
    } = req.body;

    const addData={
      title,
      idStatus,
      description,
      reminder,
      initAt,
      isCompleted:false,
      endAt,
      note,
      userId,
      fileId: req.file && req.file.id,
      originalFileName: req.file && req.file.originalname,
    }

    if (categoryId && categoryId !== "") {
      addData.categoryId = categoryId;
    }
    if (isImportant && isImportant !== "") {
      addData.isImportant = isImportant;
    }

    const task = new Task(addData);
    await task.save();

    const populatedTask = await Task.findById(task._id).populate('categoryId', 'name');

    const taskObject = populatedTask.toObject();

    taskObject.categoryName = populatedTask.categoryId ? populatedTask.categoryId.name : null;

    res.send(taskObject);
  } catch (error) {
    res.json({ message: error });
  }
});

router.put("/update/:id",upload.single("file"), async (req, res) => {

  const {id}=req.params

  const {
    title,
    idStatus,
    description,
    reminder,
    initAt,
    endAt,
    note,
    userId,
    categoryId,
    isCompleted,
  } = req.body;


  console.log(req.file)

  let updateData = {
    title: title,
    idStatus,
    description,
    reminder,
    initAt,
    endAt,
    note,
    userId,
    fileId: req.file && req.file.id,
    originalFileName: req.file && req.file.originalname,
    color:req.body.color
  };
  

  if (categoryId && categoryId !== "") {
    updateData.categoryId = categoryId;
  }

  if (isCompleted && isCompleted !== "") {
    updateData.isCompleted = isCompleted;
  }

  try {
    const task = await Task.findByIdAndUpdate({ _id: id }, updateData, { new: true })
        .populate('categoryId', 'name');

    // Convertir el documento Mongoose a un objeto regular de JavaScript
    const taskObject = task.toObject();

    // Ahora, puedes agregar la propiedad categoryName al objeto
    taskObject.categoryName = task.categoryId ? task.categoryId.name : null;

    res.send(taskObject);
} catch (error) {
    res.json({ message: error });
}
})

router.put("/status", async (req, res) => {

  const {status,idTask}=req.body
  try {
    const task=await Task.findByIdAndUpdate(idTask,status)
    res.send(task);
    
  } catch (error) {
    res.json({ message: 'ah ocurrido un error intentalo de nuevo o verifica tu conexion a internet' });
  }
})

router.get("/getbyid/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    // Convertir el documento Mongoose a un objeto regular de JavaScript
    const taskObject = task.toObject();
    // Ahora, agrega la propiedad fileURL al objeto
    if (task.fileId) {
      const ext = path.extname(task.originalFileName); // obtener la extensión del archivo original
      const originalNameWithoutExt = path.basename(task.originalFileName, ext);
      taskObject.fileURL = `http://localhost:5000/uploads/${originalNameWithoutExt}-${task.fileId}${ext}`;
    }

    // Y envía ese objeto como respuesta
    res.send(taskObject);
  } catch (error) {
    console.log(error)
    res.json({ message: 'ah ocurrido un error intentalo de nuevo o verifica tu conexion a internet' });
  }
})

router.get("/getByIdUser/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tasks = await Task.find({ userId: id }).populate('categoryId', 'name');
    
    // Transforma los resultados para obtener el nombre de la categoría en la propiedad categoryName
    const tasksWithCategoryName = tasks.map(task => ({
      ...task.toObject(),
      categoryName: task.categoryId ? task.categoryId.name : null,
    }));
    
    res.send(tasksWithCategoryName);
  } catch (error) {
    console.error(error);
    res.json({ message: 'Ha ocurrido un error, inténtalo de nuevo o verifica tu conexión a internet' });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    res.send(task);
  } catch (error) {
    res.json({ message: 'Ha ocurrido un error, inténtalo de nuevo o verifica tu conexión a internet' });
  }

})

router.get("/getImportantByIdUser/:id",async (req,res)=>{
   try {
    const { id } = req.params;
    const tasks = await Task.find({ userId: id,isImportant:true  }).populate('categoryId', 'name');
    
    // Transforma los resultados para obtener el nombre de la categoría en la propiedad categoryName
    const tasksWithCategoryName = tasks.map(task => ({
      ...task.toObject(),
      categoryName: task.categoryId ? task.categoryId.name : null,
    }));
    
    res.send(tasksWithCategoryName);
  } catch (error) {
    console.error(error);
    res.json({ message: 'Ha ocurrido un error, inténtalo de nuevo o verifica tu conexión a internet' });
  }

})

router.get("/getCompletedByIdUser/:id",async (req,res)=>{
  try {
   const { id } = req.params;
   const tasks = await Task.find({ userId: id,isCompleted:true  }).populate('categoryId', 'name');
   
   // Transforma los resultados para obtener el nombre de la categoría en la propiedad categoryName
   const tasksWithCategoryName = tasks.map(task => ({
     ...task.toObject(),
     categoryName: task.categoryId ? task.categoryId.name : null,
   }));
   
   res.send(tasksWithCategoryName);
 } catch (error) {
   console.error(error);
   res.json({ message: 'Ha ocurrido un error, inténtalo de nuevo o verifica tu conexión a internet' });
 }
})

router.get("/getPendingByIdUser/:id",async (req,res)=>{
  try {
   const { id } = req.params;
   const tasks = await Task.find({ userId: id,isCompleted:false}).populate('categoryId', 'name');
   
   // Transforma los resultados para obtener el nombre de la categoría en la propiedad categoryName
   const tasksWithCategoryName = tasks.map(task => ({
     ...task.toObject(),
     categoryName: task.categoryId ? task.categoryId.name : null,
   }));
   
   res.send(tasksWithCategoryName);
 } catch (error) {
   console.error(error);
   res.json({ message: 'Ha ocurrido un error, inténtalo de nuevo o verifica tu conexión a internet' });
 }

})


module.exports = router;
