const express = require("express");
const router = express.Router();
const Event = require("../models/event");

router.post("/add", (req, res) => {
  const event = new Event(req.body);
  event
    .save()
    .then((data) => {
        res.json(data);
        
    })
    .catch((err) => {
        res.status(500).json({ message: err });
    });
});


module.exports = router;