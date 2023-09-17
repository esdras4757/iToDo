const Note = require("../models/notes");
const router = require("express").Router();

router.get("/getAllByIdUser/:id", async (req, res) => {
  try {
    const note = await Note.find({ userId: req.params.id }).sort({
      createdAt: -1,
    });
    res.json(note);
  } catch (err) {
    res.json({ message: err });
  }
});

router.post("/add", async (req, res) => {
  console.log(req.body);
  const note = new Note({
    title: req.body.title,
    content: req.body.content,
    reminder: req.body.reminder,
    userId: req.body.userId,
    initAt: req.body.initAt,
    endAt: req.body.endAt,
    isImportant: req.body.isImportant,
  });
  try {
    const savedNote = await note.save();
    res.json(savedNote);
  } catch (err) {
    res.json({ message: err });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        content: req.body.content,
        reminder: req.body.reminder,
        userId: req.body.userId,
        initAt: req.body.initAt,
        endAt: req.body.endAt,
        isImportant: req.body.isImportant,
        color:req.body.color
      },
      { new: true }
    );
    res.send(note);
  } catch (err) {
    res.json({ message: err });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    res.send(note);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
