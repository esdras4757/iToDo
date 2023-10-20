const Reminder = require("../models/reminder.js");
const router = require("express").Router();

router.post("/addReminder", (req, res) => {
    const { title, userId, description, reminder,type } = req.body;
    const reminderq = new Reminder({
        title,
        description,
        userId,
        reminder,
        type
    });
    reminderq
        .save()
        .then(() => {
            res.status(200).json(reminderq);
        })
        .catch((err) => {
            res.status(500).json({ message: err });
        });
})

module.exports = router;